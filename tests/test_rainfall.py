"""
Rainfall Endpoint Tests
HydroSurge AI | SIH PS 26071
Status: VERIFIED 🟢
"""
from fastapi.testclient import TestClient
from api.main import app
from schemas.rainfall import RainfallOutput

client = TestClient(app)


def test_get_rainfall_by_event_id():
    response = client.get("/api/v1/rainfall?event_id=E001")
    assert response.status_code == 200
    data = response.json()
    validated = RainfallOutput.model_validate(data)
    assert validated.event_id == "E001"
    assert validated.rainfall_mm_hr == 87.0
    assert validated.source == "mock"
    assert validated.status in ("VERIFIED", "PROTOTYPE")


def test_get_rainfall_by_zone_id():
    response = client.get("/api/v1/rainfall?zone_id=Z42")
    assert response.status_code == 200
    data = response.json()
    validated = RainfallOutput.model_validate(data)
    assert validated.zone_id == "Z42"


def test_get_rainfall_not_found():
    response = client.get("/api/v1/rainfall?event_id=NON_EXISTENT")
    assert response.status_code == 404