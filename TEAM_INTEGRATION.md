# HydroSurge AI — Team Handoff & Integration Guide

> **CORE PRINCIPLE**: **DO NOT MODIFY THE DASHBOARD TO CONNECT YOUR MODEL.**
> The frontend is an API-driven visualization layer. All model outputs, datasets, and geospatial grids plug directly into the backend provider layer.

---

## 1. Quick Start Commands

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Terminal 1: Start FastAPI Backend Gateway
```bash
# From repository root
pip install -r requirements.txt
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Gateway: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/v1/health`

### Terminal 2: Start Next.js Decision Dashboard
```bash
cd dashboard
npm ci
npm run dev -- -p 3000
```
- Decision Command Center: `http://127.0.0.1:3000`

---

## 2. Module Handoff Instructions

### For MOD_1 Engineers (Rainfall Nowcasting / R&D-1)
1. **Target File**: `providers/rainfall.py`
2. **Implementation**: Replace the `NotImplementedError` stubs in `RainfallModelProvider` with your inference pipeline (DGMR / ConvLSTM / radar nowcasting).
3. **Contract**: Ensure your method returns a dictionary adhering strictly to `schemas.rainfall.RainfallOutput`:
   - `rainfall_mm_hr: float` (>= 0)
   - `rainfall_accumulation_mm: float` (>= 0)
   - `confidence: float` (0.0 to 1.0)
   - `prediction_uri: str`
   - `valid_time: str` (ISO 8601 UTC)
4. **Activation**: Set `PROVIDER_MODE=rainfall_live` or `PROVIDER_MODE=live` in your `.env`.
5. **Fail-Safe**: If your model throws an exception or runs out of VRAM, MOD_4 will automatically catch it and fall back gracefully to the precomputed replay baseline without crashing the API or UI.

---

### For MOD_2 Engineers (Inundation & Flood Risk / R&D-2)
1. **Target File**: `providers/inundation.py`
2. **Implementation**: Replace the `NotImplementedError` stubs in `InundationModelProvider` with your hydraulic 2D overland solver or ML depth surrogate model.
3. **Contract**: Ensure your method returns a dictionary adhering strictly to `schemas.inundation.InundationOutput`:
   - `flood_probability: float` (0.0 to 1.0)
   - `depth_band: str` (`<0.1m`, `0.1-0.3m`, `0.3-0.5m`, `0.5-1.0m`)
   - `confidence: float` (0.0 to 1.0)
   - `risk_uri: str`
   - `valid_time: str` (ISO 8601 UTC)
4. **Activation**: Set `PROVIDER_MODE=inundation_live` or `PROVIDER_MODE=live` in your `.env`.

---

### For MOD_3 Engineers (Data, Geospatial & Quality / R&D-3)
1. **Schema & Coordinates**: All spatial centroids and coordinates must adhere to **EPSG:4326 (WGS84)**.
2. **Zone Codes**: Use GCC standard ward identifiers (`Z42`, `Z18`, `Z07`, `Z29`, `Z12`).
3. **Replay Scenario**: To update or expand the historical scenario dataset, edit `demo/replay/scenario.json`. The mock provider will immediately serve your updated baseline through the API.
4. **Data Normalization**: Any raw radar formats (UF, NetCDF, HDF5) or DEM geotiffs must be adapted in Python before reaching the API schemas.

---

## 3. Verification Commands
Before submitting your changes, run the automated verification suite:

```bash
# 1. Backend Contract & Integration Tests
pytest -v

# 2. Frontend Production Build Check
cd dashboard
npm run build
```

Both checks must pass 100% green before merging into `main`.
