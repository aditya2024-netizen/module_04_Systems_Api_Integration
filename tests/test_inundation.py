"""
Inundation Endpoint Tests
HydroSurge AI | SIH PS 26071
Status: VERIFIED 🟢
"""
from fastapi.testclient import TestClient
from api.main import app
from schemas.inundation import InundationOutput

client = TestClient(app)


def test_get_inundation_by_event_id():
    response = client.get("/api/v1/inundation?event_id=E001")
    assert response.status_code == 200
    data = response.json()
    validated = InundationOutput.model_validate(data)
    assert validated.event_id == "E001"
    assert validated.flood_probability == 0.87
    assert validated.depth_band == "0.5-1.0m"
    assert validated.source == "mock"


def test_get_inundation_by_zone_id():
    response = client.get("/api/v1/inundation?zone_id=Z18")
    assert response.status_code == 200
    data = response.json()
    validated = InundationOutput.model_validate(data)
    assert validated.zone_id == "Z18"
    assert validated.flood_probability == 0.76


def test_get_inundation_not_found():
    response = client.get("/api/v1/inundation?event_id=NON_EXISTENT")
    assert response.status_code == 404