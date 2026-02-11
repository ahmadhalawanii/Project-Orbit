from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy import Column, JSON, Text
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: Optional[str] = None
    role: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: str
    role: str
    content: str = Field(sa_column=Column(Text))
    citations_json: List[Dict[str, Any]] = Field(
        default_factory=list, sa_column=Column(JSON)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Portfolio(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    target_roles: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    summary: Optional[str] = None
    preferences_json: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    claims_json: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    competency_json: List[Dict[str, Any]] = Field(
        default_factory=list, sa_column=Column(JSON)
    )
    readiness_flags_json: List[Dict[str, Any]] = Field(
        default_factory=list, sa_column=Column(JSON)
    )
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Evidence(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    type: str
    url: Optional[str] = None
    label: Optional[str] = None
    notes: Optional[str] = None
    hash: Optional[str] = None


class MissionPack(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_family: str
    brief_md: str = Field(sa_column=Column(Text))
    deliverables_json: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    allowed_artifacts_json: List[str] = Field(
        default_factory=list, sa_column=Column(JSON)
    )
    rubric_mapping_json: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSON)
    )


class MissionRun(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    mission_pack_id: int
    team_id: Optional[str] = None
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = None
    artifact_index_json: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSON)
    )


class Score(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mission_run_id: int
    total_0_10: float
    subscores: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    evidence_anchors_json: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSON)
    )
    confidence: Optional[float] = None
    uncertainty_notes: Optional[str] = None


class InterviewSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    job_family: str
    plan_json: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    answers_json: List[Dict[str, Any]] = Field(
        default_factory=list, sa_column=Column(JSON)
    )
    decision_pack_json: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSON)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
