import json
from typing import List, Dict, Any

from openai import OpenAI

from app.config import get_settings


def answer_with_citations(question: str, snippets: List[Dict[str, Any]]) -> Dict[str, Any]:
    context = "\n\n".join(
        [
            f"[{item['metadata']['chunk_id']}] {item['document']}"
            for item in snippets
            if item.get("metadata") and item.get("document")
        ]
    )
    system = (
        "You are Orbit. Answer only from the provided context. "
        "If the answer is not in the context, say it is not in the provided content "
        "and ask one clarifying question. "
        "Return JSON with keys: answer (string) and followups (array of strings)."
    )
    settings = get_settings()
    if settings.mock_ai or not settings.openai_api_key:
        return {"answer": "AI is in mock mode.", "followups": []}

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"Context:\n{context}\n\nQ: {question}"},
        ],
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    try:
        parsed = json.loads(content)
        if isinstance(parsed, dict) and "answer" in parsed:
            parsed.setdefault("followups", [])
            return parsed
    except json.JSONDecodeError:
        return {"answer": content, "followups": []}
    return {"answer": content, "followups": []}
