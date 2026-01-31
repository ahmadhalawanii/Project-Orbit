from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import get_settings
from .base import Base
from . import models  # noqa: F401

_settings = get_settings()
_connect_args = {}
if "sqlite" in _settings.database_url:
    _connect_args["check_same_thread"] = False
engine = create_async_engine(
    _settings.database_url,
    echo=_settings.debug,
    connect_args=_connect_args,
)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
