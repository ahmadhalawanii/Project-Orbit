"""Rubric score per application: GET or calculate (mock)."""
import uuid
import random
from datetime import datetime
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.db.models import Application, Conversation, Evidence, RubricScore
from app.api.deps import AsyncDb
from app.ai import score_application
from app.config import get_settings
from pydantic import BaseModel

router = APIRouter(prefix="/applications", tags=["rubric"])


class CriteriaScore(BaseModel):
    name: str
    score: int
    max: int


class RubricScoreRead(BaseModel):
    id: str
    application_id: str
    overall_score: str | None
    criteria_scores: list[dict] | None
    scored_at: datetime | None

    class Config:
        from_attributes = True


DEFAULT_CRITERIA = [
    {"name": "Relevance to role", "max": 10},
    {"name": "Experience depth", "max": 10},
    {"name": "Evidence quality", "max": 10},
    {"name": "Communication", "max": 10},
    {"name": "Overall fit", "max": 10},
]


def _normalize_scores(
    scores: list[dict] | None,
    template: list[dict],
) -> list[dict]:
    if not scores:
        return []
    normalized = []
    template_map = {t["name"]: t["max"] for t in template}
    for item in scores:
        name = item.get("name")
        score = item.get("score")
        max_score = item.get("max") or template_map.get(name, 10)
        if name is None or score is None:
            continue
        normalized.append({"name": name, "score": int(score), "max": int(max_score)})
    return normalized


@router.get("/{application_id}/score", response_model=RubricScoreRead)
async def get_score(application_id: str, db: AsyncDb):
    result = await db.execute(
        select(RubricScore).where(RubricScore.application_id == application_id)
    )
    score = result.scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=404, detail="Score not found. Calculate it first.")
    return score


@router.post("/{application_id}/score", response_model=RubricScoreRead)
async def calculate_score(application_id: str, db: AsyncDb):
    try:
        app_result = await db.execute(select(Application).where(Application.id == application_id))
        app = app_result.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        result = await db.execute(
            select(RubricScore).where(RubricScore.application_id == application_id)
        )
        existing = result.scalar_one_or_none()
        if existing:
            return RubricScoreRead(
                id=existing.id,
                application_id=existing.application_id,
                overall_score=existing.overall_score,
                criteria_scores=existing.criteria_scores or [],
                scored_at=existing.scored_at,
            )

        conv_result = await db.execute(
            select(Conversation).where(Conversation.application_id == application_id)
        )
        conv = conv_result.scalar_one_or_none()
        messages = (conv.messages_json or []) if conv else []

        evidence_result = await db.execute(
            select(Evidence).where(Evidence.application_id == application_id)
        )
        evidence_rows = evidence_result.scalars().all()
        evidence_links = [
            {"kind": e.kind, "title": e.title, "url_or_path": e.url_or_path}
            for e in evidence_rows
        ]

        settings = get_settings()
        ai_result = score_application(
            evidence_links,
            messages,
            openai_api_key=settings.openai_api_key,
            mock_ai=settings.mock_ai,
            criteria_template=DEFAULT_CRITERIA,
        )
        criteria_scores = _normalize_scores(
            ai_result.get("criteria_scores"),
            DEFAULT_CRITERIA,
        )
        overall_score = ai_result.get("overall_score")

        if not criteria_scores or not overall_score:
            random.seed(hash(application_id) % (2**32))
            criteria_scores = []
            total = 0
            total_max = 0
            for c in DEFAULT_CRITERIA:
                s = random.randint(4, c["max"])
                criteria_scores.append({"name": c["name"], "score": s, "max": c["max"]})
                total += s
                total_max += c["max"]
            pct = round(100 * total / total_max) if total_max else 0
            overall_score = f"{pct}%"

        rubric = RubricScore(
            id=str(uuid.uuid4()),
            application_id=application_id,
            overall_score=overall_score,
            criteria_scores=criteria_scores,
        )
        db.add(rubric)
        await db.flush()
        await db.refresh(rubric)
        return RubricScoreRead(
            id=rubric.id,
            application_id=rubric.application_id,
            overall_score=rubric.overall_score,
            criteria_scores=rubric.criteria_scores or [],
            scored_at=rubric.scored_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        from fastapi import HTTPException as HTTPEx
        raise HTTPEx(status_code=500, detail=f"Score calculation failed: {str(e)}")
