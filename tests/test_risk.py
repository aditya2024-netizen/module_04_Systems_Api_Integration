"""
Spatial Risk Endpoint Tests
HydroSurge AI | SIH PS 26071
Status: VERIFIED 🟢
"""
from fastapi.testclient import TestClient
from api.main import app
from schemas.risk import RiskTile

client = TestClient(app)


def test_get_all_risk_tiles():
    response = client.get("/api/v1/risk")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for item in data:
        validated = RiskTile.model_validate(item)
        assert validated.tile_id != ""


def test_get_risk_tiles_filtered_by_zone():
    response = client.get("/api/v1/risk?zone_id=Z42")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for item in data:
        validated = RiskTile.model_validate(item)
        assert validated.zone_id == "Z42"