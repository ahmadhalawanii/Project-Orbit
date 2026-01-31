from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from orbit.db import get_session
from orbit.models import Message, Portfolio, MissionRun, Score
from orbit.schemas import MetricsResponse


router = APIRouter()


@router.get("/metrics/hr", response_model=MetricsResponse)
def hr_metrics(session: Session = Depends(get_session)) -> MetricsResponse:
    total_conversations = len(session.exec(select(Message.conversation_id)).all())
    total_portfolios = len(session.exec(select(Portfolio.id)).all())
    total_mission_runs = len(session.exec(select(MissionRun.id)).all())
    scores = session.exec(select(Score.total_0_10)).all()
    avg_score = sum(scores) / len(scores) if scores else 0.0
    return MetricsResponse(
        total_conversations=total_conversations,
        total_portfolios=total_portfolios,
        total_mission_runs=total_mission_runs,
        avg_score=avg_score,
    )
