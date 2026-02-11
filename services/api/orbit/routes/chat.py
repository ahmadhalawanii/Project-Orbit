from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from orbit.agents.chat_agent import answer_with_citations
from orbit.agents.portfolio_agent import generate_portfolio_patch
from orbit.db import get_session
from orbit.models import Message, User, Portfolio
from orbit.rag.retrieve import retrieve
from orbit.schemas import ChatRequest, ChatResponse, Citation


router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest, session: Session = Depends(get_session)
) -> ChatResponse:
    user = session.get(User, payload.user_id)
    if not user:
        session.add(User(id=payload.user_id))
        session.commit()
    snippets = retrieve(payload.message)
    agent_out = answer_with_citations(payload.message, snippets)
    citations = [
        Citation(**match["metadata"])
        for match in snippets
        if match.get("metadata")
    ]
    session.add(
        Message(
            conversation_id=payload.conversation_id,
            role="user",
            content=payload.message,
            citations_json=[],
        )
    )
    answer = agent_out.get("answer", "No answer returned.")
    session.add(
        Message(
            conversation_id=payload.conversation_id,
            role="assistant",
            content=answer,
            citations_json=[c.model_dump() for c in citations],
        )
    )
    if payload.mode != "explore":
        patch = generate_portfolio_patch(
            recent_messages=[
                {"role": "user", "content": payload.message},
                {"role": "assistant", "content": agent_out["answer"]},
            ],
            evidence_links=[],
        )
        portfolio = session.exec(
            select(Portfolio).where(Portfolio.user_id == payload.user_id)
        ).first()
        if not portfolio:
            portfolio = Portfolio(user_id=payload.user_id)
            session.add(portfolio)
        portfolio.summary = patch.get("summary") or portfolio.summary
        if patch.get("target_roles"):
            portfolio.target_roles = patch["target_roles"]
        if patch.get("preferences"):
            portfolio.preferences_json = patch["preferences"]
        if patch.get("claims"):
            portfolio.claims_json = patch["claims"]
        if patch.get("competencies"):
            portfolio.competency_json = patch["competencies"]
        if patch.get("flags"):
            portfolio.readiness_flags_json = patch["flags"]
    session.commit()
    return ChatResponse(
        answer=answer,
        citations=citations,
        followups=agent_out.get("followups", []),
    )
