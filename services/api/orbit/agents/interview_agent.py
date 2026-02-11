import json
import os
from typing import Dict, Any, List

from openai import OpenAI


def _client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def build_interview_plan(portfolio: Dict[str, Any], job_family: str) -> Dict[str, Any]:
    if not os.getenv("OPENAI_API_KEY"):
        return {
            "questions": [
                f"Tell me about a project related to {job_family}.",
                "Walk me through a key challenge and how you resolved it.",
            ]
        }
    response = _client().chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "Create a concise interview plan from portfolio. Return JSON.",
            },
            {
                "role": "user",
                "content": f"Portfolio: {portfolio}\nJob family: {job_family}",
            },
        ],
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"questions": []}


def build_decision_pack(
    portfolio: Dict[str, Any], answers: List[Dict[str, Any]]
) -> Dict[str, Any]:
    if not os.getenv("OPENAI_API_KEY"):
        return {
            "summary": "Decision pack unavailable without OpenAI key.",
            "strengths": [],
            "risks": [],
            "recommendation": "hold",
            "uncertainty_notes": "OpenAI key missing.",
        }
    response = _client().chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "Create a decision pack JSON."},
            {
                "role": "user",
                "content": f"Portfolio: {portfolio}\nAnswers: {answers}",
            },
        ],
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "summary": "Decision pack parsing error.",
            "strengths": [],
            "risks": [],
            "recommendation": "hold",
            "uncertainty_notes": "Parsing error.",
        }
