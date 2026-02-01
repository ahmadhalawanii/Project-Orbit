"""Portfolio per application: GET or generate (mock) from conversation."""
import uuid
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.db.models import Application, Conversation, Evidence, Portfolio
from app.api.deps import AsyncDb
from app.ai import generate_portfolio_patch
from app.config import get_settings
from pydantic import BaseModel

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
    evidence_rows = evidence_result.scalars().all()
    evidence_links = [
        {"kind": e.kind, "title": e.title, "url_or_path": e.url_or_path}
        for e in evidence_rows
    ]

    settings = get_settings()
    patch = generate_portfolio_patch(
        messages,
        evidence_links,
        openai_api_key=settings.openai_api_key,
        mock_ai=settings.mock_ai,
    )

    user_text = " ".join(
        m.get("content", "") for m in messages if m.get("role") == "user"
    ).strip()
    summary = patch.get("summary") or (
        f"Candidate portfolio for this application. "
        f"From conversation: {user_text[:500]}{'…' if len(user_text) > 500 else ''}"
        if user_text
        else "Candidate portfolio for this application."
    )
    structured_json = {
        "highlights": patch.get("highlights") or ([user_text[:200]] if user_text else []),
        "skills": patch.get("skills") or [],
        "experience": patch.get("experience") or [],
        "source": patch.get("source") or "generated",
    }

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
