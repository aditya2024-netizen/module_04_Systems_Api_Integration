# HydroSurge AI — Module 4 FastAPI Gateway Backend

The HydroSurge Module 4 API Gateway is the central architectural bridge connecting quantitative rainfall forecasting, 2D hydrodynamic inundation modeling, spatial GIS metadata, and emergency decision support dashboards.

---

## 1. Directory Structure

```
api/
├── main.py              # FastAPI application entrypoint, CORS configuration, route inclusion
├── dependencies.py      # Dependency injection: provider resolver and scenario cache
└── routes/
    ├── health.py        # /api/v1/health subsystem diagnostics
    ├── event.py         # /api/v1/events and /api/v1/event/{id}
    ├── rainfall.py      # /api/v1/rainfall nowcasting query
    ├── inundation.py    # /api/v1/inundation flood depth query
    └── risk.py          # /api/v1/risk spatial grid query

schemas/
├── __init__.py          # Exported Pydantic v2 schemas
├── rainfall.py          # RainfallOutput contract
├── inundation.py        # InundationOutput contract
├── risk.py              # RiskTile spatial schema
└── decision.py          # DecisionObject, Location, ResponseRoute, EventSummary

providers/
├── base.py              # BaseProvider abstract interface
├── mock.py              # Deterministic replay provider (scenario.json)
├── rainfall.py          # R&D-1 Rainfall ML engine adapter stub
├── inundation.py        # R&D-2 Inundation hydrodynamic solver stub
└── live.py              # Combined live inference provider
```

---

## 2. Pydantic v2 Validation Bounds

All numeric telemetry fields enforce physical bounds using Pydantic v2 `Field` constraints:
- `rainfall_mm_hr`: `ge=0.0` (Precipitation rate cannot be negative)
- `rainfall_accumulation_mm`: `ge=0.0`
- `confidence`: `ge=0.0, le=1.0` (Unitless confidence interval)
- `flood_probability`: `ge=0.0, le=1.0`
- `latitude`: `ge=-90.0, le=90.0`
- `longitude`: `ge=-180.0, le=180.0`
- `population_exposed`: `ge=0`
- `depth_band`: Enum: `<0.1m`, `0.1-0.3m`, `0.3-0.5m`, `0.5-1.0m`, `>1.0m`

---

## 3. Running the Backend

### Local Development:
```powershell
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Production:
```powershell
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Automated Pytest Suite:
```powershell
pytest -v
```
All 27 contract, routing, failover, and architecture tests will execute and validate against the running contracts.
