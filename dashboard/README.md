# HydroSurge AI — Incident Decision Support Dashboard

Emergency flood operations command dashboard for Greater Chennai Corporation (GCC) and the Adyar Basin.

Built with **Next.js 16 (App Router)** and **React 19**, styled with Tailwind CSS in a high-contrast dark command-center aesthetic.

---

## 1. Architectural Invariant: 100% API Driven

> **THE DASHBOARD CONTAINS ZERO LOCAL SCENARIO DATA OR MOCK FALLBACKS.**  
> The frontend client communicates exclusively with the FastAPI backend (`http://127.0.0.1:8000/api/v1`).
> Direct imports of `fallback.js`, CSV files, notebooks, or GeoTIFF rasters are strictly prohibited.

---

## 2. Component to API Mapping

| Component | Target File | API Endpoint | Data Consumed | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Page Root** | `app/page.js` | `/events`, `/event/{id}`, `/risk` | Master state | Coordinates initial load, event switching, and active mode |
| **Status Strip** | `app/components/StatusStrip.jsx` | `/health`, `/event/{id}` | `provider_mode`, latency, provenance | Displays real-time API connectivity and latency benchmarks |
| **Zone Map** | `app/components/ZoneMap.jsx` | `/risk`, `/event/{id}` | Coordinates, depth, response route | Leaflet GIS interactive map rendering Chennai catchment markers |
| **Timeline Bar** | `app/components/TimelineBar.jsx` | `/event/{id}` | `timeline` (+0m to +120m) | Interactive forecast scrub bar |
| **Hazard Mode** | `app/components/HazardMode.jsx` | `/event/{id}` | `rainfall`, `inundation`, radar outage | Precipitation rates, flood depths, and radar outage controls |
| **Impact Mode** | `app/components/ImpactMode.jsx` | `/event/{id}` | `impact`, `location` | Demographic vulnerability and interactive What-If scenario simulator |
| **Response Mode**| `app/components/ResponseMode.jsx`| `/event/{id}` | `response_route`, `actions` | Time-to-impact clock, impassable roads, and safe evacuation corridors |
| **CAP Drawer** | `app/components/CapDrawer.jsx` | `/event/{id}` | All decision fields | Generates OASIS CAP v1.2 / SACHET disaster warning XML payload |

---

## 3. Forbidden Frontend Data Sources

The following static and duplicate assets were permanently purged:
- `dashboard/app/data/fallback.js`: **REMOVED**
- `FALLBACK_PAYLOADS`: **REMOVED**
- `SAMPLE_EVENTS`: **REMOVED**
- `ZONE_COORDINATES`: **REMOVED**

A repository-wide static architecture scan (`tests/test_integration_hardening.py::test_frontend_static_architecture_scan`) verifies that zero prohibited tokens exist in the frontend codebase.

---

## 4. Next.js 16 Turbopack Configuration

In `next.config.mjs`, `allowedDevOrigins` is configured to prevent HMR cross-origin blocking:
```javascript
const nextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "127.0.0.1:3000",
    "localhost:3000",
  ],
};
```

---

## 5. Running the Dashboard

```powershell
# Development server (Port 3000)
npm run dev

# Optimized Production Build
npm run build
npm start
```
