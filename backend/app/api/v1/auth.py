import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select
from app.db.models import User
from app.db.session import get_db
from app.api.deps import AsyncDb
from app.core.auth import create_token

router = APIRouter(prefix="/auth", tags=["auth"])


class DemoLoginRequest(BaseModel):
    email: str
    role: str = "applicant"


class DemoLoginResponse(BaseModel):
    token: str
    user_id: str
    email: str
    role: str


@router.post("/demo-login", response_model=DemoLoginResponse)
async def demo_login(body: DemoLoginRequest, db: AsyncDb):
    from app.db.models import UserRole
    role = UserRole.applicant if body.role == "applicant" else UserRole.recruiter
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=body.email,
            role=role,
        )
        db.add(user)
        await db.flush()
    token = create_token(user.id)
    return DemoLoginResponse(
        token=token,
        user_id=user.id,
        email=user.email,
        role=user.role.value,
    )
