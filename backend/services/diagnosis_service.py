import json
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def diagnose_log(error_excerpt: str):
    prompt = f"""
You are a CI/CD debugging assistant.

Analyze this failed build log excerpt.

Return JSON only with this exact structure:
{{
  "failure_type": "",
  "root_cause": "",
  "evidence": "",
  "suggested_fix": "",
  "fix_command": "",
  "confidence_score": 0
}}

Failure types must be one of:
DEPENDENCY_ERROR, TEST_FAILURE, LINT_ERROR, TYPE_ERROR, ENV_SECRET_MISSING,
BUILD_CONFIG_ERROR, DEPLOYMENT_ERROR, FLAKY_TEST, UNKNOWN.

Log excerpt:
{error_excerpt}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "failure_type": "UNKNOWN",
            "root_cause": "Could not parse AI response.",
            "evidence": error_excerpt[:500],
            "suggested_fix": "Review the log manually.",
            "fix_command": "",
            "confidence_score": 0
        }