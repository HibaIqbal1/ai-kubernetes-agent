import json
import httpx
from loguru import logger
from typing import Dict, Any
from app.core.config import settings

class LLMClient:
    @staticmethod
    async def generate_diagnosis(system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        if not settings.OPENROUTER_API_KEY:
            logger.warning("OPENROUTER_API_KEY not configured. Returning fallback diagnosis.")
            return {
                "root_cause": "API Key Missing",
                "explanation": "OPENROUTER_API_KEY environment variable is not set in backend.",
                "fix": "Please set OPENROUTER_API_KEY in your docker-compose or .env file.",
                "kubectl_command": "docker compose down && OPENROUTER_API_KEY=your_key docker compose up -d",
                "prevention": "Ensure environment variables are injected properly.",
                "confidence": 0
            }

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "AI Kubernetes Agent"
        }

        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 1000
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                logger.info(f"Calling OpenRouter model: {settings.OPENROUTER_MODEL}")
                response = await client.post(settings.OPENROUTER_BASE_URL, headers=headers, json=payload)
                response.raise_for_status()
                
                data = response.json()
                content = data["choices"][0]["message"]["content"].strip()

                if content.startswith("```"):
                    lines = content.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    content = "\n".join(lines).strip()

                return json.loads(content)

            except httpx.HTTPStatusError as e:
                logger.error(f"OpenRouter HTTP Error: {e.response.text}")
                return {
                    "root_cause": "OpenRouter API Error",
                    "explanation": f"API request failed with status code {e.response.status_code}.",
                    "fix": "Verify your API key and OpenRouter model settings.",
                    "kubectl_command": "",
                    "prevention": "",
                    "confidence": 0
                }
            except Exception as e:
                logger.error(f"Failed to generate LLM reasoning: {str(e)}")
                return {
                    "root_cause": "Analysis Exception",
                    "explanation": f"An error occurred during AI reasoning: {str(e)}",
                    "fix": "Check backend container logs for details.",
                    "kubectl_command": "",
                    "prevention": "",
                    "confidence": 0
                }