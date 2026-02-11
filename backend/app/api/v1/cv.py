"""CV upload and download per application. Stores file and optional extracted text for AI."""
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy import select

from app.db.models import Application
from app.api.deps import AsyncDb
from app.config import get_settings

router = APIRouter(prefix="/applications", tags=["cv"])

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _extract_text_pdf(file_path: Path) -> str | None:
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(file_path))
        parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                parts.append(text)
        return "\n\n".join(parts).strip() or None
    except Exception:
        return None


@router.post("/{application_id}/cv")
async def upload_cv(application_id: str, db: AsyncDb, file: UploadFile = File(...)):
    """Upload CV for an application. Accepts PDF, DOC, DOCX. Extracts text from PDF for AI use."""
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file name")
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")

    settings = get_settings()
    base = Path(settings.uploads_dir)
    base.mkdir(parents=True, exist_ok=True)
    app_dir = base / application_id
    app_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"cv_{uuid.uuid4().hex[:8]}{ext}"
    file_path = app_dir / safe_name
    file_path.write_bytes(content)

    rel_path = f"{application_id}/{safe_name}"
    app.cv_file_path = rel_path
    app.cv_extracted_text = None
    if ext == ".pdf":
        app.cv_extracted_text = _extract_text_pdf(file_path)
    await db.flush()
    await db.refresh(app)

    return {
        "cv_file_path": rel_path,
        "has_extracted_text": app.cv_extracted_text is not None,
    }


@router.get("/{application_id}/cv")
async def download_cv(application_id: str, db: AsyncDb):
    """Download the CV file for an application (for HR / applicant)."""
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalar_one_or_none()
    if not app or not app.cv_file_path:
        raise HTTPException(status_code=404, detail="CV not found")

    settings = get_settings()
    full_path = Path(settings.uploads_dir) / app.cv_file_path
    if not full_path.is_file():
        raise HTTPException(status_code=404, detail="CV file not found")

    return FileResponse(
        full_path,
        filename=Path(app.cv_file_path).name,
        media_type="application/octet-stream",
    )
