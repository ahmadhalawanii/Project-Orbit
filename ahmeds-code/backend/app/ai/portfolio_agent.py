import json
import os
from typing import List, Dict, Any

from openai import OpenAI


def _client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_portfolio_patch(
    recent_messages: List[Dict[str, str]],
    evidence_links: List[Dict[str, Any]],
) -> Dict[str, Any]:
    system = "You update a candidate portfolio. Output JSON."
    if not os.getenv("OPENAI_API_KEY"):
        return {
            "summary": "",
            "target_roles": [],
            "preferences": {},
            "claims": [],
            "competencies": [],
            "flags": [],
        }
    response = _client().chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": (
                    f"Messages: {recent_messages}\n"
                    f"Evidence: {evidence_links}\n"
                    "Return a concise portfolio patch as JSON with keys "
                    "summary, target_roles, preferences, claims, competencies, flags."
                ),
            },
        ],
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "summary": "",
            "target_roles": [],
            "preferences": {},
            "claims": [],
            "competencies": [],
            "flags": [],
        }
