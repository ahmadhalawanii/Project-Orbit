"""Rubric score per application: GET or calculate."""
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.db.models import Application, RubricScore, Evidence
from app.api.deps import AsyncDb
from pydantic import BaseModel
from app.ai.scoring_agent import score_mission

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

        evidence_result = await db.execute(
            select(Evidence).where(Evidence.application_id == application_id)
        )
        evidence_items = [
            {"title": e.title, "url": e.url_or_path, "kind": e.kind}
            for e in evidence_result.scalars().all()
        ]
        score_data = score_mission(evidence_items, reflection="Candidate evidence review.")
        total_0_10 = score_data.get("total_0_10", 5.0)
        overall_score = f"{round(float(total_0_10) * 10)}%"
        subscores = score_data.get("subscores", {})
        criteria_scores = []
        for name, value in subscores.items():
            try:
                score_val = int(float(value))
            except (TypeError, ValueError):
                score_val = 5
            criteria_scores.append({"name": str(name), "score": score_val, "max": 10})
        if not criteria_scores:
            criteria_scores = [
                {"name": "Overall fit", "score": int(float(total_0_10)), "max": 10}
            ]

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
