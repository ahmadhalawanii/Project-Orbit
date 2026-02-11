from typing import List, Dict, Any


def to_citations(matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    citations = []
    for match in matches:
        metadata = match.get("metadata", {})
        citations.append(
            {
                "doc_id": metadata.get("doc_id", ""),
                "title": metadata.get("title", ""),
                "chunk_id": metadata.get("chunk_id", ""),
                "snippet": metadata.get("snippet", ""),
            }
        )
    return citations
