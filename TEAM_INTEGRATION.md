# HydroSurge AI — Team Integration & Developer Handoff Guide

> **CORE ARCHITECTURAL INVARIANT**:  
> **DO NOT MODIFY THE DASHBOARD TO CONNECT YOUR MODEL.**  
> The HydroSurge frontend is strictly an API-driven visualization and decision support client. All model inferences, telemetry datasets, and geospatial grids must plug into the **Backend Provider Layer**. The dashboard communicates exclusively through FastAPI contracts.

---

## 1. Responsibility Matrix — Who Connects What

| Module | Owner Responsibility | What They Provide to Integration | What MOD_4 Consumes & Exposes |
| :--- | :--- | :--- | :--- |
| **R&D-3** | Data Ingestion, Geospatial Schemas, Spatial Grids | Normalized schemas, zone metadata, EPSG:4326 CRS, ward polygons, telemetry timestamps | Consumed by adapters to validate zone bounds and coordinate alignments |
| **R&D-1** | Precipitation Nowcasting (DGMR / ConvLSTM) | Quantitative precipitation forecast (mm/hr, accumulation mm), model confidence [0-1], forecast lead time (min) | Consumed by `RainfallProvider` (`/api/v1/rainfall`) and aggregated into `DecisionObject` |
| **R&D-2** | Hydrodynamic Inundation & Overland Flood Modeling | Flood probability [0-1], depth band classification, risk map URI, overland flow vectors | Consumed by `InundationProvider` (`/api/v1/inundation`) and aggregated into `DecisionObject` |
| **MOD_4** | Systems Integration, API Gateway, Decision Logic | Versioned FastAPI REST endpoints, Pydantic v2 schemas, provenance tracking (`LIVE`/`MOCK`/`MIXED`), failover outage logic | Serves unified contracts (`/api/v1/*`) to Dashboard & downstream systems |
| **Dashboard** | Incident Decision Support UI (Next.js / React 19) | Command center presentation, timeline scrub bar, GIS Leaflet map, What-If simulator, CAP XML drawer | Consumes JSON API responses only via `dashboard/app/lib/api.js` |

---

## 2. Merge Order & Dependency Rationale

All team contributions must be merged into the unified integration branch in this strict sequence:

```
R&D-3 (Data & Spatial Schemas)
  │
  ▼
R&D-1 (Precipitation Nowcast Model)
  │
  ▼
R&D-2 (Hydrodynamic Inundation Model)
  │
  ▼
MOD_4 (API Gateway & Decision Aggregation)
  │
  ▼
Dashboard (Visual & Operational Validation)
```

### Why This Sequence Exists:
1. **R&D-3 First**: Establishes immutable zone identifiers (`Z42`, `Z18`, `Z07`, `Z29`, `Z12`), spatial coordinates (WGS84 EPSG:4326), and ISO 8601 UTC timestamp conventions that both models rely upon.
2. **R&D-1 Second**: Hydrodynamic flood modeling in R&D-2 is physically driven by precipitation depth and accumulation rates produced by R&D-1.
3. **R&D-2 Third**: Provides overland water levels and flood probabilities conditioned on R&D-1 rainfall predictions.
4. **MOD_4 Fourth**: Ingests both model outputs via adapters, computes multi-hazard risk prioritization (`priority`, `actions`, `response_route`), and sets authoritative provenance.
5. **Dashboard Fifth**: Visualizes the aggregated decision state with zero client-side calculation.

---

## 3. Integration Checkpoints & Verification Gates

After each module merges, the following verification gates must pass:

### Checkpoint 1: Post R&D-3 (Data & Schemas)
- **What must be checked**: Zone definitions in `schemas/decision.py` and `schemas/risk.py`.
- **Endpoints to test**: `GET /api/v1/risk`
- **Success criteria**: Returns 5 Chennai zones (`Z42`, `Z18`, `Z07`, `Z29`, `Z12`) with valid latitude/longitude numbers.
- **DO NOT CHANGE**: Contract field names (`zone_id`, `latitude`, `longitude`, `flood_probability`).

### Checkpoint 2: Post R&D-1 (Rainfall Nowcasting)
- **What must be checked**: `providers/rainfall.py` live inference.
- **Endpoints to test**: `GET /api/v1/rainfall?event_id=E001`
- **Success criteria**: HTTP 200 OK, `rainfall_mm_hr >= 0.0`, `0.0 <= confidence <= 1.0`, valid ISO 8601 `valid_time`.
- **DO NOT CHANGE**: Output schema model (`RainfallOutput`).

### Checkpoint 3: Post R&D-2 (Inundation Modeling)
- **What must be checked**: `providers/inundation.py` flood depth extraction.
- **Endpoints to test**: `GET /api/v1/inundation?event_id=E001`
- **Success criteria**: HTTP 200 OK, `0.0 <= flood_probability <= 1.0`, valid `depth_band` from enum (`<0.1m`, `0.1-0.3m`, `0.3-0.5m`, `0.5-1.0m`, `>1.0m`).
- **DO NOT CHANGE**: Output schema model (`InundationOutput`). The dashboard must never read GeoTIFF rasters directly.

### Checkpoint 4: Full System Validation (MOD_4 Gateway)
- **What must be checked**: `GET /api/v1/health` and `GET /api/v1/event/E001`.
- **Success criteria**: Health returns `"status": "healthy"`. Event returns unified `DecisionObject` with consistent provenance (`LIVE`, `MOCK`, or `MIXED`).
- **Test command**: `pytest -v` (All 27 tests must pass).

---

## 4. R&D-1 Rainfall Nowcasting Integration Guide

### Provider Interface & File Path
- **Target File**: `providers/rainfall.py`
- **Class**: `RainfallProvider(BaseProvider)`
- **Current Status**: *Architecture exists; actual R&D-1 implementation must replace the stub method in this provider.*

### Method Signature to Implement:
```python
async def get_rainfall(
    self, 
    event_id: Optional[str] = None, 
    zone_id: Optional[str] = None,
    simulate_radar_outage: bool = False
) -> RainfallOutput:
    """
    Invokes live DGMR / ConvLSTM nowcasting inference or loads live precipitation grid.
    """
```

### Input Parameters:
- `event_id` (str, optional): Scenario identifier (e.g., `"E001"`).
- `zone_id` (str, optional): Target catchment zone (e.g., `"Z42"`).
- `simulate_radar_outage` (bool, default `False`): If `True`, simulate Doppler radar signal loss, fall back to synoptic interpolation, and apply confidence penalty.

### Output Contract (`schemas/rainfall.py` -> `RainfallOutput`):
| Field | Type | Unit / Format | Constraint | Description |
| :--- | :--- | :--- | :--- | :--- |
| `event_id` | `str` | String (e.g., `"E001"`) | Required | Unique event identifier |
| `zone_id` | `str` | String (e.g., `"Z42"`) | Required | Basin zone code |
| `valid_time` | `datetime` | ISO 8601 UTC (e.g., `2026-09-06T09:00:00Z`) | Required | Forecast validity time |
| `lead_minutes` | `int` | Minutes | `ge=0` | Horizon from radar scan time (e.g., 60) |
| `rainfall_mm_hr` | `float` | mm/hour | `ge=0.0` | Instantaneous rainfall rate |
| `rainfall_accumulation_mm` | `float` | mm | `ge=0.0` | Total accumulation over storm duration |
| `confidence` | `float` | Unitless score | `0.0 <= c <= 1.0` | Model confidence metric |
| `prediction_uri` | `str` | URI | Required | URI to forecast raster or tensor artifact |
| `source` | `str` | String | `"live"` or `"mock"` | Operational source descriptor |
| `status` | `str` | Enum | `"VERIFIED"`, `"PROTOTYPE"`, `"CONCEPT"` | Quality status |

### Sample Valid JSON Output:
```json
{
  "event_id": "E001",
  "zone_id": "Z42",
  "valid_time": "2026-09-06T09:00:00Z",
  "lead_minutes": 60,
  "rainfall_mm_hr": 87.0,
  "rainfall_accumulation_mm": 124.0,
  "confidence": 0.84,
  "prediction_uri": "s3://hydro-bucket/rainfall/E001_pred.npy",
  "source": "live",
  "status": "VERIFIED"
}
```

---

## 5. R&D-2 Hydrodynamic Inundation Integration Guide

### Provider Interface & File Path
- **Target File**: `providers/inundation.py`
- **Class**: `InundationProvider(BaseProvider)`
- **Current Status**: *Architecture exists; actual R&D-2 implementation must replace the stub method in this provider.*

### Method Signature to Implement:
```python
async def get_inundation(
    self, 
    event_id: Optional[str] = None, 
    zone_id: Optional[str] = None,
    simulate_radar_outage: bool = False
) -> InundationOutput:
    """
    Invokes 2D overland shallow-water solver or samples flood depth raster.
    """
```

### Raster / GeoTIFF Handling Rule:
> **THE DASHBOARD MUST NEVER DIRECTLY READ `risk_map.tif` OR MODEL RASTERS.**  
> The R&D-2 adapter is responsible for reading `risk_map.tif`, performing zonal statistics across the ward polygon, and returning the scalar `depth_band` and `flood_probability`. The GeoTIFF file URI is passed in `risk_uri` for archival/WMS purposes only.

### Output Contract (`schemas/inundation.py` -> `InundationOutput`):
| Field | Type | Unit / Format | Constraint | Description |
| :--- | :--- | :--- | :--- | :--- |
| `event_id` | `str` | String (e.g., `"E001"`) | Required | Unique event identifier |
| `zone_id` | `str` | String (e.g., `"Z42"`) | Required | Basin zone code |
| `flood_probability` | `float` | Probability | `0.0 <= p <= 1.0` | Projected probability of waterlogging |
| `depth_band` | `str` | Categorical Band | `<0.1m`, `0.1-0.3m`, `0.3-0.5m`, `0.5-1.0m`, `>1.0m` | Peak surface water depth band |
| `confidence` | `float` | Unitless score | `0.0 <= c <= 1.0` | Hydraulic solver confidence |
| `valid_time` | `datetime` | ISO 8601 UTC | Required | Forecast validity time |
| `risk_uri` | `str` | URI | Required | Reference URI to GeoTIFF/HDF5 raster |
| `source` | `str` | String | `"live"` or `"mock"` | Operational source descriptor |
| `status` | `str` | Enum | `"VERIFIED"`, `"PROTOTYPE"`, `"CONCEPT"` | Quality status |

### Sample Valid JSON Output:
```json
{
  "event_id": "E001",
  "zone_id": "Z42",
  "flood_probability": 0.87,
  "depth_band": "0.5-1.0m",
  "confidence": 0.81,
  "valid_time": "2026-09-06T09:00:00Z",
  "risk_uri": "s3://hydro-bucket/inundation/E001_depth.tif",
  "source": "live",
  "status": "VERIFIED"
}
```

---

## 6. R&D-3 Data & Geospatial Integration Guide

### Ownership Boundary:
- **What R&D-3 Owns**: Zone boundaries, GeoJSON ward boundaries, DEM spatial grid resolutions (5m), EPSG:4326 reprojections, census exposure base tables.
- **What MOD_4 Owns**: REST endpoint serving, Pydantic schema validation, cross-module caching, decision object aggregation, response routing serialization.

### Contract Fields Classification:
| Field | Classification | Notes |
| :--- | :--- | :--- |
| `zone_id` | **LOCKED CONTRACT FIELD** | `Z42`, `Z18`, `Z07`, `Z29`, `Z12` |
| `latitude`, `longitude` | **LOCKED CONTRACT FIELD** | Decimal degrees in WGS84 EPSG:4326 |
| `valid_time` / `timestamp` | **LOCKED CONTRACT FIELD** | ISO 8601 UTC string (`YYYY-MM-DDTHH:MM:SSZ`) |
| `depth_band` | **LOCKED CONTRACT FIELD** | Enum: `<0.1m`, `0.1-0.3m`, `0.3-0.5m`, `0.5-1.0m`, `>1.0m` |
| `flood_probability` | **LOCKED CONTRACT FIELD** | Float bounded to `[0.0, 1.0]` |
| `population_exposed` | **LOCKED CONTRACT FIELD** | Integer census count |
| `response_route` | **PROTOTYPE** | Simulated evacuation corridors for Chennai pilot |
| `what_if_multiplier` | **OPTIONAL** | Client-side sensitivity parameters |

---

## 7. Provider Architecture & Plugin Guide

The provider architecture decouples model execution from the HTTP routing layer:

```
[FastAPI Route]
       │
       ▼
[Dependency: get_provider()] ── reads PROVIDER_MODE (.env)
       │
       ├── PROVIDER_MODE=mock            --> MockProvider (demo/replay/scenario.json)
       ├── PROVIDER_MODE=rainfall_live   --> Hybrid: RainfallProvider (live) + Mock (inundation)
       ├── PROVIDER_MODE=inundation_live --> Hybrid: Mock (rainfall) + InundationProvider (live)
       └── PROVIDER_MODE=live            --> LiveProvider (all live engines)
```

### Provenance Determination Rules:
- If **both** Rainfall and Inundation providers return `source="live"`: `data_source = "LIVE"`, `status = "VERIFIED"`.
- If **one** provider is `"live"` and one is `"mock"`: `data_source = "MIXED"`, `status = "PROTOTYPE"`.
- If **both** providers return `source="mock"`: `data_source = "PRECOMPUTED_REPLAY"`, `status = "PROTOTYPE"`.

### How to Plug in Live Model Output:
1. Open `providers/rainfall.py` (for R&D-1) or `providers/inundation.py` (for R&D-2).
2. Replace the placeholder logic in `get_rainfall()` or `get_inundation()` with your model call.
3. Ensure the return value is wrapped in `RainfallOutput(...)` or `InundationOutput(...)`.
4. Set `PROVIDER_MODE=live` (or `rainfall_live` / `inundation_live`) in your `.env` file.
5. **Do NOT touch any dashboard code.** The dashboard will immediately display your live telemetry.

---

## 8. Environment Configuration Matrix

All configuration is managed via environment variables (loaded via `.env`):

| Variable | Purpose | Example | Required? | Default |
| :--- | :--- | :--- | :--- | :--- |
| `PROVIDER_MODE` | Active provider subsystem mode | `mock`, `rainfall_live`, `inundation_live`, `live` | Yes | `mock` |
| `API_PORT` | FastAPI server listening port | `8000` | No | `8000` |
| `CORS_ORIGINS` | Permitted browser origins for API | `http://localhost:3000,http://127.0.0.1:3000` | No | `http://localhost:3000,http://127.0.0.1:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | Public endpoint consumed by Next.js frontend | `http://127.0.0.1:8000/api/v1` | Yes | `http://127.0.0.1:8000/api/v1` |
| `RAINFALL_MODEL_PATH` | Path to R&D-1 model weights (future) | `./models/dgmr_chennai.pt` | Optional | None |
| `INUNDATION_MODEL_PATH`| Path to R&D-2 mesh/raster (future) | `./models/flood_dem_risk.tif` | Optional | None |

---

## 9. Quick Start — Copy/Paste Run Instructions

```bash
# 1. Clone the repository
git clone https://github.com/HydroSurge-AI/SIH_26071_MODULE_4.git
cd SIH_26071_MODULE_4

# 2. Set up Python environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
pip install -r requirements.txt

# 3. Set up Frontend environment
cd dashboard
npm install
cd ..

# 4. Configure environment
cp .env.example .env
cp dashboard/.env.example dashboard/.env.local

# 5. Launch Backend (Terminal 1)
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# 6. Launch Dashboard (Terminal 2)
cd dashboard
npm run dev

# 7. Verification Tests (Terminal 3)
pytest -v
cd dashboard && npm run build
```
