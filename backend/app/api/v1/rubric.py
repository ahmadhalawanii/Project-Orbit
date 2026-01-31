"""Rubric score per application: GET or calculate (mock)."""
import uuid
import random
from datetime import datetime
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.db.models import Application, RubricScore
from app.api.deps import AsyncDb
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
