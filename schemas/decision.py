"""
Decision Schema - Pydantic v2
Contract specification for joined Decision Object returned by /api/v1/event/{id}.
Status: PROTOTYPE 🟡
"""
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field
from schemas.rainfall import RainfallOutput
from schemas.inundation import InundationOutput


class Location(BaseModel):
    zone_id: str = Field(..., description="Target zone identifier")
    city: Optional[str] = Field("Chennai", description="City location identifier")
    zone_name: Optional[str] = Field(None, description="Descriptive zone name e.g. Velachery South")
    latitude: Optional[float] = Field(None, description="Zone centroid latitude in WGS84")
    longitude: Optional[float] = Field(None, description="Zone centroid longitude in WGS84")
    flood_area_type: Optional[str] = Field(None, description="Topography classification e.g. Depression Bowl")


class Impact(BaseModel):
    population_exposed: int = Field(..., ge=0, description="Estimated population in affected area")
    critical_assets: int = Field(..., ge=0, description="Number of critical infrastructure assets exposed")
    roads_affected: int = Field(..., ge=0, description="Number of major road segments impacted")


class TimelineStep(BaseModel):
    timestamp: str = Field(..., description="Timestamp in ISO 8601 format")
    lead_minutes: int = Field(..., ge=0, description="Forecast lead minutes from baseline")
    rainfall_mm_hr: float = Field(..., ge=0.0, description="Rainfall intensity in mm/hr")
    rainfall_accumulation_mm: float = Field(..., ge=0.0, description="Rainfall accumulation in mm")
    flood_probability: float = Field(..., ge=0.0, le=1.0, description="Flood probability [0-1]")
    depth_band: str = Field(..., description="Depth band e.g. 0.5-1.0m")
    step_label: Optional[str] = Field(None, description="Step label e.g. T+15")


class Milestone(BaseModel):
    time: str = Field(..., description="Milestone time offset e.g. T-20 min")
    label: str = Field(..., description="Milestone impact description")


class ResponseRoute(BaseModel):
    incident_id: Optional[str] = Field(None, description="Incident identifier e.g. INC-01")
    title: Optional[str] = Field(None, description="Incident title")
    lead_time: Optional[str] = Field(None, description="Lead time description")
    risk_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Risk score")
    impassable_road: Optional[str] = Field(None, description="Impassable road description")
    safe_route: Optional[str] = Field(None, description="Safe route description")
    route_coordinates: Optional[List[List[float]]] = Field(None, description="Safe route coordinates [lat, lng]")
    blocked_coordinates: Optional[List[List[float]]] = Field(None, description="Blocked choke point coordinates [lat, lng]")
    milestones: Optional[List[Milestone]] = Field(None, description="Sequence of impact milestones")


class EventSummary(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    zone_id: str = Field(..., description="Target zone identifier")
    zone_name: Optional[str] = Field(None, description="Descriptive zone name")
    priority: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"] = Field(..., description="Action priority level")


class DecisionObject(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    location: Location = Field(..., description="Geographic zone location")
    rainfall: RainfallOutput = Field(..., description="Rainfall forecast details")
    inundation: InundationOutput = Field(..., description="Inundation risk forecast details")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Fused confidence score [0-1]")
    impact: Impact = Field(..., description="Impact evaluation metrics")
    priority: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"] = Field(..., description="Action priority level")
    actions: List[str] = Field(..., description="Recommended emergency response actions")
    data_source: Literal["LIVE", "PRECOMPUTED_REPLAY", "MOCK", "MIXED"] = Field(
        "PRECOMPUTED_REPLAY", description="Data provenance indicator: LIVE, PRECOMPUTED_REPLAY, MOCK, or MIXED"
    )
    status: Literal["VERIFIED", "PROTOTYPE", "ARCHITECTURE", "CONCEPT"] = Field(
        "PROTOTYPE", description="Capability verification status tag"
    )
    timeline: Optional[List[TimelineStep]] = Field(
        default=None, description="Time-series progression steps"
    )
    response_route: Optional[ResponseRoute] = Field(
        default=None, description="Prototype response routing scenario"
    )
    radar_outage: bool = Field(
        default=False, description="Simulated radar outage flag"
    )
    fallback_mode: bool = Field(
        default=False, description="Whether fallback mode is active"
    )
    fallback_source: Optional[str] = Field(
        default=None, description="Fallback sensor source identifier"
    )