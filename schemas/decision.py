"""
Decision Schema - Pydantic v2
Contract specification for joined Decision Object returned by /api/v1/event/{id}.
Status: PROTOTYPE 🟡
"""
from typing import List, Literal
from pydantic import BaseModel, Field
from schemas.rainfall import RainfallOutput
from schemas.inundation import InundationOutput


class Location(BaseModel):
    zone_id: str = Field(..., description="Target zone identifier")


class Impact(BaseModel):
    population_exposed: int = Field(..., description="Estimated population in affected area")
    critical_assets: int = Field(..., description="Number of critical infrastructure assets exposed")
    roads_affected: int = Field(..., description="Number of major road segments impacted")


class DecisionObject(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    location: Location = Field(..., description="Geographic zone location")
    rainfall: RainfallOutput = Field(..., description="Rainfall forecast details")
    inundation: InundationOutput = Field(..., description="Inundation risk forecast details")
    confidence: float = Field(..., description="Fused confidence score [0-1]")
    impact: Impact = Field(..., description="Impact evaluation metrics")
    priority: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"] = Field(..., description="Action priority level")
    actions: List[str] = Field(..., description="Recommended emergency response actions")
    data_source: Literal["LIVE", "PRECOMPUTED_REPLAY"] = Field(
        "PRECOMPUTED_REPLAY", description="Data provenance indicator: LIVE or PRECOMPUTED_REPLAY"
    )
    status: Literal["VERIFIED", "PROTOTYPE", "ARCHITECTURE", "CONCEPT"] = Field(
        "PROTOTYPE", description="Capability verification status tag"
    )
