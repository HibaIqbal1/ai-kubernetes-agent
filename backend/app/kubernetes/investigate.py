from fastapi import APIRouter, HTTPException
from app.services.investigation_service import InvestigationService
from loguru import logger

router = APIRouter()

@router.post("/investigate")
def run_investigation():
    try:
        logger.info("Starting cluster investigation...")
        data = InvestigationService.run_investigation()
        return {
            "status": "success",
            "investigation": data
        }
    except Exception as e:
        logger.error(f"Investigation endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))