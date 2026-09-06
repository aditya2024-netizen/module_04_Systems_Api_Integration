"""
Health Endpoint Tests
HydroSurge AI | SIH PS 26071
Status: VERIFIED 🟢
"""
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_health_returns_200_and_provider_mode():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "provider_mode" in data
    assert "providers" in data
    assert "mock" in data["providers"]
    assert data["providers"]["mock"]["status"] == "active"
    assert "rainfall_model" in data["providers"]
    assert "inundation_model" in data["providers"]
    assert "timestamp" in data