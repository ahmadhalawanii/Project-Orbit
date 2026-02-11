import json
import os
from typing import List, Dict, Any

from openai import OpenAI


def _client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def answer_with_citations(
    question: str, snippets: List[Dict[str, Any]]
) -> Dict[str, Any]:
    context = "\n\n".join(
        [
            f"[{item['metadata']['chunk_id']}] {item['document']}"
            for item in snippets
        ]
    )
    system = (
        "You are Orbit. Answer only from the provided context. "
        "If the answer is not in the context, say it is not in the provided content "
        "and ask one clarifying question. "
        "Return JSON with keys: answer (string) and followups (array of strings)."
    )
    if not os.getenv("OPENAI_API_KEY"):
        return {"answer": "OpenAI key missing.", "followups": []}
    response = _client().chat.completions.create(
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
