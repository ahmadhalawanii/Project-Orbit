from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from orbit.db import get_session
from orbit.models import Portfolio, Evidence
from orbit.schemas import (
    PortfolioView,
    EvidenceCreate,
    EvidenceResponse,
    PortfolioPatch,
)


router = APIRouter()


@router.get("/portfolio/{user_id}", response_model=PortfolioView)
def get_portfolio(user_id: str, session: Session = Depends(get_session)) -> PortfolioView:
    portfolio = session.exec(
        select(Portfolio).where(Portfolio.user_id == user_id)
    ).first()
    if not portfolio:
        return PortfolioView(user_id=user_id)
    return PortfolioView(
        user_id=user_id,
        summary=portfolio.summary,
        target_roles=portfolio.target_roles,
        preferences=portfolio.preferences_json,
        claims=portfolio.claims_json,
        competencies=portfolio.competency_json,
        flags=portfolio.readiness_flags_json,
    )


@router.post("/portfolio/{user_id}/evidence", response_model=EvidenceResponse)
def add_evidence(
    user_id: str,
    payload: EvidenceCreate,
    session: Session = Depends(get_session),
) -> EvidenceResponse:
    evidence = Evidence(user_id=user_id, **payload.model_dump())
    session.add(evidence)
    session.commit()
    session.refresh(evidence)
    return EvidenceResponse(
        id=evidence.id,
        type=evidence.type,
        url=evidence.url,
        label=evidence.label,
        notes=evidence.notes,
        hash=evidence.hash,
    )


@router.post("/portfolio/{user_id}/patch", response_model=PortfolioView)
def patch_portfolio(
    user_id: str,
    payload: PortfolioPatch,
    session: Session = Depends(get_session),
) -> PortfolioView:
    portfolio = session.exec(
        select(Portfolio).where(Portfolio.user_id == user_id)
    ).first()
    if not portfolio:
        portfolio = Portfolio(user_id=user_id)
        session.add(portfolio)
    if payload.summary is not None:
        portfolio.summary = payload.summary
    if payload.target_roles:
        portfolio.target_roles = payload.target_roles
    if payload.preferences:
        portfolio.preferences_json = payload.preferences
    if payload.claims:
        portfolio.claims_json = payload.claims
    if payload.competencies:
        portfolio.competency_json = payload.competencies
    if payload.flags:
        portfolio.readiness_flags_json = payload.flags
    session.commit()
    return PortfolioView(
        user_id=user_id,
        summary=portfolio.summary,
        target_roles=portfolio.target_roles,
        preferences=portfolio.preferences_json,
        claims=portfolio.claims_json,
        competencies=portfolio.competency_json,
        flags=portfolio.readiness_flags_json,
    )
