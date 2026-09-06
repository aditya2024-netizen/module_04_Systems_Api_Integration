"""
Rainfall Model Provider (R&D-1 Swap Point)
HydroSurge AI | SIH PS 26071
Status: ARCHITECTURE 🔵

Real ML model provider stub for DGMR / ConvLSTM rainfall nowcasting outputs.
Pending real model artifacts and export pipeline from R&D-1.
"""
from typing import Any, Dict, List, Optional
from providers.base import ForecastProvider


class RainfallModelProvider(ForecastProvider):
    """
    Real ML provider for rainfall forecasts.
    Raises NotImplementedError until R&D-1 artifacts are wired.
    Status: ARCHITECTURE 🔵
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        # Real provider will load model.pt / prediction.npy here

    def get_forecast(self, event_id: str) -> Dict[str, Any]:
        raise NotImplementedError(
            "RainfallModelProvider not yet wired — real model output pending from R&D-1"
        )

    def get_rainfall(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        raise NotImplementedError(
            "RainfallModelProvider not yet wired — real model output pending from R&D-1"
        )

    def get_inundation(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        raise NotImplementedError(
            "RainfallModelProvider does not produce inundation outputs — consult InundationModelProvider"
        )

    def get_event(self, event_id: str) -> Dict[str, Any]:
        raise NotImplementedError(
            "RainfallModelProvider not yet wired — real model output pending from R&D-1"
        )