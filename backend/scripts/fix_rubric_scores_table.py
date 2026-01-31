"""Fix rubric_scores table schema (add missing columns). Run from backend/: python -m scripts.fix_rubric_scores_table

If the table was created with an old schema, this drops and recreates it so it has
overall_score, criteria_scores, scored_at.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import create_engine, text
from app.config import get_settings
from app.db.base import Base
from app.db.models import RubricScore

if __name__ == "__main__":
    settings = get_settings()
    engine = create_engine(settings.get_database_url_sync(), connect_args={"check_same_thread": False})

    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS rubric_scores"))
        conn.commit()

    Base.metadata.tables["rubric_scores"].create(bind=engine)
    print("rubric_scores table recreated with correct schema (overall_score, criteria_scores, scored_at).")
