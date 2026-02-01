from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, ForeignKey, Enum as SQLEnum
from .base import Base
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    applicant = "applicant"
    recruiter = "recruiter"


class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(SQLEnum(UserRole), default=UserRole.applicant)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Applicant(Base):
    __tablename__ = "applicants"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    display_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Application(Base):
    __tablename__ = "applications"
    id = Column(String(36), primary_key=True)
    applicant_id = Column(String(36), ForeignKey("applicants.id"), nullable=False)
    mission_pack_id = Column(String(36), ForeignKey("mission_packs.id"), nullable=False)
    status = Column(String(64), default="draft")
    current_stage = Column(String(64), default="pluto")
    role_title = Column(String(255), nullable=True)
    cv_file_path = Column(String(512), nullable=True)
    cv_extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String(36), primary_key=True)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, unique=True)
    messages_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MissionPack(Base):
    __tablename__ = "mission_packs"
    id = Column(String(36), primary_key=True)
    slug = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    schema_json = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Portfolio(Base):
    """Candidate portfolio extracted from conversation + evidence (per application)."""
    __tablename__ = "portfolios"
    id = Column(String(36), primary_key=True)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, unique=True, index=True)
    summary = Column(Text, nullable=True)
    structured_json = Column(JSON, nullable=True)  # skills, experience, highlights
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Evidence(Base):
    """Evidence items (links, files) per application."""
    __tablename__ = "evidence"
    id = Column(String(36), primary_key=True)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    kind = Column(String(32), nullable=False)  # link, file
    title = Column(String(255), nullable=True)
    url_or_path = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RubricScore(Base):
    """Rubric score per application (overall + criteria)."""
    __tablename__ = "rubric_scores"
    id = Column(String(36), primary_key=True)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, unique=True, index=True)
    overall_score = Column(String(16), nullable=True)  # e.g. "72", "B+"
    criteria_scores = Column(JSON, nullable=True)  # [{ "name": "...", "score": 8, "max": 10 }, ...]
    scored_at = Column(DateTime, default=datetime.utcnow)


class SaturnDecisionPack(Base):
    """Decision pack generated from the Saturn voice interview context."""
    __tablename__ = "saturn_decision_packs"
    id = Column(String(36), primary_key=True)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, unique=True, index=True)
    decision_json = Column(JSON, nullable=False)
    transcript_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
