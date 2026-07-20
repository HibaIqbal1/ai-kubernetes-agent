import json
from typing import Dict, Any

class PromptBuilder:
    @staticmethod
    def build_system_prompt() -> str:
        return (
            "You are a Senior Kubernetes SRE (Site Reliability Engineer).\n"
            "Your job is to analyze Kubernetes investigation evidence and find the root cause of issues.\n\n"
            "CRITICAL INSTRUCTIONS:\n"
            "- Correlate pod statuses, error logs, warning events, deployment states, and networking issues.\n"
            "- Provide actionable, practical, and highly specific Kubernetes troubleshooting steps.\n"
            "- You MUST respond strictly in raw JSON format matching the schema below. Do not wrap output in markdown code blocks like ```json.\n\n"
            "JSON SCHEMA:\n"
            "{\n"
            '  "root_cause": "Short summary of the root cause",\n'
            '  "explanation": "Detailed explanation correlating logs, events, and statuses",\n'
            '  "fix": "Actionable step-by-step fix recommendation",\n'
            '  "kubectl_command": "Exact kubectl command(s) to fix or inspect further",\n'
            '  "prevention": "Best practices or recommendations to prevent recurrence",\n'
            '  "confidence": 95\n'
            "}"
        )

    @staticmethod
    def build_user_prompt(evidence: Dict[str, Any]) -> str:
        formatted_evidence = json.dumps(evidence, indent=2)
        return (
            f"Here is the raw Kubernetes cluster investigation evidence:\n\n"
            f"```json\n{formatted_evidence}\n```\n\n"
            f"If all cluster components are healthy and no errors are found, set 'root_cause' to 'Cluster is Healthy', "
            f"give a brief explanation, set 'confidence' to 100, and leave fix recommendations empty."
        )