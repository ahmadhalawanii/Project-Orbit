import json
from typing import List, Dict, Any

from openai import OpenAI


def generate_portfolio_patch(
    recent_messages: List[Dict[str, str]],
    evidence_links: List[Dict[str, Any]],
    *,
    openai_api_key: str | None,
    mock_ai: bool,
) -> Dict[str, Any]:
    if mock_ai or not openai_api_key:
        return {
            "summary": "",
            "highlights": [],
            "skills": [],
            "experience": [],
            "source": "mock",
        }

    client = OpenAI(api_key=openai_api_key)
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You update a candidate portfolio. Output concise JSON only.",
            },
            {
                "role": "user",
                "content": (
                    f"Conversation messages: {recent_messages}\n"
                    f"Evidence links: {evidence_links}\n"
                    "Return JSON with keys: summary, highlights, skills, experience, source."
                ),
            },
        ],
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    try:
        parsed = json.loads(content)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass
    return {
        "summary": content,
        "highlights": [],
        "skills": [],
        "experience": [],
        "source": "fallback",
    }
