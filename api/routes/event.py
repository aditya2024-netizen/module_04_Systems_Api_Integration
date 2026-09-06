"""
Decision Event API Route
HydroSurge AI | SIH PS 26071
Endpoint: GET /api/v1/event/{id}
Status: VERIFIED 🟢
"""
from fastapi import APIRouter, Depends, HTTPException, Path
from schemas.decision import DecisionObject
from api.dependencies import ProviderManager, get_provider_manager

router = APIRouter(prefix="/event", tags=["DecisionEvent"])


@router.get("/{id}", response_model=DecisionObject)
def get_event(
    id: str = Path(..., description="Unique event identifier (e.g. E001)"),
    provider: ProviderManager = Depends(get_provider_manager),
):
    """
    Retrieve joined DecisionObject for an emergency event.
    Combines rainfall nowcast, inundation model, population/asset impact,
    priority level, and actionable recommendations.
    """
    try:
        event_data = provider.get_decision_event(event_id=id)
        return DecisionObject(**event_data)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal server error: {exc}")