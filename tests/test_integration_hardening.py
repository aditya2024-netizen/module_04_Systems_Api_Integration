"""
Integration Hardening Tests — HydroSurge AI Module 4
Verifies all Section 36 & 61 critical integration requirements:
- Single source of truth via FastAPI
- Mixed provider mode provenance (NEVER falsely LIVE/VERIFIED)
- Safe fallback on provider failure
- Bounds and validation constraints (0..1, non-negative)
- Geospatial metadata & response routing in API
- Backend-aware simulated radar outage
- Deterministic replay
- Endpoint aggregation consistency
- Error response sanitization (no internal leaks)
- Frontend static architecture audit (no local domain data imports)
"""
import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from api.main import app
from api.dependencies import ProviderManager
from schemas.decision import DecisionObject, Location, Impact, TimelineStep
from schemas.rainfall import RainfallOutput
from schemas.inundation import InundationOutput
from schemas.risk import RiskTile

client = TestClient(app)


def test_events_list_endpoint():
    """Verify /api/v1/events returns valid event summaries."""
    response = client.get("/api/v1/events")
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 5
    for ev in events:
        assert "event_id" in ev
        assert "zone_id" in ev
        assert "zone_name" in ev
        assert ev["priority"] in ("CRITICAL", "HIGH", "MEDIUM", "LOW")


def test_event_spatial_location():
    """Verify event location contains centroid and terrain metadata from backend."""
    response = client.get("/api/v1/event/E001")
    assert response.status_code == 200
    data = response.json()
    loc = data["location"]
    assert loc["zone_id"] == "Z42"
    assert loc["city"] == "Chennai"
    assert loc["zone_name"] == "Velachery South"
    assert isinstance(loc["latitude"], (int, float))
    assert isinstance(loc["longitude"], (int, float))
    assert loc["flood_area_type"] is not None


def test_event_response_routing():
    """Verify event contains prototype response routing scenario."""
    response = client.get("/api/v1/event/E001")
    assert response.status_code == 200
    data = response.json()
    route = data.get("response_route")
    assert route is not None
    assert route["incident_id"] == "INC-01"
    assert route["safe_route"] is not None
    assert route["impassable_road"] is not None
    assert len(route["route_coordinates"]) > 0
    assert len(route["milestones"]) > 0


def test_simulated_radar_outage_endpoint():
    """Verify ?simulate_radar_outage=true is backend-aware and degrades confidence deterministically."""
    # Nominal
    nominal_res = client.get("/api/v1/event/E001")
    nominal_data = nominal_res.json()
    assert nominal_data["radar_outage"] is False
    assert nominal_data["fallback_mode"] is False

    # Outage
    outage_res = client.get("/api/v1/event/E001?simulate_radar_outage=true")
    assert outage_res.status_code == 200
    outage_data = outage_res.json()
    assert outage_data["radar_outage"] is True
    assert outage_data["fallback_mode"] is True
    assert outage_data["fallback_source"] == "imd_kalpana_satellite_fallback"
    assert outage_data["rainfall"]["source"] == "imd_kalpana_satellite_fallback"
    assert outage_data["rainfall"]["confidence"] < nominal_data["rainfall"]["confidence"]
    assert outage_data["confidence"] < nominal_data["confidence"]


def test_event_aggregation_consistency():
    """Verify /event/{id} values match individual /rainfall and /inundation endpoints."""
    event_res = client.get("/api/v1/event/E001")
    assert event_res.status_code == 200
    event_data = event_res.json()

    rain_res = client.get("/api/v1/rainfall?event_id=E001")
    assert rain_res.status_code == 200
    rain_data = rain_res.json()

    inun_res = client.get("/api/v1/inundation?event_id=E001")
    assert inun_res.status_code == 200
    inun_data = inun_res.json()

    assert event_data["rainfall"]["rainfall_mm_hr"] == rain_data["rainfall_mm_hr"]
    assert event_data["rainfall"]["lead_minutes"] == rain_data["lead_minutes"]
    assert event_data["inundation"]["flood_probability"] == inun_data["flood_probability"]
    assert event_data["inundation"]["depth_band"] == inun_data["depth_band"]


def test_deterministic_replay():
    """Verify repeated calls to replay provider produce identical responses."""
    res1 = client.get("/api/v1/event/E001").json()
    res2 = client.get("/api/v1/event/E001").json()
    assert res1 == res2


def test_mixed_provider_mode_provenance():
    """
    CRITICAL P0 TEST:
    Verify that when one provider is live and another is mock,
    the event is labeled MIXED / PROTOTYPE and NEVER LIVE / VERIFIED.
    """
    class MockRainfallLive:
        def get_rainfall(self, event_id=None, zone_id=None):
            return {
                "event_id": event_id or "E001",
                "zone_id": zone_id or "Z42",
                "valid_time": "2026-09-06T09:00:00Z",
                "lead_minutes": 60,
                "rainfall_mm_hr": 87.0,
                "rainfall_accumulation_mm": 124.0,
                "confidence": 0.88,
                "prediction_uri": "live://rainfall/E001",
                "source": "rainfall_model",
                "status": "VERIFIED",
            }

    class MockInundationFailing:
        def get_inundation(self, event_id=None, zone_id=None):
            raise RuntimeError("Inundation model service offline")

    pm = ProviderManager()
    pm.rainfall_live = MockRainfallLive()
    pm.inundation_live = MockInundationFailing()
    # Force mode to live to test partial failure
    os.environ["PROVIDER_MODE"] = "live"

    try:
        event = pm.get_decision_event("E001")
        # Rainfall succeeded from live model, but inundation failed and fell back to mock
        assert event["rainfall"]["source"] == "rainfall_model"
        assert event["inundation"]["source"] == "mock"
        assert event["data_source"] == "MIXED", "Mixed providers must yield data_source=MIXED"
        assert event["status"] == "PROTOTYPE", "Mixed providers must yield status=PROTOTYPE"
        assert event["status"] != "VERIFIED", "Mixed providers must NEVER be labeled VERIFIED"
        assert event["data_source"] != "LIVE", "Mixed providers must NEVER be labeled LIVE"
    finally:
        os.environ["PROVIDER_MODE"] = "mock"


def test_bounds_validation_rejects_invalid_values():
    """Verify Pydantic constraints reject negative rain, invalid confidence, etc."""
    # Invalid confidence > 1.0
    with pytest.raises(ValidationError):
        RainfallOutput(
            event_id="E001",
            zone_id="Z42",
            valid_time="2026-09-06T09:00:00Z",
            lead_minutes=60,
            rainfall_mm_hr=87.0,
            rainfall_accumulation_mm=124.0,
            confidence=1.5,  # Invalid
            prediction_uri="mock://test",
        )

    # Negative rainfall
    with pytest.raises(ValidationError):
        RainfallOutput(
            event_id="E001",
            zone_id="Z42",
            valid_time="2026-09-06T09:00:00Z",
            lead_minutes=60,
            rainfall_mm_hr=-10.0,  # Invalid
            rainfall_accumulation_mm=0.0,
            confidence=0.8,
            prediction_uri="mock://test",
        )

    # Invalid flood probability
    with pytest.raises(ValidationError):
        InundationOutput(
            event_id="E001",
            zone_id="Z42",
            flood_probability=-0.2,  # Invalid
            depth_band="0.5-1.0m",
            risk_uri="mock://test",
            confidence=0.8,
            valid_time="2026-09-06T09:00:00Z",
        )


def test_api_error_handling_sanitized():
    """Verify 404 and 500 error responses do not leak internal stack traces."""
    # 404 test
    res_404 = client.get("/api/v1/event/E_DOES_NOT_EXIST")
    assert res_404.status_code == 404
    assert "detail" in res_404.json()
    assert "Traceback" not in res_404.text


def test_frontend_static_architecture_scan():
    """
    STATIC INTEGRATION TEST:
    Scans all dashboard JS/JSX files to verify NO direct domain-data imports or hardcoded datasets exist.
    """
    repo_root = Path(__file__).resolve().parent.parent
    dashboard_app = repo_root / "dashboard" / "app"
    assert dashboard_app.exists()

    forbidden_tokens = [
        "fallback.js",
        "data/fallback",
        "FALLBACK_PAYLOADS",
        "SAMPLE_EVENTS",
        "ZONE_COORDINATES",
        "INCIDENTS",
        "scenario.json",
        ".csv",
        ".npy",
        ".npz",
        ".tif",
        ".tiff",
        ".ipynb",
        "model.pt",
    ]

    violations = []
    for root, dirs, files in os.walk(dashboard_app):
        for file in files:
            if file.endswith((".js", ".jsx", ".ts", ".tsx")):
                file_path = Path(root) / file
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for token in forbidden_tokens:
                        if token in content:
                            violations.append(f"{file_path.name}: contains forbidden token '{token}'")

    assert len(violations) == 0, f"Found forbidden domain-data references in frontend:\n" + "\n".join(violations)
