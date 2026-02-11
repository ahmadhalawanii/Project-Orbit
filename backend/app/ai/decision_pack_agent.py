import json
from typing import Dict, Any, List

from openai import OpenAI


def generate_decision_pack(
    *,
    role: str,
    role_description: str,
    rubric: Dict[str, Any] | None,
    cv_text: str,
    evidence_links: List[Dict[str, Any]],
    prior_answers: List[Dict[str, str]],
    transcript: str | None,
    openai_api_key: str | None,
    mock_ai: bool,
) -> Dict[str, Any]:
    if mock_ai or not openai_api_key:
        return {
            "overall_recommendation": None,
            "overall_score": None,
            "scorecard": [],
            "strengths": [],
            "risks": [],
            "rationale": "",
            "citations": [],
            "source": "mock",
        }

    client = OpenAI(api_key=openai_api_key)
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an internal hiring assessor. Produce a concise Decision Pack "
                    "with scores, rationale, and citations. Output JSON only."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Role: {role}\n"
                    f"Role description: {role_description}\n"
                    f"Rubric (if any): {rubric}\n"
                    f"Evidence links: {evidence_links}\n"
                    f"Candidate CV: {cv_text}\n"
                    f"Prior answers: {prior_answers}\n"
                    f"Interview transcript: {transcript or 'No transcript provided.'}\n\n"
                    "Return JSON with keys: overall_recommendation "
                    "(Strong Hire/Hire/Lean Hire/No Hire/Strong No Hire), overall_score "
                    "(0-100), scorecard (array of {name, score, max, rationale}), strengths "
                    "(array), risks (array), rationale (string), citations "
                    "(array of {title, url_or_path, note}), source."
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
        "overall_recommendation": None,
        "overall_score": None,
        "scorecard": [],
        "strengths": [],
        "risks": [],
        "rationale": content,
        "citations": [],
        "source": "fallback",
    }
