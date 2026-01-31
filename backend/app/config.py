from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Orbit API"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./orbit.db"
    database_url_sync: str | None = None

    def get_database_url_sync(self) -> str:
        if self.database_url_sync:
            return self.database_url_sync
        if "sqlite" in self.database_url:
            return self.database_url.replace("+aiosqlite", "").replace("sqlite+aiosqlite", "sqlite")
        return self.database_url.replace("+asyncpg", "")

    secret_key: str = "orbit-demo-secret-change-in-production"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]
    openai_api_key: str | None = None
    mock_ai: bool = True
    uploads_dir: str = "uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
