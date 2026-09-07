# HydroSurge AI — Module 4 FastAPI Gateway Backend & Integration Guide

The **HydroSurge AI Module 4 API Gateway** is the central architectural bridge connecting quantitative rainfall forecasting (R&D-1), 2D hydrodynamic inundation modeling (R&D-2), GIS spatial metadata, and emergency decision support dashboards.

---

## 1. Architectural Overview & Boundary Invariants

```
                ┌───────────────────────────┐
                │   Mock Provider (Replay)  │
                ├───────────────────────────┤
                │ Rainfall Model Provider   │
                ├───────────────────────────┤
                │ Inundation Model Provider │
                └─────────────┬─────────────┘
                              │
                    Common Pydantic Contract
                              │
                              ▼
                   FastAPI Gateway (/api/v1)
                              │
                              ▼
                        DecisionObject
                              │
                              ▼
                Dashboard (React / Next.js 16)
```

### Strict Integration Rules
- **Contract-First**: All outputs conform strictly to locked Pydantic v2 schemas (`RainfallOutput`, `InundationOutput`, `RiskTile`, `DecisionObject`).
- **Provider Abstraction**: Provider switching happens entirely behind the API boundary via `ProviderManager`. The dashboard consumes the identical JSON schema regardless of provider mode.
- **Frontend Isolation**: The frontend **never** accesses local CSVs, GeoTIFFs, NumPy arrays, PyTorch models (`model.pt`), or Jupyter notebooks. All domain data is consumed over HTTP via `dashboard/app/lib/api.js`.
- **Honest Provenance & Status**:
  - `LIVE` / `VERIFIED` $\rightarrow$ strictly when real ML models are active and succeed.
  - `MIXED` / `PROTOTYPE` $\rightarrow$ when one provider is live and the other falls back to replay.
  - `PRECOMPUTED_REPLAY` / `PROTOTYPE` $\rightarrow$ deterministic replay mode.

---

## 2. Directory Structure

```
api/
├── main.py                  # FastAPI application entrypoint, CORS configuration, route mounting
├── dependencies.py          # ProviderManager, fallback engine, and dependency injection
└── routes/
    ├── __init__.py          # Exported route routers
    ├── health.py            # GET /api/v1/health subsystem diagnostics
    ├── rainfall.py          # GET /api/v1/rainfall precipitation query
    ├── inundation.py        # GET /api/v1/inundation flood probability query
    ├── risk.py              # GET /api/v1/risk spatial risk grid query
    └── event.py             # GET /api/v1/events and GET /api/v1/event/{id}

schemas/
├── __init__.py              # Exported Pydantic v2 contracts
├── rainfall.py              # RainfallOutput schema
├── inundation.py            # InundationOutput schema
├── risk.py                  # RiskTile spatial schema
└── decision.py              # DecisionObject, Location, Impact, TimelineStep, ResponseRoute

providers/
├── base.py                  # ForecastProvider & RiskProvider abstract interfaces
├── mock.py                  # Deterministic replay provider (demo/replay/scenario.json)
├── rainfall.py              # R&D-1 Rainfall ML engine adapter stub
├── inundation.py            # R&D-2 Inundation hydrodynamic solver stub
└── live.py                  # External live telemetric ingestion stub

demo/
└── replay/
    └── scenario.json        # Deterministic GCC Chennai historical scenario dataset (E001-E005)

results/
└── latency.json             # Empirically measured load time, p50/p95 latency, and memory

scripts/
└── benchmark_latency.py     # Automated performance benchmark script

tests/
├── test_contracts.py        # Schema compliance & physical consistency tests
├── test_health.py           # Subsystem health & status diagnostic tests
├── test_rainfall.py         # Rainfall endpoint query & bound tests
├── test_inundation.py       # Inundation endpoint query & bound tests
├── test_risk.py             # Spatial risk tile tests
├── test_event.py            # DecisionObject retrieval tests
└── test_integration_hardening.py # Section 36 & 61 hardening, failover, and static audit tests
```

---

## 3. Installation & Environment Setup

### Prerequisites
- Python 3.11+ (Python 3.13 tested)
- Node.js 18+ & npm (for dashboard)

### Backend Setup
```powershell
# Install backend dependencies
python -m pip install -r requirements.txt
```

### Frontend Setup
```powershell
cd dashboard
npm install
cd ..
```

### Environment Configuration
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Key configuration keys:
- `PROVIDER_MODE`: `mock` (default), `rainfall_live`, `inundation_live`, or `live`
- `API_PORT`: `8000`
- `CORS_ORIGINS`: Allowed origins (e.g. `http://localhost:3000,http://127.0.0.1:3000`)
- `NEXT_PUBLIC_API_BASE_URL`: `http://127.0.0.1:8000/api/v1`

---

## 4. Starting the Service

### One-Command Quick Start (Both Backend + Frontend)
```powershell
.\start_all.bat
```

### Manual Service Launch

#### 1. FastAPI Gateway (Port 8000)
```powershell
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Base URL**: `http://127.0.0.1:8000/api/v1`
- **Interactive OpenAPI Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

#### 2. Next.js Dashboard (Port 3000)
```powershell
cd dashboard
npm run dev
```
- **Dashboard UI**: `http://localhost:3000`

---

## 5. API Endpoint Reference

All endpoints are versioned under `/api/v1`.

### 1. `GET /api/v1/health`
Returns gateway subsystem diagnostics, active provider mode, and last fetch timestamp per provider.

**Example Request:**
```bash
curl -s http://127.0.0.1:8000/api/v1/health
```

**Example Response (200 OK):**
```json
{
  "status": "healthy",
  "provider_mode": "mock",
  "providers": {
    "mock": {
      "status": "active",
      "last_successful_fetch": "2026-09-07T14:02:00.123456Z"
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
  "timestamp": "2026-09-07T14:02:00.125000Z"
}
```

---

### 2. `GET /api/v1/rainfall`
Retrieves quantitative precipitation nowcast. Accepts `event_id` or `zone_id`. Supports simulated radar outage.

**Query Parameters:**
| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| `event_id` | `string` | Optional | Event identifier (e.g. `E001`) |
| `zone_id` | `string` | Optional | Zone identifier (e.g. `Z42`) |
| `simulate_radar_outage` | `boolean` | Optional | Default `false`. If `true`, switches to satellite synthesis |

**Example Request:**
```bash
curl -s "http://127.0.0.1:8000/api/v1/rainfall?event_id=E001"
```

**Example Response (200 OK):**
```json
{
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
}
```

---

### 3. `GET /api/v1/inundation`
Retrieves 2D hydrodynamic flood depth band and occurrence probability.

**Query Parameters:**
| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| `event_id` | `string` | Optional | Event identifier (e.g. `E001`) |
| `zone_id` | `string` | Optional | Zone identifier (e.g. `Z42`) |
| `simulate_radar_outage` | `boolean` | Optional | Degrades confidence if outage active |

**Example Request:**
```bash
curl -s "http://127.0.0.1:8000/api/v1/inundation?event_id=E001"
```

**Example Response (200 OK):**
```json
{
  "event_id": "E001",
  "zone_id": "Z42",
  "flood_probability": 0.87,
  "depth_band": "0.5-1.0m",
  "risk_uri": "mock://inundation/E001",
  "confidence": 0.81,
  "valid_time": "2026-09-06T09:00:00Z",
  "source": "mock",
  "status": "PROTOTYPE"
}
```

---

### 4. `GET /api/v1/risk`
Returns spatial risk tiles combining rainfall intensity and flood probability for GIS cartography.

**Query Parameters:**
| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| `zone_id` | `string` | Optional | Filter tiles by target zone (e.g. `Z42`) |

**Example Request:**
```bash
curl -s "http://127.0.0.1:8000/api/v1/risk?zone_id=Z42"
```

**Example Response (200 OK):**
```json
[
  {
    "tile_id": "tile_1024",
    "zone_id": "Z42",
    "timestamp": "2026-09-06T09:00:00Z",
    "rainfall_mm_hr": 87.0,
    "flood_probability": 0.87,
    "depth_band": "0.5-1.0m",
    "confidence": 0.81,
    "latitude": 12.9815,
    "longitude": 80.218,
    "zone_name": "Velachery South"
  }
]
```

---

### 5. `GET /api/v1/events`
Returns high-level summary cards for all available historical replay scenarios.

**Example Request:**
```bash
curl -s http://127.0.0.1:8000/api/v1/events
```

**Example Response (200 OK):**
```json
[
  {"event_id": "E001", "zone_id": "Z42", "zone_name": "Velachery South", "priority": "CRITICAL"},
  {"event_id": "E002", "zone_id": "Z18", "zone_name": "Saidapet Adyar", "priority": "HIGH"},
  {"event_id": "E003", "zone_id": "Z29", "zone_name": "Madipakkam", "priority": "HIGH"},
  {"event_id": "E004", "zone_id": "Z05", "zone_name": "T. Nagar", "priority": "MEDIUM"},
  {"event_id": "E005", "zone_id": "Z33", "zone_name": "Sholinganallur", "priority": "MEDIUM"}
]
```

---

### 6. `GET /api/v1/event/{id}`
Retrieves the unified `DecisionObject` fusing precipitation, inundation, demographic impact, priority, recommended actions, time-series progression, and safe emergency evacuation routing.

**Path Parameters:**
- `id`: Event identifier (e.g. `E001`, `E002`, `E003`, `E004`, `E005`)

**Query Parameters:**
- `simulate_radar_outage`: `boolean` (default `false`)

**Example Request:**
```bash
curl -s "http://127.0.0.1:8000/api/v1/event/E001"
```

**Example Response (200 OK):**
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
  "actions": ["ALERT", "CLOSE_ROAD", "DEPLOY_TEAM"],
  "data_source": "PRECOMPUTED_REPLAY",
  "status": "PROTOTYPE",
  "timeline": [
    {
      "timestamp": "2026-09-06T07:00:00Z",
      "lead_minutes": 0,
      "rainfall_mm_hr": 25.0,
      "rainfall_accumulation_mm": 25.0,
      "flood_probability": 0.2,
      "depth_band": "<0.1m"
    },
    {
      "timestamp": "2026-09-06T09:00:00Z",
      "lead_minutes": 60,
      "rainfall_mm_hr": 87.0,
      "rainfall_accumulation_mm": 124.0,
      "flood_probability": 0.87,
      "depth_band": "0.5-1.0m"
    }
  ],
  "response_route": {
    "incident_id": "INC-01",
    "title": "100 Feet Road Inundation Choke Point",
    "lead_time": "T-45 min to impassable threshold",
    "risk_score": 0.88,
    "impassable_road": "Velachery Main Rd (near Lake View)",
    "safe_route": "Bypass via Inner Ring Rd to GST",
    "route_coordinates": [[12.982, 80.217], [12.986, 80.215], [12.991, 80.211]],
    "blocked_coordinates": [[12.979, 80.221], [12.981, 80.219]],
    "milestones": [
      {"time": "T-45 min", "label": "Early Warning broadcasted to Zone Z42 Ward 178"},
      {"time": "T-20 min", "label": "Velachery Main Rd water level reaches 0.3m threshold"},
      {"time": "T-0 min", "label": "Choke point impassable; automated traffic diversion active"}
    ]
  },
  "radar_outage": false,
  "fallback_mode": false,
  "fallback_source": null
}
```

---

## 6. Available Scenario Reference

| Event ID | Zone ID | Zone Name | Flood Type | Priority | Population | Rain Rate | Flood Prob |
|:---:|:---:|:---|:---|:---:|:---:|:---:|:---:|
| `E001` | `Z42` | Velachery South | Depression Bowl | **CRITICAL** | 21,400 | 87.0 mm/hr | 0.87 |
| `E002` | `Z18` | Saidapet Adyar | River Corridor Overflow | **HIGH** | 18,200 | 72.0 mm/hr | 0.76 |
| `E003` | `Z29` | Madipakkam | Lake Inundation Fringe | **HIGH** | 14,800 | 68.0 mm/hr | 0.71 |
| `E004` | `Z05` | T. Nagar | Commercial Basin Choke | **MEDIUM** | 32,100 | 48.0 mm/hr | 0.52 |
| `E005` | `Z33` | Sholinganallur | Lowland IT Corridor | **MEDIUM** | 27,500 | 42.0 mm/hr | 0.44 |

---

## 7. Replay & Sensor Degradation Fallback Engine

When radar outages occur or upstream feeds become unavailable, the system deterministically fails over:

```
                  Primary Doppler Radar (DWR)
                             │
                      (Radar Failure)
                             │
                             ▼
              Satellite Synthesis Fallback
             (imd_kalpana_satellite_fallback)
                             │
                             ▼
              Degraded Confidence Penalties
           (-0.28 Rainfall / -0.25 Inundation)
                             │
                             ▼
               Consistent Contract Output
```

Testing radar outage via API:
```bash
curl -s "http://127.0.0.1:8000/api/v1/event/E001?simulate_radar_outage=true"
```
The response sets `radar_outage: true`, `fallback_mode: true`, `fallback_source: "imd_kalpana_satellite_fallback"`, and reduces confidence scores deterministically.

---

## 8. Physical Validation Bounds (Pydantic v2)

All incoming and outgoing numeric telemetry strictly enforces physical boundary conditions:
- `rainfall_mm_hr`: `ge=0.0` (Precipitation cannot be negative)
- `rainfall_accumulation_mm`: `ge=0.0`
- `confidence`: `ge=0.0, le=1.0` (Unitless probability interval)
- `flood_probability`: `ge=0.0, le=1.0`
- `lead_minutes`: `ge=0`
- `population_exposed`: `ge=0`
- `critical_assets`: `ge=0`
- `roads_affected`: `ge=0`
- `depth_band`: Enum `<0.1m`, `0.1-0.3m`, `0.3-0.5m`, `0.5-1.0m`, `>1.0m`

---

## 9. Automated Testing & Verification

Run the full pytest suite:
```powershell
pytest -v
```

### Test Coverage:
- `test_contracts.py`: Validates all scenario payloads against Pydantic schemas and checks physical consistency (e.g. higher rainfall correlates with higher flood probability).
- `test_health.py`: Validates `/api/v1/health` diagnostics and provider modes.
- `test_rainfall.py`: Validates `/api/v1/rainfall` by `event_id`, `zone_id`, and 404 behavior.
- `test_inundation.py`: Validates `/api/v1/inundation` by `event_id`, `zone_id`, and 404 behavior.
- `test_risk.py`: Validates spatial risk tile filtering and geospatial centroids.
- `test_event.py`: Validates `DecisionObject` retrieval, structure, and 404 behavior.
- `test_integration_hardening.py`: Validates Section 36 & 61 hardening rules:
  - Mixed provider mode provenance (`MIXED` / `PROTOTYPE` tag guarantee)
  - Simulated radar outage backend awareness
  - Physical boundary rejection (`ValidationError` on invalid data)
  - Sanitized error responses (no stack trace leaks)
  - Frontend static architecture audit (zero hardcoded mock domain-data in frontend)

---

## 10. Performance Benchmarks

Actual empirical measurements are recorded in `results/latency.json`.

To run and refresh the automated benchmark:
```powershell
python scripts/benchmark_latency.py
```

### Current Empirical Benchmark (`results/latency.json`):
- **Load Time**: 4.5 ms
- **API Latency (p50)**: ~24.8 ms
- **API Latency (p95)**: ~31.3 ms
- **Peak Memory**: ~4.7 MB
- **Environment**: Windows 11 (AMD64) | 12 logical cores | 15.6 GB RAM
- **Sample Count**: 500 requests across all endpoints
- *Note*: These reflect gateway and contract serialization performance on deterministic replay data. ML model inference latency will be integrated once R&D-1 and R&D-2 export real model pipelines.
