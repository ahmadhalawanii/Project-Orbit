"""Seed default mission packs (roles). Run from backend/: python -m scripts.seed_mission_packs"""
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings
from app.db.base import Base
from app.db import models  # noqa: F401
from app.db.models import MissionPack
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

DEFAULT_PACKS = [
    ("ai-data-ml", "AI / Data Science / ML Engineer", "Machine learning, data pipelines, and AI systems."),
    ("geospatial", "Geospatial / Space-data Analyst", "Maps, GIS, and space-derived data analysis."),
    ("marketing", "Marketing / Growth", "Brand, growth, and demand generation."),
    ("operations", "Operations / Program Management", "Program delivery and operations."),
    ("product", "Product Manager", "Product strategy and roadmaps."),
    ("sales", "Sales / Business Development", "Revenue and partnerships."),
    ("satcom", "Satellite Communications / Network Engineer", "Satcom and network systems."),
    ("software-backend", "Software Engineer (backend/full-stack)", "Backend and full-stack development."),
]


if __name__ == "__main__":
    settings = get_settings()
    engine = create_engine(settings.get_database_url_sync(), connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    with Session(engine) as session:
        for slug, name, description in DEFAULT_PACKS:
            existing = session.execute(select(MissionPack).where(MissionPack.slug == slug)).scalar_one_or_none()
            if existing:
                continue
            pack = MissionPack(
                id=str(uuid.uuid4()),
                slug=slug,
                name=name,
                description=description,
                schema_json={},
                is_active=True,
            )
            session.add(pack)
        session.commit()
    print("Mission packs seeded.")
