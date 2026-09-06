"""
Spatial Risk API Route
HydroSurge AI | SIH PS 26071
Endpoint: GET /api/v1/risk
Status: VERIFIED 🟢
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from schemas.risk import RiskTile
from api.dependencies import ProviderManager, get_provider_manager

logger = logging.getLogger("hydrosurge.routes.risk")
router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("", response_model=List[RiskTile])
def get_risk(
    zone_id: Optional[str] = Query(None, description="Filter risk tiles by target zone (e.g. Z42)"),
    provider: ProviderManager = Depends(get_provider_manager),
):
    """Retrieve spatial risk tiles combining rainfall intensity and flood probability."""
    try:
        tiles_data = provider.get_risk_tiles(zone_id=zone_id)
        return [RiskTile(**t) for t in tiles_data]
    except Exception as exc:
        logger.error(f"Failed to retrieve risk tiles: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")