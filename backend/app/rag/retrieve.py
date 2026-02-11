import os
import hashlib
from typing import List, Dict, Any

import chromadb
from openai import OpenAI

from app.config import get_settings


def _get_openai_client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


EMBEDDING_DIM = 1536


def _mock_embedding(text: str, size: int = EMBEDDING_DIM) -> List[float]:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    values = []
    for i in range(size):
        chunk = digest[i * 4 : (i + 1) * 4]
        values.append(int.from_bytes(chunk, "big") / 2**32)
    return values


def _get_chroma_client() -> chromadb.PersistentClient:
    chroma_path = os.getenv("CHROMA_PATH", "./data/chroma")
    return chromadb.PersistentClient(path=chroma_path)


def retrieve(query: str, k: int = 6) -> List[Dict[str, Any]]:
    client = _get_chroma_client()
    collection = client.get_or_create_collection(name="orbit_content")
    query_embedding = _embed_query(query)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        include=["documents", "metadatas", "distances"],
    )
    matches: List[Dict[str, Any]] = []
    for idx in range(len(results["ids"][0])):
        matches.append(
            {
                "document": results["documents"][0][idx],
                "metadata": results["metadatas"][0][idx],
                "distance": results["distances"][0][idx],
            }
        )
    return matches


def _embed_query(query: str) -> List[float]:
    settings = get_settings()
    if settings.mock_ai or not settings.openai_api_key:
        return _mock_embedding(query)
    client = _get_openai_client()
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=[query],
    )
    return response.data[0].embedding
