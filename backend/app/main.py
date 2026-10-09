from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException

from app.ai.gateway import AIGateway
from app.api.v1.router import router
from app.config import Settings
from app.db.session import make_database
from app.errors import AppError
from app.schemas.common import Health
from app.services.web_resource_service import WebResourceService


def create_app(settings=None, gateway=None):
    settings = settings or Settings()
    engine, sessions = make_database(settings.database_url)
    ai = gateway or AIGateway(settings)

    @asynccontextmanager
    async def lifespan(app):
        yield
        await ai.close()
        await engine.dispose()

    app = FastAPI(
        title="Mergen API",
        version="1.0.0",
        description="Adaptif öğrenme ve proje geliştirme API",
        lifespan=lifespan,
    )
    app.state.settings, app.state.engine = settings, engine
    app.state.session_factory, app.state.gateway = sessions, ai
    app.state.resource_search = WebResourceService()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[s.strip() for s in settings.cors_origins.split(",") if s.strip()],
        allow_methods=["GET", "POST", "PATCH"],
        allow_headers=["Content-Type", "X-Demo-Session"],
    )

    @app.exception_handler(AppError)
    async def app_error(request: Request, exc: AppError):
        return JSONResponse(
            status_code=exc.status,
            content={"error": {"code": exc.code, "message": exc.message, "retryable": exc.retryable}},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request, exc):
        return await app_error(
            request, AppError("VALIDATION_ERROR", "İstek alanları sözleşmeye uymuyor.", 422)
        )

    @app.exception_handler(HTTPException)
    async def http_error(request, exc):
        return await app_error(request, AppError("HTTP_ERROR", str(exc.detail), exc.status_code))

    @app.exception_handler(SQLAlchemyError)
    async def database_error(request, exc):
        return await app_error(
            request, AppError("DATABASE_ERROR", "Veritabanı işlemi tamamlanamadı.", 503, True)
        )

    @app.get("/health", response_model=Health)
    @app.get("/api/v1/health", response_model=Health)
    async def health():
        async with sessions() as db:
            await db.execute(text("SELECT 1"))
        return Health(
            ai_configured=bool(
                settings.llm_api_key.get_secret_value()
                and settings.llm_model_fast
                and settings.llm_model_strong
            ),
            demo_fixtures=settings.demo_fixtures,
        )

    app.include_router(router)
    return app


app = create_app()
