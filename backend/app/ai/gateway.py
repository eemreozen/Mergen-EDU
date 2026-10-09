import asyncio
import json
import logging
from time import monotonic

import httpx
from google import genai
from google.genai import errors as gemini_errors
from google.genai import types as gemini_types
from openai import APIError, APITimeoutError, AsyncOpenAI, AuthenticationError, OpenAIError, RateLimitError
from pydantic import ValidationError

from app.ai.gemini_schema import generation_schema
from app.errors import AppError

logger = logging.getLogger(__name__)


class AIGateway:
    def __init__(self, settings):
        self.settings = settings
        self.is_demo = settings.demo_fixtures
        self.client = None
        self.gemini_client = None
        if settings.llm_api_key.get_secret_value() and not self.is_demo:
            if settings.llm_provider == "gemini":
                self.gemini_client = genai.Client(
                    api_key=settings.llm_api_key.get_secret_value(),
                    vertexai=False,
                    http_options=gemini_types.HttpOptions(
                        timeout=int(settings.llm_timeout_seconds * 1000),
                        retry_options=gemini_types.HttpRetryOptions(attempts=1),
                    ),
                )
            elif settings.llm_provider == "openai":
                self.client = AsyncOpenAI(
                    api_key=settings.llm_api_key.get_secret_value(),
                    timeout=settings.llm_timeout_seconds,
                    max_retries=0,
                )

    async def close(self):
        if self.client:
            await self.client.close()
        if self.gemini_client:
            await self.gemini_client.aio.aclose()
            self.gemini_client.close()

    async def generate_structured(self, operation, system_prompt, payload, response_model):
        if self.is_demo:
            from app.seed.demo import fixture

            return response_model.model_validate(fixture(operation, payload))
        model = (
            self.settings.llm_model_strong
            if operation in {"roadmap", "submap", "adaptive_roadmap"}
            else self.settings.llm_model_fast
        )
        if operation == "project_analysis" and self.settings.llm_model_project_analysis:
            model = self.settings.llm_model_project_analysis
        if self.settings.llm_provider not in {"openai", "gemini"}:
            raise AppError("LLM_PROVIDER_UNSUPPORTED", "Gemini veya OpenAI sağlayıcısını seçin.", 503)
        if not (self.client or self.gemini_client) or not model:
            raise AppError("AI_NOT_CONFIGURED", "LLM_API_KEY ve model ayarlarını yapılandırın.", 503)
        max_tokens = (
            self.settings.llm_max_output_tokens_strong
            if operation in {"roadmap", "submap", "adaptive_roadmap"}
            else self.settings.llm_max_output_tokens_fast
        )
        if operation == "memory_review":
            max_tokens = min(max_tokens, 1500)
        timeout_seconds = self.settings.llm_timeout_seconds
        if operation in {"project_analysis", "memory_review"}:
            timeout_seconds = min(timeout_seconds, self.settings.llm_project_analysis_timeout_seconds)
        for attempt in range(self.settings.llm_retries + 1):
            started = monotonic()
            try:
                async with asyncio.timeout(timeout_seconds):
                    if self.gemini_client:
                        result = await self.gemini_client.aio.models.generate_content(
                            model=model,
                            contents=json.dumps(payload, ensure_ascii=False),
                            config=gemini_types.GenerateContentConfig(
                                max_output_tokens=max_tokens,
                                thinking_config=gemini_types.ThinkingConfig(thinking_level="low"),
                                system_instruction=system_prompt,
                                response_mime_type="application/json",
                                response_json_schema=generation_schema(response_model),
                            ),
                        )
                        logger.info(
                            "ai_provider=gemini ai_operation=%s usage=%s",
                            operation,
                            result.usage_metadata.model_dump() if result.usage_metadata else None,
                        )
                        if not result.text:
                            raise ValueError("No structured output")
                        return response_model.model_validate_json(result.text)
                    result = await self.client.responses.parse(
                        model=model,
                        store=False,
                        max_output_tokens=max_tokens,
                        input=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
                        ],
                        text_format=response_model,
                    )
                logger.info(
                    "ai_operation=%s usage=%s", operation, result.usage.model_dump() if result.usage else None
                )
                if result.output_parsed is None:
                    raise ValueError("No structured output")
                return response_model.model_validate(result.output_parsed.model_dump())
            except AuthenticationError:
                raise AppError(
                    "AI_AUTH_FAILED", "AI sağlayıcısı kimlik doğrulamasını reddetti.", 502
                ) from None
            except (APITimeoutError, TimeoutError, httpx.TimeoutException):
                logger.warning(
                    "ai_provider=%s ai_operation=%s model=%s elapsed_seconds=%.2f failure=timeout attempt=%d",
                    self.settings.llm_provider,
                    operation,
                    model,
                    monotonic() - started,
                    attempt + 1,
                )
                if attempt == self.settings.llm_retries:
                    raise AppError("AI_TIMEOUT", "AI isteği zaman aşımına uğradı.", 504, True) from None
            except (ValidationError, ValueError):
                if attempt == self.settings.llm_retries:
                    raise AppError("AI_INVALID_OUTPUT", "AI yanıtı sözleşmeye uymuyor.", 502, True) from None
            except RateLimitError:
                raise AppError(
                    "AI_RATE_LIMITED", "AI sağlayıcısı kullanım sınırına ulaştı.", 503, True
                ) from None
            except gemini_errors.APIError as exc:
                logger.warning(
                    "ai_provider=gemini ai_operation=%s model=%s elapsed_seconds=%.2f provider_status=%s",
                    operation,
                    model,
                    monotonic() - started,
                    exc.code,
                )
                if exc.code == 503:
                    raise AppError(
                        "AI_SERVICE_UNAVAILABLE",
                        "Gemini servisi şu anda geçici olarak kullanılamıyor (503). Bir süre sonra tekrar deneyin.",
                        503,
                        True,
                    ) from None
                if exc.code in {408, 504}:
                    raise AppError(
                        "AI_TIMEOUT",
                        "AI sağlayıcısı zamanında yanıt vermedi. Tekrar deneyebilirsiniz.",
                        504,
                        True,
                    ) from None
                if exc.code in {401, 403}:
                    raise AppError(
                        "AI_AUTH_FAILED", "Gemini API anahtarı veya erişim yetkisi geçersiz.", 502
                    ) from None
                if exc.code == 429:
                    raise AppError("AI_RATE_LIMITED", "Gemini kullanım sınırına ulaştı.", 503, True) from None
                if exc.code == 404:
                    raise AppError(
                        "AI_MODEL_NOT_FOUND", "Gemini model adı bulunamadı veya erişime açık değil.", 502
                    ) from None
                if exc.code == 400:
                    raise AppError(
                        "AI_REQUEST_INVALID",
                        "Gemini istek biçimini reddetti (400). Sunucu yapılandırması kontrol edilmeli.",
                        502,
                    ) from None
                raise AppError("AI_PROVIDER_ERROR", "Gemini isteği tamamlayamadı.", 502, True) from None
            except httpx.TransportError:
                raise AppError("AI_PROVIDER_ERROR", "AI sağlayıcısına bağlanılamadı.", 502, True) from None
            except (APIError, OpenAIError):
                raise AppError(
                    "AI_PROVIDER_ERROR", "AI sağlayıcısı isteği tamamlayamadı.", 502, True
                ) from None

    async def generate_text(self, operation, system_prompt, payload):
        from app.schemas.advisor import AdvisorReply

        return (await self.generate_structured(operation, system_prompt, payload, AdvisorReply)).reply
