import os
from pathlib import Path
from typing import List

import chromadb
from openai import OpenAI

from app.rag.chunking import chunk_text


def _get_openai_client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _get_chroma_client() -> chromadb.PersistentClient:
    chroma_path = os.getenv("CHROMA_PATH", "./data/chroma")
    return chromadb.PersistentClient(path=chroma_path)


def ingest_content_pack(content_dir: str) -> int:
    base = Path(content_dir)
    client = _get_chroma_client()
    collection = client.get_or_create_collection(name="orbit_content")
    files = list(base.glob("*.md"))
    total_chunks = 0

    for file_path in files:
        text = file_path.read_text(encoding="utf-8")
        chunks = chunk_text(text)
        embeddings = _embed_chunks(chunks)
        metadatas = []
        ids = []
        for i, chunk in enumerate(chunks):
            ids.append(f"{file_path.stem}-{i}")
            metadatas.append(
                {
                    "doc_id": file_path.stem,
                    "title": file_path.name,
                    "chunk_id": f"{file_path.stem}-{i}",
                    "snippet": chunk[:280],
                }
            )
        if chunks:
            collection.upsert(
                ids=ids,
                documents=chunks,
                embeddings=embeddings,
                metadatas=metadatas,
            )
            total_chunks += len(chunks)
    return total_chunks


def _embed_chunks(chunks: List[str]) -> List[List[float]]:
    if not chunks:
        return []
    client = _get_openai_client()
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=chunks,
    )
    return [item.embedding for item in response.data]
