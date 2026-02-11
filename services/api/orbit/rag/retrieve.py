import os
from typing import List, Dict, Any

import chromadb
from openai import OpenAI


def _get_openai_client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


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
    matches = []
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
    client = _get_openai_client()
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=[query],
    )
    return response.data[0].embedding
