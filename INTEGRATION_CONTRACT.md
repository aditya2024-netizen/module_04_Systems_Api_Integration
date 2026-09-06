# HydroSurge AI — Complete API Integration Contract
**Version:** 1.0.0 (SIH PS 26071)  
**Status:** VERIFIED 🟢  
**Base URL:** `http://127.0.0.1:8000/api/v1`  
**Content-Type:** `application/json; charset=utf-8`  

---

## 1. Overview & Provenance Model

The HydroSurge API Integration Layer enforces strict data contracts between machine learning engines, hydraulic models, and the decision dashboard.

### Data Provenance Matrix:
| `data_source` | `status` | Description / Trigger Condition |
| :--- | :--- | :--- |
| `LIVE` | `VERIFIED` | Both R&D-1 (Rainfall) and R&D-2 (Inundation) models are genuine live inference pipelines and certified. |
| `MIXED` | `PROTOTYPE` | One model is live (e.g. Rainfall live) while another is mock/fallback, or one model is degraded. |
| `PRECOMPUTED_REPLAY` | `PROTOTYPE` | Baseline scenario replay mode reading from calibrated Chennai catchment historical cases (`demo/replay/scenario.json`). |
| `CONCEPT` | `CONCEPT` | Architectural mock or placeholder endpoint. |

---

## 2. Public API Endpoints

### 2.1 Subsystem Health Check: `GET /api/v1/health`
- **Method**: `GET`
- **Path**: `/api/v1/health`
- **Parameters**: None
- **Response Code**: `200 OK`
- **Fields**:
  - `status` (`str`): System operational health (`"healthy"`).
  - `provider_mode` (`str`): Active provider (`"mock"`, `"live"`, `"rainfall_live"`, `"inundation_live"`).
  - `providers` (`dict`): Status breakdown of each model provider.
  - `timestamp` (`str`): Current UTC timestamp in ISO 8601 format.

#### Actual Live JSON Response:
```json
{
  "status": "healthy",
  "provider_mode": "mock",
  "providers": {
    "mock": {
      "status": "active",
      "last_successful_fetch": "2026-09-06T09:30:36.547494+00:00"
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
  "timestamp": "2026-09-06T09:38:53.063588+00:00"
}
```

---

### 2.2 Event Summaries Catalog: `GET /api/v1/events`
- **Method**: `GET`
- **Path**: `/api/v1/events`
- **Parameters**: None
- **Response Code**: `200 OK`
- **Response Schema**: `List[EventSummary]`
- **Fields**:
  - `event_id` (`str`): Unique incident identifier (`"E001"`, `"E002"`, etc.).
  - `zone_id` (`str`): Ward / basin zone code (`"Z42"`, `"Z18"`, etc.).
  - `zone_name` (`str`): Chennai neighborhood name (`"Velachery South"`, `"Saidapet Adyar"`).
  - `priority` (`str`): Emergency level (`"CRITICAL"`, `"HIGH"`, `"MEDIUM"`, `"LOW"`).

#### Actual Live JSON Response:
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
  },
  {
    "event_id": "E003",
    "zone_id": "Z07",
    "zone_name": "T. Nagar Core",
    "priority": "HIGH"
  },
  {
    "event_id": "E004",
    "zone_id": "Z29",
    "zone_name": "Tambaram Basin",
    "priority": "MEDIUM"
  },
  {
    "event_id": "E005",
    "zone_id": "Z12",
    "zone_name": "Marina Coastal",
    "priority": "LOW"
  }
]
```

---

### 2.3 Authoritative Incident Decision: `GET /api/v1/event/{id}`
- **Method**: `GET`
- **Path**: `/api/v1/event/{id}`
- **Path Parameter**: `id` (`str`, required, e.g., `E001`)
- **Query Parameter**: `simulate_radar_outage` (`bool`, optional, default `false`)
- **Response Code**: `200 OK` (or `404 Not Found`)
- **Response Schema**: `DecisionObject`
- **Fields**:
  - `event_id` (`str`): Incident identifier.
  - `location` (`Location`): Centroid coordinates, terrain, and zone name.
    - `zone_id` (`str`), `city` (`str`), `zone_name` (`str`), `latitude` (`float`, `[-90, 90]`), `longitude` (`float`, `[-180, 180]`), `flood_area_type` (`str`).
  - `rainfall` (`RainfallOutput`): Precipitation forecast.
  - `inundation` (`InundationOutput`): Surface flood forecast.
  - `confidence` (`float`): Joint fused confidence `[0.0, 1.0]`.
  - `impact` (`ImpactAssessment`): Census exposures:
    - `population_exposed` (`int`, `ge=0`), `critical_assets` (`int`, `ge=0`), `roads_affected` (`int`, `ge=0`).
  - `priority` (`str`): Priority tier (`"CRITICAL"`, `"HIGH"`, `"MEDIUM"`, `"LOW"`).
  - `actions` (`List[str]`): Operational protocol triggers (`"ALERT"`, `"CLOSE_ROAD"`, `"DEPLOY_TEAM"`).
  - `data_source` (`str`): `"LIVE"`, `"MOCK"`, `"MIXED"`, `"PRECOMPUTED_REPLAY"`.
  - `status` (`str`): `"VERIFIED"`, `"PROTOTYPE"`, `"CONCEPT"`.
  - `timeline` (`List[TimelineStep]`): 5-step scrub bar forecast (+0m to +120m).
  - `response_route` (`ResponseRoute`): Routing corridors, impassable segments, and milestones.
  - `radar_outage` (`bool`): Active radar outage flag.
  - `fallback_mode` (`bool`): Active degraded fallback flag.
  - `fallback_source` (`str` or `null`): Source of fallback interpolation.

#### Actual Live JSON Response (`GET /api/v1/event/E001`):
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
      "step_label": null
    },
    {
      "timestamp": "2026-09-06T08:00:00Z",
      "lead_minutes": 30,
      "rainfall_mm_hr": 55.0,
      "rainfall_accumulation_mm": 70.0,
      "flood_probability": 0.55,
      "depth_band": "0.3-0.5m",
      "step_label": null
    },
    {
      "timestamp": "2026-09-06T09:00:00Z",
      "lead_minutes": 60,
      "rainfall_mm_hr": 87.0,
      "rainfall_accumulation_mm": 124.0,
      "flood_probability": 0.87,
      "depth_band": "0.5-1.0m",
      "step_label": null
    },
    {
      "timestamp": "2026-09-06T10:00:00Z",
      "lead_minutes": 90,
      "rainfall_mm_hr": 60.0,
      "rainfall_accumulation_mm": 160.0,
      "flood_probability": 0.82,
      "depth_band": "0.5-1.0m",
      "step_label": null
    },
    {
      "timestamp": "2026-09-06T11:00:00Z",
      "lead_minutes": 120,
      "rainfall_mm_hr": 35.0,
      "rainfall_accumulation_mm": 185.0,
      "flood_probability": 0.65,
      "depth_band": "0.3-0.5m",
      "step_label": null
    }
  ],
  "response_route": {
    "incident_id": "INC-01",
    "title": "Critical Ward 42 Rescue & Evacuation",
    "lead_time": "T-20 min",
    "risk_score": 0.92,
    "impassable_road": "Velachery Main Road (Near Lake)",
    "safe_route": "Inner Ring Road -> OMR Elevated Bypass",
    "route_coordinates": [
      [12.9815, 80.218],
      [12.99, 80.23],
      [13.005, 80.245],
      [13.015, 80.255]
    ],
    "blocked_coordinates": [
      [12.978, 80.215],
      [12.983, 80.221]
    ],
    "milestones": [
      {"time": "T-20 min", "label": "Velachery low-lying segments become impassable"},
      {"time": "T-35 min", "label": "Overland flood surge reaches residential culverts"},
      {"time": "T-70 min", "label": "Projected peak inundation depth (0.85m)"}
    ]
  },
  "radar_outage": false,
  "fallback_mode": false,
  "fallback_source": null
}
```

#### Degraded Radar Outage Response (`GET /api/v1/event/E001?simulate_radar_outage=true`):
```json
{
  "event_id": "E001",
  "confidence": 0.53,
  "rainfall": {
    "confidence": 0.45,
    "source": "fallback",
    "status": "PROTOTYPE"
  },
  "radar_outage": true,
  "fallback_mode": true,
  "fallback_source": "IMD_SYNOPTIC_INTERPOLATION"
}
```

#### Error 404 Behavior (`GET /api/v1/event/E999`):
- **HTTP Status**: `404 Not Found`
```json
{
  "detail": "Event E999 not found in active replay scenario catalog."
}
```

---

### 2.4 Rainfall Telemetry: `GET /api/v1/rainfall`
- **Method**: `GET`
- **Parameters**: `event_id` (`str`, optional), `zone_id` (`str`, optional), `simulate_radar_outage` (`bool`, optional)
- **Response Code**: `200 OK`
- **Response Schema**: `RainfallOutput`

#### Actual Live JSON Response (`GET /api/v1/rainfall?event_id=E001`):
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

### 2.5 Inundation Telemetry: `GET /api/v1/inundation`
- **Method**: `GET`
- **Parameters**: `event_id` (`str`, optional), `zone_id` (`str`, optional), `simulate_radar_outage` (`bool`, optional)
- **Response Code**: `200 OK`
- **Response Schema**: `InundationOutput`

#### Actual Live JSON Response (`GET /api/v1/inundation?event_id=E001`):
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

### 2.6 Spatial Risk Grid: `GET /api/v1/risk`
- **Method**: `GET`
- **Parameters**: `zone_id` (`str`, optional filter)
- **Response Code**: `200 OK`
- **Response Schema**: `List[RiskTile]`

#### Actual Live JSON Response (`GET /api/v1/risk?zone_id=Z42`):
```json
[
  {
    "tile_id": "T4201",
    "zone_id": "Z42",
    "zone_name": "Velachery South",
    "latitude": 12.9815,
    "longitude": 80.218,
    "flood_area_type": "Depression Bowl",
    "flood_probability": 0.87,
    "expected_depth_m": 0.75,
    "risk_level": "CRITICAL"
  }
]
```
