import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from google import genai
from google.genai import types
from pydantic import ValidationError

from app.ai.gateway import AIGateway
from app.ai.gemini_schema import generation_schema
from app.config import Settings
from app.errors import AppError
from app.schemas.project import ProjectAnalysis
from app.schemas.roadmap import RootRoadmapDraft
from app.seed.demo import fixture


def make_gateway(handler, retries=1):
    gateway = AIGateway(
        Settings(
            llm_provider="gemini",
            llm_api_key="",
            llm_model_project_analysis="",
            llm_model_fast="gemini-3.8-flash",
            llm_model_strong="gemini-3.8-flash",
            demo_fixtures=False,
            llm_retries=retries,
        )
    )
    gateway.gemini_client = genai.Client(
        api_key="test-key-not-real",
        vertexai=False,
        http_options=types.HttpOptions(
            async_client_args={"transport": httpx.MockTransport(handler)},
            retry_options=types.HttpRetryOptions(attempts=1),
        ),
    )
    return gateway


def reply(text):
    return httpx.Response(
        200,
        json={
            "candidates": [{"content": {"role": "model", "parts": [{"text": text}]}, "finishReason": "STOP"}],
            "usageMetadata": {"promptTokenCount": 10, "candidatesTokenCount": 10, "totalTokenCount": 20},
        },
    )


async def test_gemini_sdk_json_schema_protocol():
    requests = []

    def handler(request):
        requests.append((str(request.url), json.loads(request.content)))
        return reply(json.dumps(fixture("project_analysis", {"idea": "Fitness app"})))

    gateway = make_gateway(handler)
    try:
        result = await gateway.generate_structured(
            "project_analysis", "system prompt", {"idea": "Fitness app"}, ProjectAnalysis
        )
        assert result.primary_domain == "mobile"
        url, body = requests[0]
        assert "gemini-3.8-flash:generateContent" in url
        assert body["generationConfig"]["responseMimeType"] == "application/json"
        assert body["generationConfig"]["responseJsonSchema"]["additionalProperties"] is False
        assert body["systemInstruction"]["parts"][0]["text"] == "system prompt"
        assert gateway.client is None
    finally:
        await gateway.close()


async def test_root_roadmap_uses_small_schema_but_validates_full_contract():
    requests = []
    draft = fixture("roadmap", {"project": {"primary_domain": "web"}})

    def handler(request):
        requests.append(json.loads(request.content))
        return reply(json.dumps(draft))

    gateway = make_gateway(handler, retries=0)
    try:
        result = await gateway.generate_structured("roadmap", "system", {}, RootRoadmapDraft)
        assert len(result.nodes) >= 12
        schema = requests[0]["generationConfig"]["responseJsonSchema"]
        assert "minItems" not in schema["properties"]["nodes"]
        assert schema["properties"]["nodes"]["type"] == "object"
        assert len(schema["properties"]["nodes"]["required"]) == 12
        assert schema["$defs"]["NodeDraft"]["properties"]["type"]["enum"]
        assert "title" in schema["$defs"]["NodeDraft"]["required"]
        assert "maxLength" not in schema["$defs"]["NodeDraft"]["properties"]["title"]
        assert RootRoadmapDraft.model_json_schema()["properties"]["nodes"]["minItems"] == 12

        draft["nodes"] = draft["nodes"][:3]
        with pytest.raises(AppError) as error:
            await gateway.generate_structured("roadmap", "system", {}, RootRoadmapDraft)
        assert error.value.code == "AI_INVALID_OUTPUT"
    finally:
        await gateway.close()


def test_generation_schema_keeps_local_field_constraints():
    draft = fixture("roadmap", {"project": {"primary_domain": "web"}})
    generation_schema(RootRoadmapDraft)
    draft["nodes"][0]["title"] = "x" * 51
    with pytest.raises(ValidationError):
        RootRoadmapDraft.model_validate(draft)


@pytest.mark.parametrize(
    "status,code",
    [
        (400, "AI_REQUEST_INVALID"),
        (401, "AI_AUTH_FAILED"),
        (403, "AI_AUTH_FAILED"),
        (404, "AI_MODEL_NOT_FOUND"),
        (429, "AI_RATE_LIMITED"),
        (500, "AI_PROVIDER_ERROR"),
        (503, "AI_SERVICE_UNAVAILABLE"),
        (504, "AI_TIMEOUT"),
    ],
)
async def test_gemini_errors_are_safe(status, code):
    def handler(request):
        return httpx.Response(
            status, json={"error": {"code": status, "message": "private key/detail", "status": "ERROR"}}
        )

    gateway = make_gateway(handler)
    try:
        with pytest.raises(AppError) as error:
            await gateway.generate_structured("project_analysis", "system", {}, ProjectAnalysis)
        assert error.value.code == code
        if status == 400:
            assert not error.value.retryable
        if status == 503:
            assert error.value.status == 503
            assert error.value.retryable
            assert "503" in error.value.message
        assert "private key" not in error.value.message
    finally:
        await gateway.close()


async def test_gemini_invalid_output_retry_bounded():
    calls = []

    def handler(request):
        calls.append(1)
        return reply("{bad-json")

    gateway = make_gateway(handler)
    try:
        with pytest.raises(AppError) as error:
            await gateway.generate_structured("project_analysis", "system", {}, ProjectAnalysis)
        assert error.value.code == "AI_INVALID_OUTPUT"
        assert len(calls) == 2
    finally:
        await gateway.close()


@pytest.mark.parametrize("retries", [0, 1])
async def test_gemini_timeout_retry_bounded(retries):
    gateway = make_gateway(lambda request: reply("{}"), retries=retries)
    generate = AsyncMock(
        side_effect=httpx.ReadTimeout("private", request=httpx.Request("POST", "https://example.com"))
    )
    gateway.gemini_client.aio.models.generate_content = generate
    try:
        with pytest.raises(AppError) as error:
            await gateway.generate_structured("project_analysis", "system", {}, ProjectAnalysis)
        assert error.value.code == "AI_TIMEOUT"
        assert generate.await_count == retries + 1
    finally:
        await gateway.close()


async def test_slow_generation_is_cancelled_at_deadline_without_duplicate(caplog):
    gateway = make_gateway(lambda request: reply("{}"), retries=0)
    gateway.settings.llm_timeout_seconds = 0.01
    cancelled = False

    async def slow_response(**kwargs):
        nonlocal cancelled
        try:
            await asyncio.sleep(1)
        except asyncio.CancelledError:
            cancelled = True
            raise

    generate = AsyncMock(side_effect=slow_response)
    gateway.gemini_client.aio.models.generate_content = generate
    try:
        with pytest.raises(AppError) as error:
            await gateway.generate_structured("project_analysis", "private prompt", {}, ProjectAnalysis)
        assert error.value.code == "AI_TIMEOUT"
        assert generate.await_count == 1
        assert cancelled
        assert "ai_operation=project_analysis" in caplog.text
        assert "elapsed_seconds=" in caplog.text
        assert "private prompt" not in caplog.text
        assert "test-key-not-real" not in caplog.text
    finally:
        await gateway.close()


def test_default_ai_budget_allows_one_longer_attempt():
    config = Settings(_env_file=None, llm_api_key="")
    assert config.llm_timeout_seconds == 120
    assert config.llm_retries == 0


@pytest.mark.parametrize("operation,should_timeout", [("project_analysis", True), ("roadmap", False)])
async def test_intake_deadline_does_not_shorten_roadmap(operation, should_timeout):
    gateway = make_gateway(lambda request: reply("{}"), retries=0)
    gateway.settings.llm_timeout_seconds = 1
    gateway.settings.llm_project_analysis_timeout_seconds = 0.01

    async def delayed_response(**kwargs):
        await asyncio.sleep(0.03)
        return SimpleNamespace(
            text=json.dumps(fixture("project_analysis", {"idea": "Fitness app"})), usage_metadata=None
        )

    generate = AsyncMock(side_effect=delayed_response)
    gateway.gemini_client.aio.models.generate_content = generate
    try:
        if should_timeout:
            with pytest.raises(AppError) as error:
                await gateway.generate_structured(operation, "system", {}, ProjectAnalysis)
            assert error.value.code == "AI_TIMEOUT"
        else:
            result = await gateway.generate_structured(operation, "system", {}, ProjectAnalysis)
            assert result.primary_domain == "mobile"
        assert generate.await_count == 1
    finally:
        await gateway.close()


async def test_only_initial_project_analysis_uses_intake_model():
    requests = []

    def handler(request):
        requests.append(str(request.url))
        return reply(json.dumps(fixture("project_analysis", {"idea": "Fitness app"})))

    gateway = make_gateway(handler, retries=0)
    gateway.settings.llm_model_project_analysis = "gemini-3.5-flash-lite"
    operations = [
        "project_analysis",
        "discovery",
        "roadmap",
        "submap",
        "adaptive_roadmap",
        "assessment",
        "node_content",
        "advisor",
    ]
    try:
        for operation in operations:
            await gateway.generate_structured(operation, "system", {}, ProjectAnalysis)
        assert "gemini-3.5-flash-lite:generateContent" in requests[0]
        assert all("gemini-3.8-flash:generateContent" in url for url in requests[1:])
    finally:
        await gateway.close()


async def test_required_root_slots_decode_to_public_node_array():
    draft = fixture("roadmap", {"project": {"primary_domain": "web"}})
    expected = draft["nodes"][:12]
    draft["nodes"] = {f"stage{i:02d}": node for i, node in enumerate(expected, 1)}
    draft["edges"] = [{"source": "stage01", "target": "stage02", "kind": "requires"}]
    gateway = make_gateway(lambda _: reply(json.dumps(draft)), retries=0)
    try:
        result = await gateway.generate_structured("roadmap", "system", {}, RootRoadmapDraft)
        assert [node.key for node in result.nodes] == [node['key'] for node in expected]
        assert isinstance(result.model_dump()['nodes'], list)
        assert result.edges[0].source == expected[0]['key']
        assert result.edges[0].target == expected[1]['key']
    finally:
        await gateway.close()
