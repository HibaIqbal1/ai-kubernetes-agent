from fastapi import APIRouter, HTTPException
from app.services.investigation_service import InvestigationService
from app.ai.reasoning_engine import ReasoningEngine
from loguru import logger

router = APIRouter()

@router.post("/investigate")
async def run_investigation():
    try:
        logger.info("Starting cluster investigation...")
        evidence = InvestigationService.run_investigation()
        
        logger.info("Performing AI Reasoning & Analysis...")
        diagnosis = await ReasoningEngine.analyze_evidence(evidence)

        return {
            "status": "success",
            "investigation": evidence,
            "diagnosis": diagnosis
        }
    except Exception as e:
        logger.error(f"Investigation endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))