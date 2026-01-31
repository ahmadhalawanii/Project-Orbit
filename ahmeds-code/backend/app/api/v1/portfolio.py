"""Portfolio per application: GET or generate from conversation."""
import uuid
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.db.models import Application, Conversation, Portfolio, Evidence
from app.api.deps import AsyncDb
from pydantic import BaseModel
from app.ai.portfolio_agent import generate_portfolio_patch

router = APIRouter(prefix="/applications", tags=["portfolio"])


class PortfolioRead(BaseModel):
    id: str
    application_id: str
    summary: str | None
    structured_json: dict | None

    class Config:
        from_attributes = True


@router.get("/{application_id}/portfolio", response_model=PortfolioRead)
async def get_portfolio(application_id: str, db: AsyncDb):
    result = await db.execute(
        select(Portfolio).where(Portfolio.application_id == application_id)
    )
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found. Generate it first.")
    return portfolio


@router.post("/{application_id}/portfolio", response_model=PortfolioRead)
async def generate_portfolio(application_id: str, db: AsyncDb):
    app_result = await db.execute(select(Application).where(Application.id == application_id))
    app = app_result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    result = await db.execute(
        select(Portfolio).where(Portfolio.application_id == application_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    conv_result = await db.execute(
        select(Conversation).where(Conversation.application_id == application_id)
    )
    conv = conv_result.scalar_one_or_none()
    messages = (conv.messages_json or []) if conv else []
    evidence_result = await db.execute(
        select(Evidence).where(Evidence.application_id == application_id)
    )
    evidence_items = [
        {"title": e.title, "url": e.url_or_path, "kind": e.kind}
        for e in evidence_result.scalars().all()
    ]
    patch = generate_portfolio_patch(messages, evidence_items)
    summary = patch.get("summary") or "Candidate portfolio summary."
    structured_json = patch

    portfolio = Portfolio(
        id=str(uuid.uuid4()),
        application_id=application_id,
        summary=summary,
        structured_json=structured_json,
    )
    db.add(portfolio)
    await db.flush()
    await db.refresh(portfolio)
    return portfolio
