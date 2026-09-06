"""
Inundation Schema - Pydantic v2
Contract specification for R&D-2 Inundation Engine outputs.
Status: PROTOTYPE 🟡
"""
from typing import Literal
from pydantic import BaseModel, Field


class InundationOutput(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    zone_id: str = Field(..., description="Target zone identifier")
    flood_probability: float = Field(..., ge=0.0, le=1.0, description="Probability of flood occurrence [0-1]")
    depth_band: str = Field(..., description="Inundation depth band e.g. 0.5-1.0m")
    risk_uri: str = Field(..., description="URI to flood risk map or raster asset")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score [0-1]")
    valid_time: str = Field(..., description="Timestamp of validity in ISO 8601 format")
    source: str = Field("mock", description="Data source: mock or inundation_model")
    status: Literal["VERIFIED", "PROTOTYPE", "ARCHITECTURE", "CONCEPT"] = Field(
        "PROTOTYPE", description="Capability verification status tag"
    )
