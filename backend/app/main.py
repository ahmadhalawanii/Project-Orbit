import uuid
import shutil
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.api.v1 import api_router
from app.db.base import Base
from app.db import models  # noqa: F401
from app.db.models import MissionPack

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
def init_db_and_seed() -> None:
    settings = get_settings()
    # One-time safe migration for renamed local SQLite file.
    legacy_db = Path("data/friend-orbit.db")
    current_db = Path("data/orbit.db")
    if not current_db.exists() and legacy_db.exists():
        current_db.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(legacy_db, current_db)

    engine = create_engine(
        settings.get_database_url_sync(),
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)

    if "sqlite" in settings.database_url:
        with engine.connect() as conn:
            r = conn.execute(text("PRAGMA table_info(applications)"))
            cols = [row[1] for row in r]
            if "cv_file_path" not in cols:
                conn.execute(text("ALTER TABLE applications ADD COLUMN cv_file_path VARCHAR(512)"))
                conn.commit()
            if "cv_extracted_text" not in cols:
                conn.execute(text("ALTER TABLE applications ADD COLUMN cv_extracted_text TEXT"))
                conn.commit()
            r = conn.execute(text("PRAGMA table_info(saturn_decision_packs)"))
            saturn_cols = [row[1] for row in r]
            if "transcript_text" not in saturn_cols:
                conn.execute(text("ALTER TABLE saturn_decision_packs ADD COLUMN transcript_text TEXT"))
                conn.commit()

    with Session(engine) as session:
        existing = session.execute(select(MissionPack).limit(1)).scalar_one_or_none()
        if not existing:
            packs = [
                ("ai-data-ml", "AI / Data Science / ML Engineer", "Machine learning, data pipelines, and AI systems."),
                ("geospatial", "Geospatial / Space-data Analyst", "Maps, GIS, and space-derived data analysis."),
                ("marketing", "Marketing / Growth", "Brand, growth, and demand generation."),
                ("operations", "Operations / Program Management", "Program delivery and operations."),
                ("product", "Product Manager", "Product strategy and roadmaps."),
                ("sales", "Sales / Business Development", "Revenue and partnerships."),
                ("satcom", "Satellite Communications / Network Engineer", "Satcom and network systems."),
                ("software-backend", "Software Engineer (backend/full-stack)", "Backend and full-stack development."),
            ]
            for slug, name, description in packs:
                session.add(
                    MissionPack(
                        id=str(uuid.uuid4()),
                        slug=slug,
                        name=name,
                        description=description,
                        schema_json={},
                        is_active=True,
                    )
                )
            session.commit()


@app.get("/health")
def health():
    return {"status": "ok"}
