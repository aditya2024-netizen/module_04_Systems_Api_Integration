"""
Rainfall API Route
HydroSurge AI | SIH PS 26071
Endpoint: GET /api/v1/rainfall
Status: VERIFIED 🟢
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from schemas.rainfall import RainfallOutput
from api.dependencies import ProviderManager, get_provider_manager

logger = logging.getLogger("hydrosurge.routes.rainfall")
router = APIRouter(prefix="/rainfall", tags=["Rainfall"])


@router.get("", response_model=RainfallOutput)
def get_rainfall(
    event_id: Optional[str] = Query(None, description="Unique event identifier (e.g. E001)"),
    zone_id: Optional[str] = Query(None, description="Target zone identifier (e.g. Z42)"),
    simulate_radar_outage: bool = Query(False, description="Simulate radar outage fallback"),
    provider: ProviderManager = Depends(get_provider_manager),
):
    """Retrieve rainfall forecast output for a given event_id or zone_id."""
    try:
        data = provider.get_rainfall(event_id=event_id, zone_id=zone_id, simulate_radar_outage=simulate_radar_outage)
        return RainfallOutput(**data)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.error(f"Failed to retrieve rainfall: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")