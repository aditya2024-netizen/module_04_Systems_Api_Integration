# HydroSurge AI — Module 4: Systems & API Integration Layer
**SIH Problem Statement 26071**  
*Unified contract-driven service connecting Rainfall Forecast, Flood Inundation, Spatial Risk, and Emergency Decision Engines.*

---

## 1. Current Status

In strict accordance with SRS-04 and the Team War-Room Canvas rules, every capability carries an honest verification status:

| Component | Status | Verification Detail |
|---|---|---|
| **Contract Schemas (`schemas/*.py`)** | `VERIFIED 🟢` | Pydantic v2 schemas validated against replay dataset via automated test suite. |
| **Replay & Scenario Engine (`demo/replay/scenario.json`)** | `VERIFIED 🟢` | 5 deterministic events with physically consistent rain/depth/impact/timeline data. |
| **FastAPI Service (`api/main.py` + routes)** | `VERIFIED 🟢` | All 5 routes passing pytest with zero warnings / errors. |
| **Provider Abstraction (`providers/base.py`, `mock.py`)** | `VERIFIED 🟢` | Abstract interfaces implemented; mock provider fully functional. |
| **Latency Benchmark (`results/latency.json`)** | `VERIFIED 🟢` | 100-sample warmup benchmark on local hardware (p50: 6.96ms, p95: 9.18ms). |
| **Rainfall Model Integration (`providers/rainfall.py`)** | `ARCHITECTURE 🔵` | Explicit swap point stubbed with `NotImplementedError`, awaiting R&D-1 `model.pt`. |
| **Inundation Model Integration (`providers/inundation.py`)** | `ARCHITECTURE 🔵` | Explicit swap point stubbed with `NotImplementedError`, awaiting R&D-2 `risk_map.tif`. |
| **Live External Ingestion (IMD/MOSDAC API)** | `CONCEPT ⚪` | External real-time polling pipeline pending R&D-3 credentials and adapters. |

---

## 2. One-Command Quick Start

### Backend Service (FastAPI)
```bash
pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Running Automated Test Suite
```bash
pytest -v
```

---

## 3. API Endpoints Contract

The API exposes 5 contract-compliant endpoints under `/api/v1`:

### 1. `GET /api/v1/health`
Checks service health, reports active provider mode, and last successful fetch timestamp.

**Sample Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

**Sample Response (200 OK):**
```json
{
  "status": "healthy",
  "provider_mode": "mock",
  "providers": {
    "mock": {
      "status": "active",
      "last_successful_fetch": "2026-09-06T06:15:57.487586+00:00"
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
  "timestamp": "2026-09-06T06:15:57.668982+00:00"
}
```

---

### 2. `GET /api/v1/rainfall`
Fetches nowcast rainfall forecast by `event_id` or `zone_id`.

**Sample Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/rainfall?event_id=E001"
```

**Sample Response (200 OK):**
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
Fetches flood probability and depth band by `event_id` or `zone_id`.

**Sample Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/inundation?event_id=E001"
```

**Sample Response (200 OK):**
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
Returns spatial risk tiles combining rainfall and inundation probability for mapping.

**Sample Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/risk?zone_id=Z42"
```

**Sample Response (200 OK):**
```json
[
  {
    "tile_id": "tile_1024",
    "zone_id": "Z42",
    "timestamp": "2026-09-06T09:00:00Z",
    "rainfall_mm_hr": 87.0,
    "flood_probability": 0.87,
    "depth_band": "0.5-1.0m",
    "confidence": 0.81
  }
]
```

---

### 5. `GET /api/v1/event/{id}`
Returns joined DecisionObject combining rainfall, flood inundation, exposed population, critical assets, priority level, and response actions.

**Sample Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/event/E001"
```

**Sample Response (200 OK):**
```json
{
  "event_id": "E001",
  "location": {
    "zone_id": "Z42"
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
  "status": "PROTOTYPE"
}
```

---

## 4. How to Swap in a Real Provider Later

Per SRS-04 Section 2, provider selection is controlled completely by the `PROVIDER_MODE` environment variable. Nobody needs to edit code or rebuild the API to switch providers:

```bash
# Set provider mode in .env or shell:
export PROVIDER_MODE=rainfall_live   # Tries R&D-1 model, falls back to replay
export PROVIDER_MODE=inundation_live # Tries R&D-2 model, falls back to replay
export PROVIDER_MODE=live            # Tries both live models
export PROVIDER_MODE=mock            # Default deterministic replay
```

### Fallback Guarantee
If `PROVIDER_MODE` is set to a live provider and the provider throws an exception (or has not yet been implemented), the system:
1. Logs the failure with warning diagnostics.
2. Automatically falls back to deterministic replay data from `demo/replay/scenario.json`.
3. Sets `"data_source": "PRECOMPUTED_REPLAY"` in the response object.
4. Preserves the exact same schema so downstream consumers (dashboard, alerting systems) never break or crash.

---

## 5. Measured Service Latency

Benchmarks measured and recorded in `results/latency.json` (100 samples):
- **API Latency (p50):** `6.96 ms`
- **API Latency (p95):** `9.18 ms`
- **Mock Inference Latency:** `0.005 ms`
- **Memory Footprint:** `~51 MB RSS`
- **Note:** Hardware benchmarks measure the FastAPI service runtime, not GPU model execution.