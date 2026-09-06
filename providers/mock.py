"""
Mock Forecast & Risk Provider
HydroSurge AI | SIH PS 26071
Status: VERIFIED 🟢

Loads deterministic historical scenario data from demo/replay/scenario.json
and provides contract-compliant responses for rainfall, inundation, risk, and events.
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from providers.base import ForecastProvider, RiskProvider


class MockForecastProvider(ForecastProvider, RiskProvider):
    """
    Deterministic replay provider backed by scenario.json.
    Satisfies both ForecastProvider and RiskProvider contracts.
    """

    def __init__(self, scenario_path: Optional[str] = None):
        if scenario_path is None:
            # Default to demo/replay/scenario.json relative to repository root
            base_dir = Path(__file__).resolve().parent.parent
            scenario_path = str(base_dir / "demo" / "replay" / "scenario.json")

        self.scenario_path = scenario_path
        self._last_fetch_time: str = datetime.now(timezone.utc).isoformat()
        self._data: Dict[str, Any] = {}
        self._load_scenario()

    def _load_scenario(self) -> None:
        """Load and parse the replay scenario JSON file."""
        if not os.path.exists(self.scenario_path):
            raise FileNotFoundError(f"Scenario file not found at: {self.scenario_path}")

        with open(self.scenario_path, "r", encoding="utf-8") as f:
            self._data = json.load(f)
        self._last_fetch_time = datetime.now(timezone.utc).isoformat()

    @property
    def last_fetch_time(self) -> str:
        return self._last_fetch_time

    @property
    def events(self) -> List[Dict[str, Any]]:
        return self._data.get("events", [])

    @property
    def risk_tiles(self) -> List[Dict[str, Any]]:
        return self._data.get("risk_tiles", [])

    def get_forecast(self, event_id: str) -> Dict[str, Any]:
        """Return rainfall forecast for an event_id."""
        return self.get_rainfall(event_id=event_id)

    def get_rainfall(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieve rainfall output for an event_id or zone_id.
        Raises ValueError if not found.
        """
        self._last_fetch_time = datetime.now(timezone.utc).isoformat()
        for ev in self.events:
            if event_id and ev.get("event_id") == event_id:
                return ev["rainfall"]
            if zone_id and ev.get("location", {}).get("zone_id") == zone_id:
                return ev["rainfall"]

        # Default fallback to first event if neither specified
        if not event_id and not zone_id and self.events:
            return self.events[0]["rainfall"]

        identifier = f"event_id={event_id}" if event_id else f"zone_id={zone_id}"
        raise ValueError(f"Rainfall record not found for {identifier}")

    def get_inundation(
        self, event_id: Optional[str] = None, zone_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieve inundation output for an event_id or zone_id.
        Raises ValueError if not found.
        """
        self._last_fetch_time = datetime.now(timezone.utc).isoformat()
        for ev in self.events:
            if event_id and ev.get("event_id") == event_id:
                return ev["inundation"]
            if zone_id and ev.get("location", {}).get("zone_id") == zone_id:
                return ev["inundation"]

        if not event_id and not zone_id and self.events:
            return self.events[0]["inundation"]

        identifier = f"event_id={event_id}" if event_id else f"zone_id={zone_id}"
        raise ValueError(f"Inundation record not found for {identifier}")

    def get_event(self, event_id: str) -> Dict[str, Any]:
        """
        Retrieve joined DecisionObject for an event_id.
        Raises ValueError if event_id not found.
        """
        self._last_fetch_time = datetime.now(timezone.utc).isoformat()
        for ev in self.events:
            if ev.get("event_id") == event_id:
                # Return dictionary matching DecisionObject schema
                return {
                    "event_id": ev["event_id"],
                    "location": ev["location"],
                    "rainfall": ev["rainfall"],
                    "inundation": ev["inundation"],
                    "confidence": ev["confidence"],
                    "impact": ev["impact"],
                    "priority": ev["priority"],
                    "actions": ev["actions"],
                    "data_source": "PRECOMPUTED_REPLAY",
                    "status": "PROTOTYPE",
                }

        raise ValueError(f"Event not found for event_id={event_id}")

    def get_risk(self, zone_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieve risk tiles, optionally filtered by zone_id.
        """
        self._last_fetch_time = datetime.now(timezone.utc).isoformat()
        if zone_id:
            return [t for t in self.risk_tiles if t.get("zone_id") == zone_id]
        return list(self.risk_tiles)