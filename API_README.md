# HydroSurge AI — Module 4: Systems & API Integration Layer
**SIH Problem Statement 26071**  
*Unified contract-driven service connecting Rainfall Forecast, Flood Inundation, Spatial Risk, and Emergency Decision Engines.*

---

## 1. Architectural Principles

1. **Frontend Single Source of Truth**: The React/Next.js dashboard consumes all domain data exclusively via the versioned FastAPI contract (`/api/v1/*`). The dashboard contains no local scenario datasets, no hardcoded coordinates, and no direct filesystem reads.
2. **Deterministic Replay Backbone**: In mock mode, the API gateway is backed by `demo/replay/scenario.json`, serving deterministic, contract-compliant responses as a fail-safe.
3. **Provider Abstraction**: MOD_1 (Rainfall ML) and MOD_2 (Inundation ML) plug directly into Python provider adapters (`providers/rainfall.py`, `providers/inundation.py`) without requiring any changes to the frontend.
4. **Honest Provenance Model**: Explicit source tracking ensures mixed provider states are honestly labeled `MIXED / PROTOTYPE 🟡`. `VERIFIED 🟢` is restricted to fully validated live outputs.

---

## 2. Quick Start Commands

### Backend Service (FastAPI)
```bash
pip install -r requirements.txt
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at:
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Running Automated Test Suite
```bash
pytest -v
```

### Dashboard (Next.js)
```bash
cd dashboard
npm ci
npm run dev -- -p 3000
```
- Dashboard UI: [http://127.0.0.1:3000](http://127.0.0.1:3000)

---

## 3. API Endpoints Contract

The API exposes the following contract-compliant endpoints under `/api/v1`:

### 1. `GET /api/v1/health`
Checks service health, reports active provider mode, and last successful fetch per provider.

**Sample Response (200 OK):**
```json
{
  "status": "healthy",
  "provider_mode": "mock",
  "providers": {
    "mock": {
      "status": "active",
      "last_successful_fetch": "2026-09-06T09:00:00Z"
    },
    "rainfall_model": {
      "status": "standby (ARCHITECTURE)",
      "last_successful_fetch": null
    },
    "inundation_model": {
      "status": "standby (ARCHITECTURE)",
      "last_successful_fetch": null
    }
  },
  "timestamp": "2026-09-06T09:00:00Z"
}
```

---

### 2. `GET /api/v1/events` (and `GET /api/v1/event`)
Returns list of all available event summaries for navigation and selector controls.

**Sample Response (200 OK):**
```json
[
  {
    "event_id": "E001",
    "zone_id": "Z42",
    "zone_name": "Velachery South",
    "priority": "CRITICAL"
  },
  {
    "event_id": "E002",
    "zone_id": "Z18",
    "zone_name": "Saidapet Adyar",
    "priority": "HIGH"
  }
]
```

---

### 3. `GET /api/v1/event/{id}`
Authoritative single source of truth for an emergency incident. Combines nowcast rainfall, inundation depth bands, population impact, actions, timeline progression, and response routing.

**Query Parameters:**
- `simulate_radar_outage` (`bool`, default: `false`): Simulates Doppler radar failure and triggers degraded satellite/gauge fallback with adjusted confidence.

**Sample Request:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/event/E001"
```

**Sample Response (200 OK):**
```json
{
  "event_id": "E001",
  "location": {
    "zone_id": "Z42",
    "city": "Chennai",
    "zone_name": "Velachery South",
    "latitude": 12.9815,
    "longitude": 80.218,
    "flood_area_type": "Depression Bowl"
  },
  "rainfall": {
    "event_id": "E001",
    "zone_id": "Z42",
    "valid_time": "2026-09-06T09:00:00Z",
    "lead_minutes": 60,
    "rainfall_mm_hr": 87.0,
    "rainfall_accumulation_mm": 124.0,
    "confidence": 0.84,
    "prediction_uri": "mock://rainfall/E001",
    "source": "mock",
    "status": "PROTOTYPE"
  },
  "inundation": {
    "event_id": "E001",
    "zone_id": "Z42",
    "flood_probability": 0.87,
    "depth_band": "0.5-1.0m",
    "risk_uri": "mock://inundation/E001",
    "confidence": 0.81,
    "valid_time": "2026-09-06T09:00:00Z",
    "source": "mock",
    "status": "PROTOTYPE"
  },
  "confidence": 0.81,
  "impact": {
    "population_exposed": 21400,
    "critical_assets": 3,
    "roads_affected": 2
  },
  "priority": "CRITICAL",
  "actions": [
    "ALERT",
    "CLOSE_ROAD",
    "DEPLOY_TEAM"
  ],
  "data_source": "PRECOMPUTED_REPLAY",
  "status": "PROTOTYPE",
  "timeline": [
    {
      "timestamp": "2026-09-06T07:00:00Z",
      "lead_minutes": 0,
      "rainfall_mm_hr": 25.0,
      "rainfall_accumulation_mm": 25.0,
      "flood_probability": 0.2,
      "depth_band": "<0.1m",
      "step_label": "T+00"
    }
  ],
  "response_route": {
    "incident_id": "INC-01",
    "title": "Critical Ward 42 Rescue & Evacuation",
    "lead_time": "T-20 min",
    "risk_score": 0.92,
    "impassable_road": "Velachery Main Road (Near Lake)",
    "safe_route": "Inner Ring Road -> OMR Elevated Bypass",
    "route_coordinates": [[12.9815, 80.218], [12.99, 80.23], [13.005, 80.245], [13.015, 80.255]],
    "blocked_coordinates": [[12.978, 80.215], [12.983, 80.221]],
    "milestones": [
      {
        "time": "T-20 min",
        "label": "Velachery low-lying segments become impassable"
      }
    ]
  },
  "radar_outage": false,
  "fallback_mode": false,
  "fallback_source": null
}
```

---

### 4. `GET /api/v1/rainfall`
Fetches nowcast rainfall forecast by `event_id` or `zone_id`.

---

### 5. `GET /api/v1/inundation`
Fetches flood inundation probability and depth band by `event_id` or `zone_id`.

---

### 6. `GET /api/v1/risk`
Fetches spatial risk tiles combining rainfall and flood probability with geographic centroids for map rendering.

---

## 4. Cross-Module Handoff Documentation

- **Contract Specification**: See [INTEGRATION_CONTRACT.md](INTEGRATION_CONTRACT.md) for field-by-field definitions, bounds, and fallback rules.
- **Team Integration Guide**: See [TEAM_INTEGRATION.md](TEAM_INTEGRATION.md) for exact steps to plug in MOD_1, MOD_2, and MOD_3 models.
- **Readiness Audit**: See [INTEGRATION_READY.md](INTEGRATION_READY.md) for the full test verification and hardening report.