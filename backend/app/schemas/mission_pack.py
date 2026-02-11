from datetime import datetime
from typing import Any
from pydantic import BaseModel


class MissionPackRead(BaseModel):
    id: str
    slug: str
    name: str
    description: str | None
    schema_json: dict[str, Any]
    is_active: bool
    created_at: datetime | None

    class Config:
        from_attributes = True
