"""
Rainfall Schema - Pydantic v2
Contract specification for R&D-1 Rainfall Engine outputs.
Status: PROTOTYPE 🟡
"""
from typing import Literal
from pydantic import BaseModel, Field


class RainfallOutput(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    zone_id: str = Field(..., description="Target zone identifier")
    valid_time: str = Field(..., description="Timestamp of validity in ISO 8601 format")
    lead_minutes: int = Field(..., ge=0, description="Forecast lead time in minutes")
    rainfall_mm_hr: float = Field(..., ge=0.0, description="Rainfall intensity in mm/hr")
    rainfall_accumulation_mm: float = Field(..., ge=0.0, description="Rainfall accumulation in mm")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score [0-1]")
    prediction_uri: str = Field(..., description="URI to forecast raster or prediction asset")
    source: str = Field("mock", description="Data source: mock or rainfall_model")
    status: Literal["VERIFIED", "PROTOTYPE", "ARCHITECTURE", "CONCEPT"] = Field(
        "PROTOTYPE", description="Capability verification status tag"
    )
