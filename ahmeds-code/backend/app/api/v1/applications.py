import uuid
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.db.models import Application, Applicant, Conversation, User
from app.api.deps import AsyncDb
from pydantic import BaseModel


router = APIRouter(prefix="/applications", tags=["applications"])


class ApplicationCreate(BaseModel):
    applicant_id: str
    mission_pack_id: str
    role_title: str | None = None


class ApplicationRead(BaseModel):
    id: str
    applicant_id: str
    mission_pack_id: str
    status: str
    current_stage: str
    role_title: str | None

    class Config:
        from_attributes = True


class ApplicationListItem(BaseModel):
    id: str
    applicant_id: str
    mission_pack_id: str
    status: str
    current_stage: str
    role_title: str | None
    applicant_email: str | None

    class Config:
        from_attributes = True


@router.get("/", response_model=list[ApplicationListItem])
async def list_applications(db: AsyncDb):
    """List all applications for recruiter pipeline."""
    result = await db.execute(
        select(Application, User.email)
        .join(Applicant, Application.applicant_id == Applicant.id)
        .outerjoin(User, Applicant.user_id == User.id)
        .order_by(Application.created_at.desc())
    )
    rows = result.all()
    return [
        ApplicationListItem(
            id=app.id,
            applicant_id=app.applicant_id,
            mission_pack_id=app.mission_pack_id,
            status=app.status,
            current_stage=app.current_stage,
            role_title=app.role_title,
            applicant_email=email,
        )
        for app, email in rows
    ]


@router.post("/", response_model=ApplicationRead)
async def create_application(body: ApplicationCreate, db: AsyncDb):
    app = Application(
        id=str(uuid.uuid4()),
        applicant_id=body.applicant_id,
        mission_pack_id=body.mission_pack_id,
        role_title=body.role_title,
    )
    db.add(app)
    await db.flush()
    conv = Conversation(
        id=str(uuid.uuid4()),
        application_id=app.id,
        messages_json=[],
    )
    db.add(conv)
    await db.flush()
    await db.refresh(app)
    return app


@router.get("/{application_id}", response_model=ApplicationRead)
async def get_application(application_id: str, db: AsyncDb):
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


class ApplicationUpdate(BaseModel):
    status: str | None = None
    current_stage: str | None = None


@router.patch("/{application_id}", response_model=ApplicationRead)
async def update_application(application_id: str, body: ApplicationUpdate, db: AsyncDb):
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if body.status is not None:
        app.status = body.status
    if body.current_stage is not None:
        app.current_stage = body.current_stage
    await db.flush()
    await db.refresh(app)
    return app
