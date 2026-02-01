import os
from fastapi import APIRouter
from pydantic import BaseModel

from app.rag.ingest import ingest_content_pack


router = APIRouter(prefix="/ingest", tags=["ingest"])


class IngestResponse(BaseModel):
    status: str
    chunks: int


@router.post("/", response_model=IngestResponse)
async def ingest():
    content_dir = os.getenv("CONTENT_PACK_PATH", "./content_pack")
    chunks = ingest_content_pack(content_dir)
    return IngestResponse(status="ok", chunks=chunks)
