# HydroSurge AI — Complete System Architecture Specification
**Module:** Module 4 (Systems / API Integration / Decision Dashboard)  
**Status:** VERIFIED 🟢  
**Target Basin:** Greater Chennai Corporation • Adyar Basin Catchment  

---

## 1. High-Level Dataflow

```
[IMD Weather Radar / NWP]             [CMWSSB / GCC Sensors & DEM]
             │                                      │
             ▼                                      ▼
    ┌─────────────────┐                    ┌─────────────────┐
    │  R&D-1 DGMR ML  │                    │ R&D-2 Hydraulic │
    │ Nowcasting Model│                    │ Inundation Model│
    └────────┬────────┘                    └────────┬────────┘
             │ RainfallOutput                       │ InundationOutput
             └──────────────────┬───────────────────┘
                                │
                                ▼
         ┌─────────────────────────────────────────────┐
         │          MOD_4 Integration Gateway          │
         │   (FastAPI REST Endpoints / Pydantic v2)    │
         │                                             │
         │  - Providers: Mock / Live / Hybrid          │
         │  - Provenance: LIVE / MOCK / MIXED          │
         │  - Outage Simulation & Degraded Penalty     │
         │  - Multi-Hazard Decision Priority Engine    │
         └──────────────────────┬──────────────────────┘
                                │ HTTP JSON (/api/v1/*)
                                ▼
         ┌─────────────────────────────────────────────┐
         │        HydroSurge Operations Dashboard      │
         │           (Next.js 16 / React 19)           │
         │                                             │
         │  - Hazard Nowcasting & Timeline Scrub Bar   │
         │  - Dynamic Leaflet GIS Risk Tile Map        │
         │  - Demographic Impact & What-If Simulator   │
         │  - Safe Evacuation Corridor & Choke Points  │
         │  - OASIS CAP v1.2 / SACHET Alert Dispatcher │
         └─────────────────────────────────────────────┘
```

---

## 2. DecisionObject Aggregation Engine

The core data contract served by `GET /api/v1/event/{id}` is the unified `DecisionObject`. It aggregates:

1. **Spatial Geometry (`location`)**: Centroid WGS84 coordinate (`latitude`, `longitude`), neighborhood name, and catchment terrain category.
2. **Precipitation Telemetry (`rainfall`)**: Current rate (`rainfall_mm_hr`), total storm accumulation (`rainfall_accumulation_mm`), forecast lead horizon, and sensor confidence.
3. **Hydrodynamic Inundation (`inundation`)**: Flood probability, peak depth band classification (`<0.1m` to `>1.0m`), and solver confidence.
4. **Fused Confidence (`confidence`)**: Calculated as the minimum of the rainfall and inundation confidence scores.
5. **Demographic Exposure (`impact`)**: Census population exposed, critical municipal assets endangered, and impassable arterial roadways.
6. **Multi-Hazard Priority (`priority`)**: `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`.
7. **Action Triggers (`actions`)**: Protocol checklist (`ALERT`, `CLOSE_ROAD`, `DEPLOY_TEAM`, `DIVERT_TRAFFIC`).
8. **Temporal Forecast Timeline (`timeline`)**: Array of 5 discrete time steps (+0m, +30m, +60m, +90m, +120m) enabling temporal scrubbing.
9. **Evacuation Routing Corridor (`response_route`)**: Coordinates of impassable flood chokes and elevated safe evacuation bypass corridors with milestone alerts.
10. **Failover & Degraded Telemetry (`radar_outage`, `fallback_mode`, `fallback_source`)**: Explicit metadata documenting sensor health and fallback provenance.

---

## 3. Doppler Radar Outage Simulation & Fallback Mechanism

When `simulate_radar_outage=true` is submitted to `/event/{id}`, `/rainfall`, or `/inundation`:
1. The backend sets `radar_outage = True` and `fallback_mode = True`.
2. The fallback provider switches to `"IMD_SYNOPTIC_INTERPOLATION"`.
3. An explicit confidence penalty is applied:
   - `rainfall.confidence` is reduced to `0.45` (truthful penalty representing radar signal loss).
   - `inundation.confidence` is reduced to `0.53`.
   - The overall joint confidence drops accordingly.
4. The dashboard reflects this degraded status in real-time, displaying amber warning badges across the telemetry cards without breaking system operation.
