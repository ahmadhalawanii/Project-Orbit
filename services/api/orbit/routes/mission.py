from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from orbit.agents.scoring_agent import score_mission
from orbit.db import get_session
from orbit.models import MissionPack, MissionRun, Score
from orbit.schemas import (
    MissionPackView,
    MissionRunStart,
    MissionRunStartResponse,
    MissionArtifactsSubmit,
    MissionScoreResponse,
)


router = APIRouter()


@router.get("/mission/packs", response_model=list[MissionPackView])
def list_packs(session: Session = Depends(get_session)) -> list[MissionPackView]:
    packs = session.exec(select(MissionPack)).all()
    return [
        MissionPackView(
            id=pack.id,
            job_family=pack.job_family,
            brief_md=pack.brief_md,
            deliverables=pack.deliverables_json,
            allowed_artifacts=pack.allowed_artifacts_json,
            rubric_mapping=pack.rubric_mapping_json,
        )
        for pack in packs
    ]


@router.get("/mission/packs/{job_family}", response_model=MissionPackView)
def get_pack(job_family: str, session: Session = Depends(get_session)) -> MissionPackView:
    pack = session.exec(
        select(MissionPack).where(MissionPack.job_family == job_family)
    ).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Mission pack not found")
    return MissionPackView(
        id=pack.id,
        job_family=pack.job_family,
        brief_md=pack.brief_md,
        deliverables=pack.deliverables_json,
        allowed_artifacts=pack.allowed_artifacts_json,
        rubric_mapping=pack.rubric_mapping_json,
    )


@router.post("/mission/run/start", response_model=MissionRunStartResponse)
def start_run(
    payload: MissionRunStart, session: Session = Depends(get_session)
) -> MissionRunStartResponse:
    pack = session.exec(
        select(MissionPack).where(MissionPack.job_family == payload.job_family)
    ).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Mission pack not found")
    run = MissionRun(user_id=payload.user_id, mission_pack_id=pack.id)
    session.add(run)
    session.commit()
    session.refresh(run)
    return MissionRunStartResponse(run_id=run.id)


@router.post("/mission/run/{run_id}/submit_artifacts")
def submit_artifacts(
    run_id: int,
    payload: MissionArtifactsSubmit,
    session: Session = Depends(get_session),
) -> dict:
    run = session.get(MissionRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Mission run not found")
    run.artifact_index_json = {
        "artifacts": [a.model_dump() for a in payload.artifacts],
        "reflection": payload.reflection,
    }
    session.commit()
    return {"status": "ok"}


@router.post("/mission/run/{run_id}/score", response_model=MissionScoreResponse)
def score_run(
    run_id: int,
    payload: MissionArtifactsSubmit,
    session: Session = Depends(get_session),
) -> MissionScoreResponse:
    run = session.get(MissionRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Mission run not found")
    score_data = score_mission(
        [a.model_dump() for a in payload.artifacts], payload.reflection or ""
    )
    score = Score(
        mission_run_id=run_id,
        total_0_10=score_data["total_0_10"],
        subscores=score_data["subscores"],
        evidence_anchors_json=score_data["evidence_anchors"],
        confidence=score_data.get("confidence"),
        uncertainty_notes=score_data.get("uncertainty_notes"),
    )
    session.add(score)
    session.commit()
    return MissionScoreResponse(
        total_0_10=score.total_0_10,
        subscores=score.subscores,
        evidence_anchors=score.evidence_anchors_json,
        confidence=score.confidence,
        uncertainty_notes=score.uncertainty_notes,
    )
