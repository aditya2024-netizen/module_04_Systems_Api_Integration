"""
Decision Event API Route
HydroSurge AI | SIH PS 26071
Endpoint: GET /api/v1/event/{id}, GET /api/v1/events
Status: VERIFIED 🟢
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from schemas.decision import DecisionObject, EventSummary
from api.dependencies import ProviderManager, get_provider_manager

logger = logging.getLogger("hydrosurge.routes.event")
router = APIRouter(tags=["DecisionEvent"])


@router.get("/events", response_model=List[EventSummary])
@router.get("/event", response_model=List[EventSummary])
def list_events(
    provider: ProviderManager = Depends(get_provider_manager),
):
    """Retrieve list of all active event summaries for navigation and selection."""
    try:
        summaries = provider.get_events_summary()
        return [EventSummary(**s) for s in summaries]
    except Exception as exc:
        logger.error(f"Failed to list events: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/event/{id}", response_model=DecisionObject)
def get_event(
    id: str = Path(..., description="Unique event identifier (e.g. E001)"),
    simulate_radar_outage: bool = Query(
        False, description="Simulate Doppler radar outage and trigger degraded satellite fallback"
    ),
    provider: ProviderManager = Depends(get_provider_manager),
):
    """
    Retrieve joined DecisionObject for an emergency event.
    Combines rainfall nowcast, inundation model, population/asset impact,
    priority level, actionable recommendations, timeline, and prototype response route.
    """
    try:
        event_data = provider.get_decision_event(event_id=id, simulate_radar_outage=simulate_radar_outage)
        return DecisionObject(**event_data)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.error(f"Failed to retrieve event {id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")