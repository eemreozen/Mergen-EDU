import json
from unittest.mock import AsyncMock

import httpx
import pytest
from openai import APITimeoutError, AsyncOpenAI

from app.ai.gateway import AIGateway
from app.config import Settings
from app.errors import AppError
from app.schemas.project import ProjectAnalysis
from app.seed.demo import fixture


def settings(**kwargs):
    return Settings(
        llm_provider="openai",
        llm_api_key="test-secret-not-real",
        llm_model_project_analysis="",
        llm_model_fast="configured-fast",
        llm_model_strong="configured-strong",
        demo_fixtures=False,
        **kwargs,
    )


async def test_official_sdk_structured_output_protocol():
    requests = []
    output = fixture("project_analysis", {"idea": "Fitness app"})

    def handler(request):
        requests.append(json.loads(request.content))
        return httpx.Response(
            200,
            json={
                "id": "resp_test",
                "object": "response",
                "created_at": 1,
                "status": "completed",
                "model": "configured-fast",
                "output": [
                    {
                        "id": "msg_test",
                        "type": "message",
                        "role": "assistant",
                        "status": "completed",
                        "content": [{"type": "output_text", "text": json.dumps(output), "annotations": []}],
                    }
                ],
                "usage": {"input_tokens": 10, "output_tokens": 10, "total_tokens": 20},
            },
        )

    gateway = AIGateway(settings())
    await gateway.close()
    gateway.client = AsyncOpenAI(
        api_key="test-not-real", http_client=httpx.AsyncClient(transport=httpx.MockTransport(handler))
    )
    try:
        result = await gateway.generate_structured(
            "project_analysis", "system", {"idea": "Fitness app"}, ProjectAnalysis
        )
        assert result.primary_domain == "mobile"
        assert requests[0]["model"] == "configured-fast"
        assert requests[0]["text"]["format"]["type"] == "json_schema"
        assert requests[0]["text"]["format"]["strict"]
        assert requests[0]["store"] is False
        assert requests[0]["text"]["format"]["schema"]["additionalProperties"] is False
    finally:
        await gateway.close()


@pytest.mark.parametrize(
    "kind,code,status",
    [(401, "AI_AUTH_FAILED", 502), (429, "AI_RATE_LIMITED", 503), (500, "AI_PROVIDER_ERROR", 502)],
)
async def test_provider_errors_are_sanitized(kind, code, status):
    gateway = AIGateway(settings())
    await gateway.close()

    def handler(request):
        return httpx.Response(
            kind,
            json={"error": {"message": "private provider detail: test-secret-not-real", "type": "api_error"}},
        )

    gateway.client = AsyncOpenAI(
        api_key="test-not-real",
        max_retries=0,
        http_client=httpx.AsyncClient(transport=httpx.MockTransport(handler)),
    )
    try:
        with pytest.raises(AppError) as error:
            await gateway.generate_structured("project_analysis", "system", {}, ProjectAnalysis)
        assert error.value.code == code and error.value.status == status
        assert "private provider" not in error.value.message
    finally:
        await gateway.close()


async def test_invalid_json_retry_is_bounded():
    calls = []

    def handler(request):
        calls.append(1)
        return httpx.Response(
            200,
            json={
                "id": "r",
                "object": "response",
                "created_at": 1,
                "status": "completed",
                "model": "m",
                "output": [
                    {
                        "id": "msg",
                        "type": "message",
                        "role": "assistant",
                        "status": "completed",
                        "content": [{"type": "output_text", "text": "{bad json", "annotations": []}],
                    }
                ],
            },
        )

    gateway = AIGateway(settings(llm_retries=1))
    await gateway.close()
    gateway.client = AsyncOpenAI(
        api_key="test", max_retries=0, http_client=httpx.AsyncClient(transport=httpx.MockTransport(handler))
    )
    try:
        with pytest.raises(AppError) as error:
            await gateway.generate_structured("project_analysis", "system", {}, ProjectAnalysis)
        assert error.value.code == "AI_INVALID_OUTPUT"
        assert len(calls) == 2
    finally:
        await gateway.close()


async def test_timeout_retry_is_bounded():
    gateway = AIGateway(settings(llm_retries=1))
    gateway.client.responses.parse = AsyncMock(
        side_effect=APITimeoutError(request=httpx.Request("POST", "https://api.openai.com"))
    )
    try:
        with pytest.raises(AppError) as error:
            await gateway.generate_structured("project_analysis", "system", {}, ProjectAnalysis)
        assert error.value.code == "AI_TIMEOUT"
        assert gateway.client.responses.parse.await_count == 2
    finally:
        await gateway.close()
