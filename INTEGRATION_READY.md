# HydroSurge AI — Module 4 Integration Readiness Report
**Status:** READY 🟢  
**Target Basin:** Greater Chennai Corporation • Adyar Basin Emergency Management Grid  
**Component:** Systems / API Integration / Decision Dashboard (Module 4)  
**Date:** September 6, 2026  

---

## 1. Executive Summary

HydroSurge AI Module 4 delivers the unified, contract-enforcing API integration gateway and operations decision dashboard for the Chennai pilot catchment.

### What MOD_4 Provides:
1. **Unified FastAPI Gateway (`http://127.0.0.1:8000/api/v1`)**:
   - Single point of truth aggregating weather radar nowcasts, overland hydrodynamic flood predictions, demographic exposure, and incident response routing into a versioned REST contract.
   - Pydantic v2 schemas enforcing physical and numerical bounds on all fields.
   - Transparent data provenance tracking (`LIVE`, `MOCK`, `MIXED`) and pipeline maturity indicators (`VERIFIED`, `PROTOTYPE`, `CONCEPT`).
   - Graceful failover and Doppler radar outage simulation with confidence degradation penalties.
2. **Operations Command Center Dashboard (`http://127.0.0.1:3000`)**:
   - High-contrast, dark-mode incident decision dashboard built with React 19 and Next.js 16.
   - 100% API-driven: All scenario telemetries, GIS coordinates, timeline steps, what-if models, and CAP XML alerts are derived strictly from FastAPI.
   - Dedicated modes for **Hazard Nowcasting**, **Demographic Impact & What-If**, and **Response & Evacuation Routing**.

### Current Implementation Status:
- **MOD_4 Subsystem**: **100% Complete & Verified 🟢**
- **Automated Test Suite**: **27/27 Pytest tests passing (100%)**
- **Frontend Build**: **`next build` passes with zero compilation errors (Static optimization verified)**
- **Runtime Verification**: **Verified via automated Chrome DevTools Protocol (CDP) headless test harness**

### What Is Ready:
- All core API endpoints: `/health`, `/events`, `/event/{id}`, `/rainfall`, `/inundation`, `/risk`.
- Full mock/replay data layer for Chennai Adyar Basin (`demo/replay/scenario.json`).
- Dynamic provider injection architecture (`providers/base.py`, `mock.py`, `rainfall.py`, `inundation.py`, `live.py`).
- Doppler radar outage simulation endpoint parameter (`simulate_radar_outage=true`).
- Interactive dashboard UI with event switcher, timeline scrub bar, GIS map, what-if simulator, and CAP alert modal.

### What Is Dependent on R&D-1 / R&D-2 / R&D-3:
- **R&D-1 (Rainfall Team)**: Live inference pipeline from DGMR / ConvLSTM nowcasting model to replace the stub in `providers/rainfall.py`.
- **R&D-2 (Inundation Team)**: Live 2D hydrodynamic solver / raster processing pipeline to replace the stub in `providers/inundation.py`.
- **R&D-3 (Data & Schema Team)**: Production ingestion pipelines for real-time IMD Doppler radar and CMWSSB / GCC sensor streams.

---

## 2. MOD_4 System Architecture & Dataflow

```
              +-----------------------------------------+
              |           R&D-3 (Data/Schema)           |
              |       Geospatial & Ingestion Owner      |
              +-----------------------------------------+
                                   |
                   +---------------+---------------+
                   |                               |
                   v                               v
     +---------------------------+   +---------------------------+
     |       R&D-1 Engine        |   |       R&D-2 Engine        |
     |  Rainfall Nowcasting ML   |   |   Inundation Solver ML    |
     +---------------------------+   +---------------------------+
                   |                               |
    RainfallOutput |               InundationOutput|
                   +---------------+---------------+
                                   |
                                   v
     +-----------------------------------------------------------+
     |                 MOD_4 Integration Layer                   |
     |         Adapters  -->  Providers  -->  FastAPI            |
     |      (Deterministic Replay / Explicit Provenance)         |
     +-----------------------------------------------------------+
                                   |
                     GET /api/v1/* | Single Source of Truth
                                   v
     +-----------------------------------------------------------+
     |             HydroSurge Decision Dashboard                 |
     |                 (Next.js 16 / React 19)                   |
     |        [Hazard]      [Impact & What-If]      [Response]   |
     +-----------------------------------------------------------+
```

### ⚠️ STRICT ARCHITECTURAL INVARIANT:
> **THE DASHBOARD MUST NEVER DIRECTLY READ:**
> - Jupyter notebooks (`.ipynb`)
> - Raw CSV / tabular files
> - Machine learning model weights (`.pt`, `.h5`, `.onnx`)
> - GeoTIFF / NetCDF raster files (`.tif`, `.nc`)
> - NumPy serialized arrays (`.npy`, `.npz`)
> - Scenario replay JSON files from disk
> - Producer-specific filesystem artifacts
>
> **The dashboard communicates with MOD_4 exclusively through versioned HTTP API contracts.**

---

## 3. Team Merge Order

To ensure zero integration drift, all team modules must be integrated in the following sequence:

1. **R&D-3 (Data / Geospatial / Schemas)**:
   - Locks zone identifiers, geographic bounding boxes, EPSG:4326 coordinate conventions, and timestamp formats.
2. **R&D-1 (Precipitation Nowcasting)**:
   - Connects live precipitation inference to `providers/rainfall.py` conforming to `RainfallOutput`.
3. **R&D-2 (Overland Inundation & Hydrodynamic Risk)**:
   - Connects flood depth calculations to `providers/inundation.py` conforming to `InundationOutput`.
4. **MOD_4 (API & Decision Aggregation)**:
   - Aggregates R&D-1 and R&D-2 telemetry into the unified `DecisionObject` with verified provenance.
5. **Dashboard Validation**:
   - End-to-end visual and operational validation in the command center.

---

## 4. Quick Run Instructions

### Prerequisites
- Python 3.10+ (Python 3.13 verified)
- Node.js 18+ (Node.js 22 verified) with npm

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/HydroSurge-AI/SIH_26071_MODULE_4.git
cd SIH_26071_MODULE_4

# Set up Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd dashboard
npm install
cd ..
```

### Step 2: Launch Backend (Terminal 1)
```powershell
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Gateway Root: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/v1/health`

### Step 3: Launch Operations Dashboard (Terminal 2)
```powershell
cd dashboard
npm run dev
```
- Open browser at: `http://127.0.0.1:3000` (or `http://localhost:3000`)

### Step 4: Run Verification Tests
```powershell
# Run full Pytest contract and integration test suite
pytest -v

# Run production frontend compilation check
cd dashboard
npm run build
```
