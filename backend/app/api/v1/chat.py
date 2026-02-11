from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from app.api.deps import AsyncDb
from app.ai.chat_agent import answer_with_citations
from app.db.models import Conversation
from app.rag.retrieve import retrieve


router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    application_id: str
    message: str
    mode: str = "explore"


class Citation(BaseModel):
    doc_id: str
    title: str
    chunk_id: str
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    followups: list[str] = []


@router.post("/", response_model=ChatResponse)
async def chat(body: ChatRequest, db: AsyncDb):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    result = await db.execute(
        select(Conversation).where(Conversation.application_id == body.application_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    snippets = retrieve(body.message)
    agent_out = answer_with_citations(body.message, snippets)
    citations = [
        Citation(**match["metadata"])
        for match in snippets
        if match.get("metadata")
    ]

    messages = conversation.messages_json or []
    messages.append({"role": "user", "content": body.message})
    messages.append({"role": "assistant", "content": agent_out.get("answer", "")})
    conversation.messages_json = messages
    await db.flush()

    return ChatResponse(
        answer=agent_out.get("answer", "No answer returned."),
        citations=citations,
        followups=agent_out.get("followups", []),
    )
