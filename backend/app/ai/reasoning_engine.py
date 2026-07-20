from typing import Dict, Any
from app.ai.prompt_builder import PromptBuilder
from app.ai.llm_client import LLMClient

class ReasoningEngine:
    @staticmethod
    async def analyze_evidence(evidence: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = PromptBuilder.build_system_prompt()
        user_prompt = PromptBuilder.build_user_prompt(evidence)
        
        diagnosis = await LLMClient.generate_diagnosis(system_prompt, user_prompt)
        return diagnosis