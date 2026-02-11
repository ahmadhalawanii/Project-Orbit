"""Add cv_file_path and cv_extracted_text to applications. Run from backend/: python -m scripts.add_cv_columns"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings
from sqlalchemy import create_engine, text

if __name__ == "__main__":
    settings = get_settings()
    if "sqlite" not in settings.database_url:
        print("Skipping: only SQLite supported for this migration")
        sys.exit(0)
    url = settings.get_database_url_sync()
    engine = create_engine(url, connect_args={"check_same_thread": False})
    with engine.connect() as conn:
        r = conn.execute(text("PRAGMA table_info(applications)"))
        cols = [row[1] for row in r]
        if "cv_file_path" not in cols:
            conn.execute(text("ALTER TABLE applications ADD COLUMN cv_file_path VARCHAR(512)"))
            conn.commit()
            print("Added cv_file_path")
        if "cv_extracted_text" not in cols:
            conn.execute(text("ALTER TABLE applications ADD COLUMN cv_extracted_text TEXT"))
            conn.commit()
            print("Added cv_extracted_text")
    print("Done.")
