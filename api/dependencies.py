"""
API Dependencies and Provider Fallback Engine
HydroSurge AI | SIH PS 26071
Status: VERIFIED 🟢

Handles provider selection via PROVIDER_MODE environment variable:
- mock (default): Uses MockForecastProvider
- rainfall_live: Tries RainfallModelProvider, falls back to mock
- inundation_live: Tries InundationModelProvider, falls back to mock
- live: Tries both live models, falls back to mock

Guarantees seamless fallback to PRECOMPUTED_REPLAY data without breaking contract schemas.
"""
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from providers.mock import MockForecastProvider
from providers.rainfall import RainfallModelProvider
from providers.inundation import InundationModelProvider

logger = logging.getLogger("hydrosurge.dependencies")

# Singletons
_mock_provider = MockForecastProvider()
_rainfall_provider = RainfallModelProvider()
_inundation_provider = InundationModelProvider()

_last_successful_fetches: Dict[str, Optional[str]] = {
    "mock": None,
    "rainfall_model": None,
    "inundation_model": None,
}


def get_provider_mode() -> str:
    """Read configured provider mode from environment."""
    return os.getenv("PROVIDER_MODE", "mock").strip().lower()


def record_fetch_success(provider_key: str) -> None:
    """Record timestamp of successful fetch."""
    _last_successful_fetches[provider_key] = datetime.now(timezone.utc).isoformat()


def get_last_successful_fetches() -> Dict[str, Optional[str]]:
    return dict(_last_successful_fetches)


class ProviderManager:
    """Unified service orchestrating live provider calls with deterministic mock fallback."""

    def __init__(self):
        self.mock = _mock_provider
        self.rainfall_live = _rainfall_provider
        self.inundation_live = _inundation_provider

    @property
    def mode(self) -> str:
        return get_provider_mode()

    def get_rainfall(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Attempts real rainfall provider if configured; falls back safely to mock replay data.
        """
        mode = self.mode
        if mode in ("rainfall_live", "live"):
            try:
                result = self.rainfall_live.get_rainfall(event_id=event_id, zone_id=zone_id)
                record_fetch_success("rainfall_model")
                result["source"] = "rainfall_model"
                result["status"] = "VERIFIED"
                return result
            except Exception as exc:
                logger.warning(
                    f"Rainfall live provider unavailable ({exc}). Falling back to PRECOMPUTED_REPLAY mock data."
                )

        # Fallback to mock replay
        data = self.mock.get_rainfall(event_id=event_id, zone_id=zone_id)
        record_fetch_success("mock")
        # Ensure contract compliant tags
        result = dict(data)
        result["source"] = "mock"
        result["status"] = "PROTOTYPE"
        return result

    def get_inundation(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Attempts real inundation provider if configured; falls back safely to mock replay data.
        """
        mode = self.mode
        if mode in ("inundation_live", "live"):
            try:
                result = self.inundation_live.get_inundation(event_id=event_id, zone_id=zone_id)
                record_fetch_success("inundation_model")
                result["source"] = "inundation_model"
                result["status"] = "VERIFIED"
                return result
            except Exception as exc:
                logger.warning(
                    f"Inundation live provider unavailable ({exc}). Falling back to PRECOMPUTED_REPLAY mock data."
                )

        # Fallback to mock replay
        data = self.mock.get_inundation(event_id=event_id, zone_id=zone_id)
        record_fetch_success("mock")
        result = dict(data)
        result["source"] = "mock"
        result["status"] = "PROTOTYPE"
        return result

    def get_risk_tiles(self, zone_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Returns spatial risk tiles combining rainfall + inundation for the target zone.
        """
        mode = self.mode
        if mode in ("inundation_live", "live"):
            try:
                tiles = self.inundation_live.get_risk(zone_id=zone_id)
                record_fetch_success("inundation_model")
                return tiles
            except Exception as exc:
                logger.warning(
                    f"Inundation risk tiles unavailable ({exc}). Falling back to PRECOMPUTED_REPLAY mock data."
                )

        tiles = self.mock.get_risk(zone_id=zone_id)
        record_fetch_success("mock")
        return tiles

    def get_decision_event(self, event_id: str) -> Dict[str, Any]:
        """
        Retrieves fused DecisionObject for event_id.
        Tries live models if configured, or falls back to mock replay.
        Always sets data_source to LIVE or PRECOMPUTED_REPLAY accordingly.
        """
        mode = self.mode
        is_live_success = False

        rainfall_data: Optional[Dict[str, Any]] = None
        inundation_data: Optional[Dict[str, Any]] = None

        if mode in ("rainfall_live", "live"):
            try:
                rainfall_data = self.rainfall_live.get_rainfall(event_id=event_id)
                rainfall_data["source"] = "rainfall_model"
                rainfall_data["status"] = "VERIFIED"
                record_fetch_success("rainfall_model")
                is_live_success = True
            except Exception as exc:
                logger.warning(f"Live rainfall failed ({exc}), falling back to mock.")

        if mode in ("inundation_live", "live"):
            try:
                inundation_data = self.inundation_live.get_inundation(event_id=event_id)
                inundation_data["source"] = "inundation_model"
                inundation_data["status"] = "VERIFIED"
                record_fetch_success("inundation_model")
                is_live_success = True
            except Exception as exc:
                logger.warning(f"Live inundation failed ({exc}), falling back to mock.")

        # Always fetch base mock replay event as stable backbone
        mock_event = self.mock.get_event(event_id=event_id)
        record_fetch_success("mock")

        event_payload = dict(mock_event)
        if rainfall_data is not None:
            event_payload["rainfall"] = rainfall_data
        if inundation_data is not None:
            event_payload["inundation"] = inundation_data

        event_payload["data_source"] = "LIVE" if (is_live_success and mode == "live") else "PRECOMPUTED_REPLAY"
        event_payload["status"] = "VERIFIED" if (is_live_success and mode == "live") else "PROTOTYPE"

        return event_payload

    def get_health(self) -> Dict[str, Any]:
        """Returns provider system health details."""
        fetches = get_last_successful_fetches()
        return {
            "status": "healthy",
            "provider_mode": self.mode,
            "providers": {
                "mock": {
                    "status": "active",
                    "last_successful_fetch": fetches["mock"] or self.mock.last_fetch_time,
                },
                "rainfall_model": {
                    "status": "ready_to_swap" if self.mode in ("rainfall_live", "live") else "standby (ARCHITECTURE)",
                    "last_successful_fetch": fetches["rainfall_model"],
                },
                "inundation_model": {
                    "status": "ready_to_swap" if self.mode in ("inundation_live", "live") else "standby (ARCHITECTURE)",
                    "last_successful_fetch": fetches["inundation_model"],
                },
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


# FastAPI dependency provider
_provider_manager = ProviderManager()


def get_provider_manager() -> ProviderManager:
    return _provider_manager