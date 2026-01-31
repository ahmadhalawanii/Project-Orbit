import uuid
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.db.models import Applicant
from app.api.deps import AsyncDb
from pydantic import BaseModel


router = APIRouter(prefix="/applicants", tags=["applicants"])


class ApplicantCreate(BaseModel):
    user_id: str
    display_name: str | None = None


class ApplicantRead(BaseModel):
    id: str
    user_id: str
    display_name: str | None

    class Config:
        from_attributes = True


@router.post("/", response_model=ApplicantRead)
async def create_applicant(body: ApplicantCreate, db: AsyncDb):
    applicant = Applicant(
        id=str(uuid.uuid4()),
        user_id=body.user_id,
        display_name=body.display_name,
    )
    db.add(applicant)
    await db.flush()
    await db.refresh(applicant)
    return applicant


@router.get("/by-user/{user_id}", response_model=ApplicantRead)
async def get_applicant_by_user(user_id: str, db: AsyncDb):
    result = await db.execute(select(Applicant).where(Applicant.user_id == user_id))
    applicant = result.scalar_one_or_none()
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return applicant
