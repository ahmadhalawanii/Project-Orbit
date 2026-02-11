import os
from typing import Generator

from sqlmodel import SQLModel, Session, create_engine, select

from orbit.models import MissionPack


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/orbit.db")

engine = create_engine(DATABASE_URL, echo=False)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    _seed_mission_packs()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def _seed_mission_packs() -> None:
    with Session(engine) as session:
        existing = session.exec(select(MissionPack)).first()
        if existing:
            return
        packs = [
            MissionPack(
                job_family="engineering",
                brief_md=(
                    "Build a small service feature and document decisions. "
                    "Deliver a PR link, short doc, and reflection."
                ),
                deliverables_json=[
                    "GitHub repo or PR link",
                    "Short design/decision doc",
                    "Reflection on tradeoffs",
                ],
                allowed_artifacts_json=["github", "doc", "reflection"],
                rubric_mapping_json={
                    "output_quality": "Code quality + correctness",
                    "impact": "User impact + scope",
                    "collaboration": "Communication + feedback handling",
                    "ownership": "End-to-end responsibility",
                    "communication": "Clarity in docs and updates",
                },
            ),
            MissionPack(
                job_family="marketing",
                brief_md=(
                    "Design a campaign brief and execution plan. "
                    "Deliver a doc link, assets, and reflection."
                ),
                deliverables_json=[
                    "Campaign brief doc",
                    "Asset links or drafts",
                    "Reflection on target audience",
                ],
                allowed_artifacts_json=["doc", "asset", "reflection"],
                rubric_mapping_json={
                    "output_quality": "Quality of assets + clarity",
                    "impact": "Expected reach + relevance",
                    "collaboration": "Alignment + stakeholder input",
                    "ownership": "Planning and execution detail",
                    "communication": "Narrative + positioning",
                },
            ),
        ]
        for pack in packs:
            session.add(pack)
        session.commit()
