# HydroSurge AI — Cross-Module Integration Contract Matrix

## Overview
This document specifies the authoritative contract boundaries between HydroSurge AI modules for SIH PS 26071.

```
       +---------------------------------------------+
       |               MOD_3 (Owner)                 |
       |     Geospatial / Schema / Data Provenance   |
       +---------------------------------------------+
                       |             |
        Normalized Met |             | Normalized Hydro
                       v             v
         +-----------------+     +-------------------+
         |  MOD_1 Engine   |     |   MOD_2 Engine    |
         |  Rainfall ML    |     |   Inundation ML   |
         +-----------------+     +-------------------+
                       |             |
        RainfallOutput |             | InundationOutput
                       v             v
         +-------------------------------------------+
         |            MOD_4 Integration Layer        |
         |  Adapters -> Providers -> FastAPI Engine  |
         +-------------------------------------------+
                             |
               GET /api/v1/* | Single Source of Truth
                             v
         +-------------------------------------------+
         |       Decision Support Dashboard          |
         |          (React / Next.js)                |
         +-------------------------------------------+
```

---

## 1. MOD_1 -> MOD_4 Contract: Rainfall Engine

### Integration Boundary
- **Target Class**: `providers.rainfall.RainfallModelProvider`
- **Output Contract**: `schemas.rainfall.RainfallOutput`

### Field Specification
| Field Name | Type | Constraint | Presence | Description |
| :--- | :--- | :--- | :--- | :--- |
| `event_id` | `str` | Non-empty | Required | Unique event identifier (e.g., `E001`) |
| `zone_id` | `str` | Non-empty | Required | GCC ward/basin zone identifier (e.g., `Z42`) |
| `valid_time` | `str` | ISO 8601 UTC | Required | Timestamp of forecast validity (e.g., `2026-09-06T09:00:00Z`) |
| `lead_minutes` | `int` | `>= 0` | Required | Forecast lead time horizon in minutes |
| `rainfall_mm_hr` | `float` | `>= 0.0` | Required | Instantaneous rainfall intensity (mm/hr) |
| `rainfall_accumulation_mm`| `float` | `>= 0.0` | Required | Total rainfall accumulation over window (mm) |
| `confidence` | `float` | `0.0 <= c <= 1.0` | Required | Model confidence score |
| `prediction_uri` | `str` | URI format | Required | Location of prediction raster / artifact |
| `source` | `str` | Enum | Required | Producer source: `rainfall_model`, `mock`, or `imd_kalpana_satellite_fallback` |
| `status` | `str` | Enum | Required | `VERIFIED`, `PROTOTYPE`, `ARCHITECTURE`, or `CONCEPT` |

### Fallback Behavior
If MOD_1 is unavailable or encounters an unhandled exception, MOD_4 automatically falls back to deterministic precomputed replay (`MockForecastProvider`), tagging `source = "mock"` and `status = "PROTOTYPE"`.

---

## 2. MOD_2 -> MOD_4 Contract: Inundation Engine

### Integration Boundary
- **Target Class**: `providers.inundation.InundationModelProvider`
- **Output Contract**: `schemas.inundation.InundationOutput`

### Field Specification
| Field Name | Type | Constraint | Presence | Description |
| :--- | :--- | :--- | :--- | :--- |
| `event_id` | `str` | Non-empty | Required | Unique event identifier (e.g., `E001`) |
| `zone_id` | `str` | Non-empty | Required | GCC ward/basin zone identifier (e.g., `Z42`) |
| `flood_probability` | `float` | `0.0 <= p <= 1.0` | Required | Hydrodynamic inundation probability |
| `depth_band` | `str` | Band string | Required | Inundation depth band: `<0.1m`, `0.1-0.3m`, `0.3-0.5m`, `0.5-1.0m` |
| `risk_uri` | `str` | URI format | Required | Location of 2D overland depth raster asset |
| `confidence` | `float` | `0.0 <= c <= 1.0` | Required | Inundation model confidence score |
| `valid_time` | `str` | ISO 8601 UTC | Required | Validity timestamp aligned to rainfall valid_time |
| `source` | `str` | Enum | Required | Producer source: `inundation_model` or `mock` |
| `status` | `str` | Enum | Required | `VERIFIED`, `PROTOTYPE`, `ARCHITECTURE`, or `CONCEPT` |

### Fallback Behavior
If MOD_2 model inference fails or times out, MOD_4 logs the provider failure and serves precomputed hydrodynamic baseline replay data without breaking the downstream API contract.

---

## 3. MOD_3 -> MOD_4 Contract: Geospatial, Schema & Provenance Owner

MOD_3 is the authoritative owner of data normalization, coordinate reference systems (CRS), DEM topography, and sensor provenance.

### Normalization Requirements
1. **Coordinate Reference System**: EPSG:4326 (WGS84) for all lat/long pairs and spatial centroids.
2. **Temporal Alignment**: All valid times must be synchronized ISO 8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`).
3. **Zone Identification**: Standard GCC municipal ward IDs (`Z42` Velachery South, `Z18` Saidapet Adyar, `Z07` T. Nagar Core, `Z29` Tambaram Basin, `Z12` Marina Coastal).
4. **Spatial Attributes Exposed via MOD_4**:
   - `location.latitude` (WGS84 decimal degrees)
   - `location.longitude` (WGS84 decimal degrees)
   - `location.zone_name` (Descriptive municipal name)
   - `location.flood_area_type` (e.g., `Depression Bowl`, `River Floodplain`)

---

## 4. MOD_4 -> Dashboard Contract: FastAPI Single Source of Truth

The Next.js dashboard consumes domain data **exclusively** from the FastAPI API gateway (`/api/v1/*`).

### Endpoints
1. `GET /api/v1/health`
   - Returns provider connectivity, mode (`mock`, `live`, `rainfall_live`, `inundation_live`), and timestamps.
2. `GET /api/v1/events` (and `GET /api/v1/event`)
   - Returns array of event summaries: `[{ event_id, zone_id, zone_name, priority }]`.
3. `GET /api/v1/event/{id}`
   - Query Parameters: `simulate_radar_outage=false` (default) or `true`
   - Returns complete `DecisionObject` containing joined rainfall, inundation, impact, actions, timeline progression, and response routing.
4. `GET /api/v1/rainfall?event_id={id}&zone_id={zone}`
5. `GET /api/v1/inundation?event_id={id}&zone_id={zone}`
6. `GET /api/v1/risk?zone_id={zone}`
   - Returns risk tiles with coordinates and zone names for GIS mapping.

### Provenance State Machine
| Rainfall Provider | Inundation Provider | Resulting `data_source` | Resulting `status` |
| :--- | :--- | :--- | :--- |
| Mock / Replay | Mock / Replay | `PRECOMPUTED_REPLAY` | `PROTOTYPE` 🟡 |
| Live ML Model | Mock / Replay | `MIXED` | `PROTOTYPE` 🟡 |
| Mock / Replay | Live ML Model | `MIXED` | `PROTOTYPE` 🟡 |
| Live ML Model | Live ML Model | `LIVE` | `VERIFIED` 🟢 |

**Invariant**: `status = VERIFIED` is strictly prohibited unless both production engines successfully produce live validated outputs.
