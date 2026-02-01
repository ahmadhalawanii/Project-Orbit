import json
from typing import Dict, Any, List

from openai import OpenAI


def score_application(
    evidence_links: List[Dict[str, Any]],
    recent_messages: List[Dict[str, str]],
    *,
    openai_api_key: str | None,
    mock_ai: bool,
    criteria_template: List[Dict[str, int]],
) -> Dict[str, Any]:
    if mock_ai or not openai_api_key:
        return {
            "overall_score": None,
            "criteria_scores": [],
            "source": "mock",
        }

    client = OpenAI(api_key=openai_api_key)
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "Score a candidate using the rubric. Output JSON only.",
            },
            {
                "role": "user",
                "content": (
                    f"Rubric criteria: {criteria_template}\n"
                    f"Conversation messages: {recent_messages}\n"
                    f"Evidence links: {evidence_links}\n"
                    "Return JSON with keys: overall_score (string), criteria_scores (array of {name, score, max})."
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
        "overall_score": None,
        "criteria_scores": [],
        "source": "fallback",
    }
