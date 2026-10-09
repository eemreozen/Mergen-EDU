import json
from unittest.mock import AsyncMock

import httpx
import pytest
from google import genai
from google.genai import types

from app.ai.gateway import AIGateway
from app.config import Settings
from app.errors import AppError
from app.schemas.project import ProjectAnalysis
from app.seed.demo import fixture


def make_gateway(handler, retries=1):
    gateway = AIGateway(
        Settings(
            llm_provider="gemini",
            llm_api_key="",
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


@pytest.mark.parametrize(
    "status,code",
    [
        (401, "AI_AUTH_FAILED"),
        (403, "AI_AUTH_FAILED"),
        (404, "AI_MODEL_NOT_FOUND"),
        (429, "AI_RATE_LIMITED"),
        (500, "AI_PROVIDER_ERROR"),
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


async def test_gemini_timeout_retry_bounded():
    gateway = make_gateway(lambda request: reply("{}"))
    generate = AsyncMock(
        side_effect=httpx.ReadTimeout("private", request=httpx.Request("POST", "https://example.com"))
    )
    gateway.gemini_client.aio.models.generate_content = generate
    try:
        with pytest.raises(AppError) as error:
            await gateway.generate_structured("project_analysis", "system", {}, ProjectAnalysis)
        assert error.value.code == "AI_TIMEOUT"
        assert generate.await_count == 2
    finally:
        await gateway.close()
