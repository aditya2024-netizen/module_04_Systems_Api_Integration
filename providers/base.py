"""
Base Provider Interfaces
HydroSurge AI | SIH PS 26071
Status: VERIFIED 🟢
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class ForecastProvider(ABC):
    """Abstract base class for rainfall and event forecast providers."""

    @abstractmethod
    def get_forecast(self, event_id: str) -> Dict[str, Any]:
        """Retrieve forecast details for a specific event."""
        pass

    @abstractmethod
    def get_rainfall(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Retrieve rainfall output for an event_id or zone_id."""
        pass

    @abstractmethod
    def get_inundation(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Retrieve inundation output for an event_id or zone_id."""
        pass

    @abstractmethod
    def get_event(self, event_id: str) -> Dict[str, Any]:
        """Retrieve full decision object for an event_id."""
        pass


class RiskProvider(ABC):
    """Abstract base class for spatial risk and tile providers."""

    @abstractmethod
    def get_risk(self, zone_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve spatial risk tiles, optionally filtered by zone_id."""
        pass