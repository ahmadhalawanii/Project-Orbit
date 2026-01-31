"""Create all tables. Run from backend/: python -m scripts.init_db"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings
from app.db.base import Base
from app.db import models  # noqa: F401
from sqlalchemy import create_engine

if __name__ == "__main__":
    settings = get_settings()
    engine = create_engine(settings.get_database_url_sync(), connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    print("Tables created.")
