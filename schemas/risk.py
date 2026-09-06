"""
Risk Tile Schema - Pydantic v2
Contract specification for spatial risk and tile outputs.
Status: PROTOTYPE 🟡
"""
from pydantic import BaseModel, Field


class RiskTile(BaseModel):
    tile_id: str = Field(..., description="Unique tile identifier")
    zone_id: str = Field(..., description="Target zone identifier")
    timestamp: str = Field(..., description="Timestamp in ISO 8601 format")
    rainfall_mm_hr: float = Field(..., description="Rainfall intensity in mm/hr")
    flood_probability: float = Field(..., description="Probability of flood occurrence [0-1]")
    depth_band: str = Field(..., description="Inundation depth band e.g. 0.5-1.0m")
    confidence: float = Field(..., description="Fused confidence score [0-1]")
