from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from orbit.agents.interview_agent import build_interview_plan, build_decision_pack
from orbit.db import get_session
from orbit.models import InterviewSession, Portfolio
from orbit.schemas import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    InterviewFinalizeResponse,
)


router = APIRouter()


@router.post("/interview/start", response_model=InterviewStartResponse)
def start_interview(
    payload: InterviewStartRequest, session: Session = Depends(get_session)
) -> InterviewStartResponse:
    portfolio = session.exec(
        select(Portfolio).where(Portfolio.user_id == payload.user_id)
    ).first()
    portfolio_view = (
        {
            "summary": portfolio.summary if portfolio else "",
            "target_roles": portfolio.target_roles if portfolio else [],
            "claims": portfolio.claims_json if portfolio else [],
        }
    )
    plan = build_interview_plan(portfolio_view, payload.job_family)
    interview = InterviewSession(
        user_id=payload.user_id, job_family=payload.job_family, plan_json=plan
    )
    session.add(interview)
    session.commit()
    session.refresh(interview)
    next_q = plan.get("questions", ["Tell me about yourself."])[0]
    return InterviewStartResponse(interview_id=interview.id, next_question=next_q)


@router.post("/interview/{interview_id}/answer", response_model=InterviewAnswerResponse)
def answer_interview(
    interview_id: int,
    payload: InterviewAnswerRequest,
    session: Session = Depends(get_session),
) -> InterviewAnswerResponse:
    interview = session.get(InterviewSession, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    answers = interview.answers_json
    answers.append({"answer": payload.answer})
    interview.answers_json = answers
    session.commit()
    questions = interview.plan_json.get("questions", [])
    next_index = len(answers)
    if next_index >= len(questions):
        return InterviewAnswerResponse(next_question=None, done=True)
    return InterviewAnswerResponse(next_question=questions[next_index], done=False)


@router.post("/interview/{interview_id}/finalize", response_model=InterviewFinalizeResponse)
def finalize_interview(
    interview_id: int, session: Session = Depends(get_session)
) -> InterviewFinalizeResponse:
    interview = session.get(InterviewSession, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    portfolio = session.exec(
        select(Portfolio).where(Portfolio.user_id == interview.user_id)
    ).first()
    portfolio_view = (
        {
            "summary": portfolio.summary if portfolio else "",
            "target_roles": portfolio.target_roles if portfolio else [],
            "claims": portfolio.claims_json if portfolio else [],
        }
    )
    decision_pack = build_decision_pack(portfolio_view, interview.answers_json)
    interview.decision_pack_json = decision_pack
    session.commit()
    return InterviewFinalizeResponse(decision_pack=decision_pack)
