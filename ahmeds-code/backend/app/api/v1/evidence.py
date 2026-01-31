"""Evidence (links, files) per application."""
import uuid
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.db.models import Application, Evidence as EvidenceModel
from app.api.deps import AsyncDb
from pydantic import BaseModel

router = APIRouter(prefix="/applications", tags=["evidence"])


class EvidenceRead(BaseModel):
    id: str
    application_id: str
    kind: str
    title: str | None
    url_or_path: str | None

    class Config:
        from_attributes = True


class EvidenceCreate(BaseModel):
    kind: str = "link"
    title: str | None = None
    url_or_path: str | None = None


@router.get("/{application_id}/evidence", response_model=list[EvidenceRead])
async def list_evidence(application_id: str, db: AsyncDb):
    app_result = await db.execute(select(Application).where(Application.id == application_id))
    if not app_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Application not found")
    result = await db.execute(
        select(EvidenceModel).where(EvidenceModel.application_id == application_id).order_by(EvidenceModel.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{application_id}/evidence", response_model=EvidenceRead)
async def add_evidence(application_id: str, body: EvidenceCreate, db: AsyncDb):
    app_result = await db.execute(select(Application).where(Application.id == application_id))
    if not app_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Application not found")
    evidence = EvidenceModel(
        id=str(uuid.uuid4()),
        application_id=application_id,
        kind=body.kind or "link",
        title=body.title,
        url_or_path=body.url_or_path,
    )
    db.add(evidence)
    await db.flush()
    await db.refresh(evidence)
    return evidence
