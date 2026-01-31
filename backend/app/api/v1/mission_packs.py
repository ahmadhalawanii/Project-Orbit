from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.db.models import MissionPack
from app.schemas.mission_pack import MissionPackRead
from app.api.deps import AsyncDb

router = APIRouter(prefix="/mission-packs", tags=["mission-packs"])


@router.get("/", response_model=list[MissionPackRead])
async def list_mission_packs(db: AsyncDb):
    result = await db.execute(
        select(MissionPack).where(MissionPack.is_active == True).order_by(MissionPack.slug)
    )
    return list(result.scalars().all())


@router.get("/{mission_pack_id}", response_model=MissionPackRead)
async def get_mission_pack(mission_pack_id: str, db: AsyncDb):
    result = await db.execute(select(MissionPack).where(MissionPack.id == mission_pack_id))
    pack = result.scalar_one_or_none()
    if not pack:
        raise HTTPException(status_code=404, detail="Mission pack not found")
    return pack
