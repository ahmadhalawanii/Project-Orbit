from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.base import Base
from app.db.models import MissionPack


def init_db_and_seed() -> None:
    settings = get_settings()
    engine = create_engine(settings.get_database_url_sync(), connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    with Session(engine) as session:
        # If any mission pack exists, skip seeding.
        existing = session.execute(select(MissionPack.id).limit(1)).first()
        if existing is not None:
            return
        packs = [
            MissionPack(
                id="engineering",
                slug="engineering",
                name="Engineering Mission Pack",
                description="Backend, frontend, data, platform delivery.",
                schema_json={"deliverables": ["Repo or PR link", "Short doc", "Reflection"]},
                is_active=True,
            ),
            MissionPack(
                id="marketing",
                slug="marketing",
                name="Marketing Mission Pack",
                description="Growth, content, brand, demand gen.",
                schema_json={"deliverables": ["Campaign brief", "Asset links", "Reflection"]},
                is_active=True,
            ),
        ]
        for pack in packs:
            session.add(pack)
        session.commit()
