"""
Contract and Schema Compliance Tests
HydroSurge AI | SIH PS 26071
Status: VERIFIED 🟢

Validates demo/replay/scenario.json against all Pydantic v2 schemas:
- RainfallOutput (schemas.rainfall)
- InundationOutput (schemas.inundation)
- RiskTile (schemas.risk)
- DecisionObject (schemas.decision)
"""
import json
import os
from pathlib import Path
import pytest
from schemas import DecisionObject, InundationOutput, RainfallOutput, RiskTile


@pytest.fixture(scope="module")
def scenario_data():
    base_dir = Path(__file__).resolve().parent.parent
    scenario_path = base_dir / "demo" / "replay" / "scenario.json"
    assert scenario_path.exists(), f"scenario.json not found at {scenario_path}"
    with open(scenario_path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_scenario_structure(scenario_data):
    """Verify scenario root attributes."""
    assert "scenario_metadata" in scenario_data
    assert "events" in scenario_data
    assert "risk_tiles" in scenario_data
    assert len(scenario_data["events"]) >= 3, "Scenario must contain at least 3 events"


def test_rainfall_contract(scenario_data):
    """Validate every rainfall payload strictly against RainfallOutput schema."""
    for event in scenario_data["events"]:
        assert "rainfall" in event
        rain = RainfallOutput.model_validate(event["rainfall"])
        assert rain.event_id == event["event_id"]
        assert rain.rainfall_mm_hr >= 0.0
        assert rain.rainfall_accumulation_mm >= 0.0
        assert 0.0 <= rain.confidence <= 1.0
        assert rain.source in ("mock", "rainfall_model", "live")
        assert rain.status in ("VERIFIED", "PROTOTYPE", "ARCHITECTURE", "CONCEPT")


def test_inundation_contract(scenario_data):
    """Validate every inundation payload strictly against InundationOutput schema."""
    for event in scenario_data["events"]:
        assert "inundation" in event
        inund = InundationOutput.model_validate(event["inundation"])
        assert inund.event_id == event["event_id"]
        assert 0.0 <= inund.flood_probability <= 1.0
        assert 0.0 <= inund.confidence <= 1.0
        assert inund.depth_band != ""
        assert inund.source in ("mock", "inundation_model", "live")
        assert inund.status in ("VERIFIED", "PROTOTYPE", "ARCHITECTURE", "CONCEPT")


def test_decision_contract(scenario_data):
    """Validate every event payload strictly against DecisionObject schema."""
    for event in scenario_data["events"]:
        dec = DecisionObject.model_validate(event)
        assert dec.event_id == event["event_id"]
        assert dec.location.zone_id == event["location"]["zone_id"]
        assert 0.0 <= dec.confidence <= 1.0
        assert dec.priority in ("CRITICAL", "HIGH", "MEDIUM", "LOW")
        assert len(dec.actions) > 0
        assert dec.data_source in ("LIVE", "PRECOMPUTED_REPLAY")
        assert dec.status in ("VERIFIED", "PROTOTYPE", "ARCHITECTURE", "CONCEPT")


def test_risk_tile_contract(scenario_data):
    """Validate every risk tile payload strictly against RiskTile schema."""
    for tile in scenario_data["risk_tiles"]:
        t = RiskTile.model_validate(tile)
        assert t.tile_id.startswith("tile_")
        assert t.zone_id.startswith("Z")
        assert t.rainfall_mm_hr >= 0.0
        assert 0.0 <= t.flood_probability <= 1.0
        assert 0.0 <= t.confidence <= 1.0


def test_physical_consistency(scenario_data):
    """Verify physical consistency rule: higher rain correlates with higher flood probability."""
    events = scenario_data["events"]
    # Sort events by rainfall
    sorted_events = sorted(events, key=lambda x: x["rainfall"]["rainfall_mm_hr"], reverse=True)
    # The highest rain event should have a higher flood probability than the lowest
    highest_rain_event = sorted_events[0]
    lowest_rain_event = sorted_events[-1]
    assert (
        highest_rain_event["inundation"]["flood_probability"]
        > lowest_rain_event["inundation"]["flood_probability"]
    )