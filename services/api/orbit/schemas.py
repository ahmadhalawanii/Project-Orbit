from typing import List, Dict, Any, Optional

from pydantic import BaseModel, Field


class Citation(BaseModel):
    doc_id: str
    title: str
    chunk_id: str
    snippet: str


class IngestResponse(BaseModel):
    status: str
    chunks: int


class ChatRequest(BaseModel):
    user_id: str
    conversation_id: str
    mode: str
    message: str


class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]
    followups: List[str] = Field(default_factory=list)


class PortfolioView(BaseModel):
    user_id: str
    summary: Optional[str] = None
    target_roles: List[str] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    claims: List[Dict[str, Any]] = Field(default_factory=list)
    competencies: List[Dict[str, Any]] = Field(default_factory=list)
    flags: List[Dict[str, Any]] = Field(default_factory=list)


class EvidenceCreate(BaseModel):
    type: str
    url: Optional[str] = None
    label: Optional[str] = None
    notes: Optional[str] = None
    hash: Optional[str] = None


class EvidenceResponse(BaseModel):
    id: int
    type: str
    url: Optional[str] = None
    label: Optional[str] = None
    notes: Optional[str] = None
    hash: Optional[str] = None


class PortfolioPatch(BaseModel):
    summary: Optional[str] = None
    target_roles: List[str] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    claims: List[Dict[str, Any]] = Field(default_factory=list)
    competencies: List[Dict[str, Any]] = Field(default_factory=list)
    flags: List[Dict[str, Any]] = Field(default_factory=list)


class MissionPackView(BaseModel):
    id: int
    job_family: str
    brief_md: str
    deliverables: List[str]
    allowed_artifacts: List[str]
    rubric_mapping: Dict[str, Any]


class MissionRunStart(BaseModel):
    user_id: str
    job_family: str


class MissionRunStartResponse(BaseModel):
    run_id: int


class MissionArtifact(BaseModel):
    type: str
    url: str
    label: Optional[str] = None


class MissionArtifactsSubmit(BaseModel):
    artifacts: List[MissionArtifact]
    reflection: Optional[str] = None


class MissionScoreResponse(BaseModel):
    total_0_10: float
    subscores: Dict[str, Any]
    evidence_anchors: Dict[str, Any]
    confidence: Optional[float] = None
    uncertainty_notes: Optional[str] = None


class InterviewStartRequest(BaseModel):
    user_id: str
    job_family: str


class InterviewStartResponse(BaseModel):
    interview_id: int
    next_question: str


class InterviewAnswerRequest(BaseModel):
    answer: str


class InterviewAnswerResponse(BaseModel):
    next_question: Optional[str] = None
    done: bool


class InterviewFinalizeResponse(BaseModel):
    decision_pack: Dict[str, Any]


class MetricsResponse(BaseModel):
    total_conversations: int
    total_portfolios: int
    total_mission_runs: int
    avg_score: float
