import json
import os
from typing import Dict, Any, List

from openai import OpenAI


def _client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def score_mission(artifacts: List[Dict[str, Any]], reflection: str) -> Dict[str, Any]:
    if not os.getenv("OPENAI_API_KEY"):
        return {
            "total_0_10": 5.0,
            "subscores": {},
            "evidence_anchors": {},
            "confidence": 0.5,
            "uncertainty_notes": "OpenAI key missing.",
        }
    response = _client().chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "Score a mission using a universal rubric. Return JSON.",
            },
            {
                "role": "user",
                "content": f"Artifacts: {artifacts}\nReflection: {reflection}",
            },
        ],
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "total_0_10": 5.0,
            "subscores": {},
            "evidence_anchors": {},
            "confidence": 0.5,
            "uncertainty_notes": "Parsing error.",
        }
