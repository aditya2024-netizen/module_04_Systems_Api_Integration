"""
API routes module exports.
"""
from api.routes.rainfall import router as rainfall_router
from api.routes.inundation import router as inundation_router
from api.routes.risk import router as risk_router
from api.routes.event import router as event_router
from api.routes.health import router as health_router

__all__ = [
    "rainfall_router",
    "inundation_router",
    "risk_router",
    "event_router",
    "health_router",
]