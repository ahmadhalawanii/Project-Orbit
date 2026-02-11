import os

from fastapi import APIRouter

from orbit.rag.ingest import ingest_content_pack
from orbit.schemas import IngestResponse


router = APIRouter()


@router.post("/ingest", response_model=IngestResponse)
def ingest() -> IngestResponse:
    content_dir = os.getenv("CONTENT_PACK_PATH", "./content_pack")
    chunks = ingest_content_pack(content_dir)
    return IngestResponse(status="ok", chunks=chunks)
