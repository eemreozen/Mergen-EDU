from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.models.project import User


async def get_db(request: Request):
    async with request.app.state.session_factory() as session:
        try:
            if session.bind.dialect.name == "sqlite":
                from sqlalchemy import text

                await session.execute(text("BEGIN IMMEDIATE"))
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


Db = Annotated[AsyncSession, Depends(get_db, scope="function")]


async def current_user(request: Request, db: Db, x_demo_session: Annotated[str | None, Header()] = None):
    if not request.app.state.settings.demo_mode:
        raise AppError("AUTH_REQUIRED", "Gerçek kimlik doğrulama henüz yapılandırılmadı.", 401)
    try:
        identifier = str(UUID(x_demo_session or ""))
    except ValueError:
        raise AppError(
            "DEMO_SESSION_REQUIRED", "X-Demo-Session başlığında kalıcı bir UUID gönderin.", 401
        ) from None
    user = await db.scalar(select(User).where(User.id == identifier))
    if not user:
        # INSERT ... ON CONFLICT, eşzamanlı ilk isteklerde aynı kullanıcıyı güvenle oluşturur.
        from sqlalchemy.dialects.postgresql import insert as pg_insert
        from sqlalchemy.dialects.sqlite import insert as sqlite_insert

        insert = sqlite_insert if db.bind.dialect.name == "sqlite" else pg_insert
        await db.execute(
            insert(User).values(id=identifier, locale="tr").on_conflict_do_nothing(index_elements=["id"])
        )
    return identifier


UserId = Annotated[str, Depends(current_user)]


def get_gateway(request: Request):
    return request.app.state.gateway


Gateway = Annotated[object, Depends(get_gateway)]
