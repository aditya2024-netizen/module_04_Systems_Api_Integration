"""
Inundation Model Provider (R&D-2 Swap Point)
HydroSurge AI | SIH PS 26071
Status: ARCHITECTURE 🔵

Real ML model provider stub for DEM/flood depth and spatial risk map outputs.
Pending real model artifacts and export pipeline from R&D-2.
"""
from typing import Any, Dict, List, Optional
from providers.base import ForecastProvider, RiskProvider


class InundationModelProvider(ForecastProvider, RiskProvider):
    """
    Real ML provider for inundation and flood risk forecasts.
    Raises NotImplementedError until R&D-2 artifacts are wired.
    Status: ARCHITECTURE 🔵
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        # Real provider will load risk_map.tif / flood_metrics.json here

    def get_forecast(self, event_id: str) -> Dict[str, Any]:
        raise NotImplementedError(
            "InundationModelProvider not yet wired — real model output pending from R&D-2"
        )

    def get_rainfall(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        raise NotImplementedError(
            "InundationModelProvider does not produce rainfall outputs — consult RainfallModelProvider"
        )

    def get_inundation(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        raise NotImplementedError(
            "InundationModelProvider not yet wired — real model output pending from R&D-2"
        )

    def get_event(self, event_id: str) -> Dict[str, Any]:
        raise NotImplementedError(
            "InundationModelProvider not yet wired — real model output pending from R&D-2"
        )

    def get_risk(self, zone_id: Optional[str] = None) -> List[Dict[str, Any]]:
        raise NotImplementedError(
            "InundationModelProvider not yet wired — real model output pending from R&D-2"
        )