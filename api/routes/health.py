"""
Health API Route
HydroSurge AI | SIH PS 26071
Endpoint: GET /api/v1/health
Status: VERIFIED 🟢
"""
from typing import Any, Dict
from fastapi import APIRouter, Depends
from api.dependencies import ProviderManager, get_provider_manager

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=Dict[str, Any])
def get_health(
    provider: ProviderManager = Depends(get_provider_manager),
):
    """
    Check system health.
    Reports currently active provider mode (mock or live) and last successful fetch per provider.
    """
    return provider.get_health()