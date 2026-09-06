"""
Health API Route
HydroSurge AI | SIH PS 26071
Endpoint: GET /api/v1/health
Status: VERIFIED 🟢
"""
import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from api.dependencies import ProviderManager, get_provider_manager

logger = logging.getLogger("hydrosurge.routes.health")
router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=Dict[str, Any])
def get_health(
    provider: ProviderManager = Depends(get_provider_manager),
):
    """
    Check system health.
    Reports currently active provider mode (mock or live) and last successful fetch per provider.
    """
    try:
        return provider.get_health()
    except Exception as exc:
        logger.error(f"Health check failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")