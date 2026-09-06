"""
Decision Event Endpoint Tests
HydroSurge AI | SIH PS 26071
Status: VERIFIED 🟢
"""
from fastapi.testclient import TestClient
from api.main import app
from schemas.decision import DecisionObject

client = TestClient(app)


def test_get_event_valid_e001():
    response = client.get("/api/v1/event/E001")
    assert response.status_code == 200
    data = response.json()
    validated = DecisionObject.model_validate(data)
    assert validated.event_id == "E001"
    assert validated.priority == "CRITICAL"
    assert validated.location.zone_id == "Z42"
    assert validated.rainfall.rainfall_mm_hr == 87.0
    assert validated.inundation.flood_probability == 0.87
    assert validated.data_source == "PRECOMPUTED_REPLAY"
    assert "ALERT" in validated.actions
    assert validated.timeline is not None
    assert len(validated.timeline) >= 4


def test_get_event_not_found():
    response = client.get("/api/v1/event/E999")
    assert response.status_code == 404