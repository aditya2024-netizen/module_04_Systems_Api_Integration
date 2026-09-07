"""
Consolidated Figma Context Generator
Generates HYDROSURGE_FIGMA_CONTEXT.md with all 21 required sections and full source files.
"""
from pathlib import Path
import json

REPO_ROOT = Path(r"c:\d_backup\PROJECTS\SIH_26071_MODULE_4")
OUTPUT_FILE = REPO_ROOT / "HYDROSURGE_FIGMA_CONTEXT.md"


def read_file(rel_path: str) -> str:
    path = REPO_ROOT / rel_path
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")
    return path.read_text(encoding="utf-8")


def format_file_block(rel_path: str, purpose: str) -> str:
    content = read_file(rel_path)
    return (
        "==================================================\n"
        f"FILE: {rel_path}\n"
        "PURPOSE:\n"
        f"{purpose}\n\n"
        "CODE:\n"
        f"{content}\n"
        "==================================================\n\n"
    )


def generate():
    parts = []

    # Opening Preamble
    parts.append(
        "THIS FILE IS A CONSOLIDATED FRONTEND CONTEXT FOR FIGMA.\n"
        "It represents the existing HydroSurge implementation.\n"
        "Figma must use this as a source of truth and must not invent screens, metrics, data, API behavior, or functionality.\n\n"
        "# HYDROSURGE AI — CONSOLIDATED FRONTEND CONTEXT FOR FIGMA UI/UX REDESIGN\n\n"
        "---\n\n"
    )

    # Section 1: PROJECT OVERVIEW
    parts.append(
        "## 1. PROJECT OVERVIEW\n\n"
        "### System Identity & Mission\n"
        "**HydroSurge AI** is an AI/ML-based Integrated Heavy Rainfall Early Warning and Inundation Prediction System designed for Smart India Hackathon (SIH 2026) Problem Statement 26071.\n\n"
        "The system delivers real-time meteorological nowcasting and hyper-local 2D hydrodynamic flood risk predictions for urban river basins, with Greater Chennai Corporation (GCC) and the Adyar River Basin serving as the primary operational demonstration catchment.\n\n"
        "### Primary Target Personas\n"
        "1. **Municipal Disaster Management Commissioner / Incident Commander**: Requires immediate, high-level situational awareness: current storm intensity, projected peak overland water depth, timeline countdown to impassable choke points, exposed census population, and one-click authorization of Common Alerting Protocol (CAP v1.2 / SACHET) public broadcasts.\n"
        "2. **Emergency Operations Center (EOC) Tactical Watch Officer**: Continuously monitors spatial radar advection grids, automated weather station (AWS) telemetry, catchment elevation gradients, and drainage choke points. Coordinates field resource deployment (sandbagging, dewatering pumps, NDRF/SDRF rescue teams).\n"
        "3. **Traffic Police & Transit Dispatcher**: Needs unambiguous routing guidance indicating impassable road segments and verified safe elevated bypass corridors to divert heavy transport and vehicular flow before water levels breach critical thresholds.\n\n"
        "### Core Operational User Flow\n"
        "1. **Detection & Nowcasting**: Sensor telemetry (Doppler Weather Radar, INSAT-3DR satellite, AWS surface gauges) is ingested to compute 0–3 hour precipitation nowcasts (mm/hr and accumulation).\n"
        "2. **Hydrodynamic Inundation Modeling**: Rainfall rates drive 2D shallow-water inundation solvers using high-resolution DEM terrain rasters to forecast water depth bands (`<0.1m`, `0.1–0.3m`, `0.3–0.5m`, `0.5–1.0m`, `>1.0m`) and occurrence probabilities.\n"
        "3. **Decision Support & Synthesis**: The backend fuses meteorological, inundation, demographic exposure, and road choke point data into a single, unified `DecisionObject`.\n"
        "4. **Action Dispatch & Public Alerting**: The commander reviews recommended protocols, simulates what-if interventions (e.g. canal dewatering, tidal surges), inspects safe evacuation routes on GIS cartography, and issues OASIS CAP v1.2 / SACHET XML emergency alerts.\n\n"
        "---\n\n"
    )

    # Section 2: APPLICATION STRUCTURE
    parts.append(
        "## 2. APPLICATION STRUCTURE\n\n"
        "The HydroSurge frontend is built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Leaflet 1.9.4**. It operates as an enterprise single-page multi-view application where all state is centrally driven by versioned REST contracts from the FastAPI gateway.\n\n"
        "### Frontend Directory Map\n"
        "```\n"
        "dashboard/\n"
        "├── package.json                   # Dependency definitions & scripts\n"
        "├── postcss.config.mjs             # PostCSS Tailwind plugins\n"
        "├── next.config.mjs                # Next.js configuration\n"
        "├── .env.example                   # Client API base URL template\n"
        "└── app/\n"
        "    ├── layout.js                 # HTML shell and metadata\n"
        "    ├── globals.css               # Design tokens, color system, typography\n"
        "    ├── page.js                   # Root orchestrator, view switcher, API state\n"
        "    ├── lib/\n"
        "    │   └── api.js                # Centralized FastAPI client over HTTP\n"
        "    ├── components/\n"
        "    │   ├── TopNav.jsx            # Top application bar, focus selector, radar toggle\n"
        "    │   ├── Sidebar.jsx           # Collapsible primary section navigation\n"
        "    │   ├── StatusStrip.jsx       # Operational telemetry strip & latency indicators\n"
        "    │   ├── TimelineBar.jsx       # Interactive temporal horizon scrubber (+0 to +120m)\n"
        "    │   ├── ZoneMap.jsx           # Leaflet GIS cartography, centroids, routes\n"
        "    │   ├── HazardMode.jsx        # Precipitation & inundation telemetry panel\n"
        "    │   ├── ImpactMode.jsx        # Demographic matrix & what-if simulator\n"
        "    │   ├── ResponseMode.jsx      # Tactical actions & safe evacuation corridors\n"
        "    │   ├── CapDrawer.jsx         # OASIS CAP v1.2 / SACHET XML alert modal\n"
        "    │   ├── Icons.jsx             # SVG tactical icon set\n"
        "    │   └── views/\n"
        "    │       ├── RainfallView.jsx  # Dedicated rainfall hyetograph view\n"
        "    │       ├── InundationView.jsx# Dedicated hydrodynamic depth matrix view\n"
        "    │       ├── ImpactView.jsx    # Dedicated impact & what-if view\n"
        "    │       ├── AlertsView.jsx    # Dedicated action & emergency alert view\n"
        "    │       ├── DataSourcesView.jsx# Sensor registry & provenance view\n"
        "    │       ├── SystemHealthView.jsx# Gateway latency & service health view\n"
        "    │       └── ReplayView.jsx    # Historical scenario catalog view\n"
        "```\n\n"
    )
    parts.append(format_file_block(
        "dashboard/package.json",
        "Defines frontend dependencies, Next.js 16 Turbopack runner, React 19, Leaflet, and Tailwind CSS v4."
    ))

    # Section 3: DESIGN/THEME/CSS
    parts.append(
        "## 3. DESIGN/THEME/CSS\n\n"
        "HydroSurge utilizes a crisp, clean, light-first enterprise command-center theme. It completely avoids dark 'cyberpunk' styling in favor of operational clarity, high-contrast typography, subtle neutral borders, and semantic color accents (sky for precipitation, amber for warning/degradation, rose/red for critical emergency, and emerald for nominal safety).\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/globals.css",
        "Global stylesheets containing strict OKLCH design tokens, CSS variables, typography classes, and Leaflet map overrides."
    ))

    # Section 4: APP SHELL AND ROUTING
    parts.append(
        "## 4. APP SHELL AND ROUTING\n\n"
        "The root layout sets up HTML headers, viewport constraints, and base styles. The main page (`page.js`) acts as the stateful orchestrator that manages active view routing, incident focus switching, interactive timeline scrubbing, radar outage simulations, and API error states.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/layout.js",
        "HTML page wrapper providing document metadata, font declarations, and root viewport bounds."
    ))
    parts.append(format_file_block(
        "dashboard/app/page.js",
        "Root state orchestrator, view router, API synchronization engine, and operational workspace layout."
    ))

    # Section 5: SIDEBAR
    parts.append(
        "## 5. SIDEBAR\n\n"
        "The primary navigation sidebar enables rapid switching across all 8 operational domains (Overview/Command Center, Rainfall Forecast, Inundation Risk, Impact & What-If, Action & Alert Center, Data Sources, System Health, Historical Replay). It supports collapsible states and displays active alert counts.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/Sidebar.jsx",
        "Navigation sidebar with responsive collapse, section selection, active indicators, and health status badge."
    ))

    # Section 6: TOP NAVIGATION
    parts.append(
        "## 6. TOP NAVIGATION\n\n"
        "The top application bar provides persistent operational controls: the active catchment dropdown switcher, regional sector tags, live radar outage simulation toggle, manual API refresh button, and direct trigger for generating CAP v1.2 / SACHET alert payloads.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/TopNav.jsx",
        "Header bar featuring catchment event switcher, priority badges, radar outage control, and CAP drawer CTA."
    ))

    # Section 7: COMMAND CENTER
    parts.append(
        "## 7. COMMAND CENTER\n\n"
        "The central operational dashboard view combines real-time situational telemetry, emergency priority banners, temporal scrub controls, primary GIS cartography, and sub-mode tabs for hazard, impact, and response inspection.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/StatusStrip.jsx",
        "Operational status ribbon displaying data provenance (Replay/Live), validation tags, and API latency benchmarks."
    ))
    parts.append(format_file_block(
        "dashboard/app/components/HazardMode.jsx",
        "Precipitation rate and hydrodynamic inundation depth cards with sensor provenance and outage status."
    ))

    # Section 8: RAINFALL FORECAST
    parts.append(
        "## 8. RAINFALL FORECAST\n\n"
        "Dedicated precipitation intelligence view featuring instantaneous precipitation rates, accumulation totals, lead horizon bounds, IMD hyetograph classification criteria, and a custom SVG hyetograph visualization.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/views/RainfallView.jsx",
        "Full-screen rainfall analytics view with hyetograph chart, intensity categories, and radar/satellite sensor status."
    ))

    # Section 9: INUNDATION RISK
    parts.append(
        "## 9. INUNDATION RISK\n\n"
        "Dedicated hydrodynamic inundation view presenting 2D shallow-water model outputs, depth band classifications (`<0.1m`, `0.1–0.3m`, `0.3–0.5m`, `0.5–1.0m`, `>1.0m`), occurrence probabilities, and terrain classification.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/views/InundationView.jsx",
        "Hydrodynamic depth band progression matrix, flood probability metrics, and hydraulic solver metadata."
    ))

    # Section 10: IMPACT & WHAT-IF
    parts.append(
        "## 10. IMPACT & WHAT-IF\n\n"
        "Vulnerability assessment suite providing demographic exposure matrices (children, elderly, vulnerable housing), critical infrastructure defense priorities (hospitals, substations, bridges), explainability breakdowns, and an interactive What-If scenario simulator.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/ImpactMode.jsx",
        "Core demographic exposure cards, explainability attribution ('Why this alert?'), and 3-slider What-If simulator."
    ))
    parts.append(format_file_block(
        "dashboard/app/components/views/ImpactView.jsx",
        "Dedicated page container embedding socioeconomic impact analytics and What-If scenario modeling."
    ))

    # Section 11: ACTION & ALERT CENTER
    parts.append(
        "## 11. ACTION & ALERT CENTER\n\n"
        "Emergency decision support center featuring active incident queue selection, time-to-impact countdown timer, simulated choke point bypass routing, protocol authorization checklist, and the OASIS CAP v1.2 / SACHET XML generator.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/ResponseMode.jsx",
        "Incident queue switcher, countdown clock, evacuation corridor guidance, and interactive dispatch checklist."
    ))
    parts.append(format_file_block(
        "dashboard/app/components/views/AlertsView.jsx",
        "Dedicated alert center view wrapping tactical action dispatch and evacuation routing."
    ))
    parts.append(format_file_block(
        "dashboard/app/components/CapDrawer.jsx",
        "Modal drawer generating standardized OASIS Common Alerting Protocol v1.2 XML payload with copy/download."
    ))

    # Section 12: DATA SOURCES
    parts.append(
        "## 12. DATA SOURCES\n\n"
        "Sensor registry tracking upstream observational telemetry feeds (Doppler Weather Radar, INSAT-3DR Geostationary Satellite, AWS Surface Gauges, NWP WRF Mesoscale Model), quality scores, update frequencies, and coverage radii.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/views/DataSourcesView.jsx",
        "Comprehensive sensor health cards, latency trackers, station metadata, and sensor-fusion architecture description."
    ))

    # Section 13: SYSTEM HEALTH
    parts.append(
        "## 13. SYSTEM HEALTH\n\n"
        "Subsystem diagnostics interface tracking FastAPI gateway endpoints, active provider modes, live connection status, and empirical latency percentiles (p50, p95, load time, peak memory).\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/views/SystemHealthView.jsx",
        "System diagnostics view displaying microservice statuses, real-time health checks, and verified latency benchmarks."
    ))

    # Section 14: HISTORICAL REPLAY
    parts.append(
        "## 14. HISTORICAL REPLAY\n\n"
        "Deterministic scenario playback interface allowing operational teams to scrub through multi-step temporal flood progressions across 5 GCC Chennai storm events.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/views/ReplayView.jsx",
        "Historical replay workspace with event catalog, metadata cards, and integrated timeline playback scrubber."
    ))

    # Section 15: GIS / LEAFLET MAP
    parts.append(
        "## 15. GIS / LEAFLET MAP\n\n"
        "Interactive geospatial viewport built on Leaflet rendering OpenStreetMap base tiles, catchment centroids, discrete risk influence radiuses, degraded uncertainty envelopes, simulated roadway choke points, and safe evacuation corridors.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/ZoneMap.jsx",
        "Leaflet map component with dynamic centroid markers, layer toggles, HUD overlay, and evacuation polyline."
    ))

    # Section 16: SHARED UI COMPONENTS
    parts.append(
        "## 16. SHARED UI COMPONENTS\n\n"
        "Shared temporal controller allowing users to scrub between forecast horizons (T+0 to T+120 minutes) with play/pause automation, probability badges, and step summaries.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/TimelineBar.jsx",
        "Multi-step temporal scrubber with auto-play animation, progress track, and lead-time telemetry indicators."
    ))

    # Section 17: API SERVICE / FRONTEND API CONSUMPTION
    parts.append(
        "## 17. API SERVICE / FRONTEND API CONSUMPTION\n\n"
        "Centralized HTTP client enforcing the core architectural invariant: the frontend communicates with the backend exclusively via FastAPI `/api/v1` REST routes with timeout handling. No direct file reads or notebook imports are permitted.\n\n"
        "### Consumed Endpoints:\n"
        "- `GET /api/v1/health`: Gateway diagnostics and provider states\n"
        "- `GET /api/v1/events`: High-level summary catalog of available incidents\n"
        "- `GET /api/v1/event/{id}`: Complete DecisionObject with rainfall, inundation, impact, timeline, and routing\n"
        "- `GET /api/v1/risk`: Spatial risk grid tiles with latitude/longitude centroids\n"
        "- `GET /api/v1/rainfall`: Nowcasting precipitation output\n"
        "- `GET /api/v1/inundation`: Hydrodynamic depth band and flood probability output\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/lib/api.js",
        "Frontend API client with fetchWithTimeout, query parameter serialization, and error boundary handling."
    ))
    parts.append(format_file_block(
        "dashboard/.env.example",
        "Client environment variable configuration template defining NEXT_PUBLIC_API_BASE_URL."
    ))

    # Section 18: TYPES / INTERFACES
    parts.append(
        "## 18. TYPES / INTERFACES\n\n"
        "Formal data contracts defining all JSON payload structures consumed by the HydroSurge frontend UI:\n\n"
        "```typescript\n"
        "export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';\n"
        "export type DataSourceTag = 'LIVE' | 'PRECOMPUTED_REPLAY' | 'MOCK' | 'MIXED';\n"
        "export type StatusTag = 'VERIFIED' | 'PROTOTYPE' | 'ARCHITECTURE' | 'CONCEPT';\n"
        "export type DepthBand = '<0.1m' | '0.1-0.3m' | '0.3-0.5m' | '0.5-1.0m' | '>1.0m';\n\n"
        "export interface Location {\n"
        "  zone_id: string;             // e.g. 'Z42'\n"
        "  city?: string;               // e.g. 'Chennai'\n"
        "  zone_name?: string;          // e.g. 'Velachery South'\n"
        "  latitude: number;            // Centroid latitude in WGS84 (e.g. 12.9815)\n"
        "  longitude: number;           // Centroid longitude in WGS84 (e.g. 80.2180)\n"
        "  flood_area_type?: string;    // e.g. 'Depression Bowl'\n"
        "}\n\n"
        "export interface RainfallOutput {\n"
        "  event_id: string;            // e.g. 'E001'\n"
        "  zone_id: string;\n"
        "  valid_time: string;          // ISO 8601 timestamp\n"
        "  lead_minutes: number;        // e.g. 60\n"
        "  rainfall_mm_hr: number;      // Precipitation intensity (ge=0.0)\n"
        "  rainfall_accumulation_mm: number; // Cumulative rain (ge=0.0)\n"
        "  confidence: number;          // Confidence score [0.0 - 1.0]\n"
        "  prediction_uri: string;\n"
        "  source: string;              // 'mock' | 'rainfall_model' | 'imd_kalpana_satellite_fallback'\n"
        "  status: StatusTag;\n"
        "}\n\n"
        "export interface InundationOutput {\n"
        "  event_id: string;\n"
        "  zone_id: string;\n"
        "  flood_probability: number;   // Occurrence probability [0.0 - 1.0]\n"
        "  depth_band: DepthBand;       // e.g. '0.5-1.0m'\n"
        "  risk_uri: string;\n"
        "  confidence: number;          // Confidence score [0.0 - 1.0]\n"
        "  valid_time: string;\n"
        "  source: string;\n"
        "  status: StatusTag;\n"
        "}\n\n"
        "export interface ImpactMetrics {\n"
        "  population_exposed: number;  // Census residents within hazard envelope (ge=0)\n"
        "  critical_assets: number;     // Exposed clinics, substations (ge=0)\n"
        "  roads_affected: number;      // Disrupted road segments (ge=0)\n"
        "}\n\n"
        "export interface TimelineStep {\n"
        "  timestamp: string;           // ISO 8601 timestamp\n"
        "  lead_minutes: number;        // Lead time from baseline (e.g. 0, 30, 60, 90, 120)\n"
        "  rainfall_mm_hr: number;\n"
        "  rainfall_accumulation_mm: number;\n"
        "  flood_probability: number;\n"
        "  depth_band: DepthBand;\n"
        "  step_label?: string;         // e.g. '+60m'\n"
        "}\n\n"
        "export interface Milestone {\n"
        "  time: string;                // e.g. 'T-20 min'\n"
        "  label: string;               // Event description\n"
        "}\n\n"
        "export interface ResponseRoute {\n"
        "  incident_id: string;         // e.g. 'INC-01'\n"
        "  title: string;\n"
        "  lead_time: string;\n"
        "  risk_score: number;\n"
        "  impassable_road: string;\n"
        "  safe_route: string;\n"
        "  route_coordinates: [number, number][]; // [[lat, lng], ...]\n"
        "  blocked_coordinates: [number, number][]; // [[lat, lng], ...]\n"
        "  milestones: Milestone[];\n"
        "}\n\n"
        "export interface DecisionObject {\n"
        "  event_id: string;\n"
        "  location: Location;\n"
        "  rainfall: RainfallOutput;\n"
        "  inundation: InundationOutput;\n"
        "  confidence: number;          // Fused operational confidence [0.0 - 1.0]\n"
        "  impact: ImpactMetrics;\n"
        "  priority: PriorityLevel;\n"
        "  actions: string[];           // Recommended protocols e.g. ['ALERT', 'CLOSE_ROAD', 'DEPLOY_TEAM']\n"
        "  data_source: DataSourceTag;\n"
        "  status: StatusTag;\n"
        "  timeline: TimelineStep[];\n"
        "  response_route?: ResponseRoute;\n"
        "  radar_outage: boolean;\n"
        "  fallback_mode: boolean;\n"
        "  fallback_source?: string | null;\n"
        "}\n\n"
        "export interface RiskTile {\n"
        "  tile_id: string;\n"
        "  zone_id: string;\n"
        "  timestamp: string;\n"
        "  rainfall_mm_hr: number;\n"
        "  flood_probability: number;\n"
        "  depth_band: DepthBand;\n"
        "  confidence: number;\n"
        "  latitude: number;\n"
        "  longitude: number;\n"
        "  zone_name: string;\n"
        "}\n\n"
        "export interface EventSummary {\n"
        "  event_id: string;\n"
        "  zone_id: string;\n"
        "  zone_name: string;\n"
        "  priority: PriorityLevel;\n"
        "}\n"
        "```\n\n"
        "---\n\n"
    )

    # Section 19: REPLAY / MOCK DATA
    parts.append(
        "## 19. REPLAY / MOCK DATA\n\n"
        "The deterministic scenario database controlling all displayed metrics across scenarios `E001` through `E005` in Greater Chennai Corporation.\n\n"
    )
    parts.append(format_file_block(
        "demo/replay/scenario.json",
        "Deterministic scenario dataset powering mock/replay provider responses for rainfall, inundation, timeline, impact, and response routes."
    ))

    # Section 20: ASSETS AND ICONS
    parts.append(
        "## 20. ASSETS AND ICONS\n\n"
        "Vector SVG icon library used across navigation bars, view titles, metrics cards, and map controls.\n\n"
    )
    parts.append(format_file_block(
        "dashboard/app/components/Icons.jsx",
        "Reusable SVG icons: Overview, Rainfall, Inundation, Impact, Alert, DataSources, Health, Replay, Map, Layers, Chevrons, Refresh, Shield, Target."
    ))

    # Section 21: EXISTING DESIGN TOKENS
    parts.append(
        "## 21. EXISTING DESIGN TOKENS\n\n"
        "### Color Tokens\n"
        "| Token | Hex Value | Semantic Role |\n"
        "|:---|:---|:---|\n"
        "| `--canvas` | `#f8fafc` (Slate 50) | Main application background surface |\n"
        "| `--card` | `#ffffff` (White) | Primary container surface for panels, headers, widgets |\n"
        "| `--card-elevated` | `#f1f5f9` (Slate 100) | Secondary elevated surface for cards, pill buttons, metrics |\n"
        "| `--card-hover` | `#e2e8f0` (Slate 200) | Interactive hover background state |\n"
        "| `--border` | `#e2e8f0` (Slate 200) | Clean neutral divider & card borders |\n"
        "| `--text-primary` | `#0f172a` (Slate 900) | Primary headlines, titles, and major telemetry readouts |\n"
        "| `--text-secondary` | `#475569` (Slate 600) | Explanatory descriptions and secondary labels |\n"
        "| `--text-muted` | `#64748b` (Slate 500) | Metadata captions, unit labels, and timestamps |\n"
        "| `--critical` | `#dc2626` (Red 600) | Critical alert banner, high-risk inundation, emergency CAP CTA |\n"
        "| `--critical-bg` | `#fef2f2` (Red 50) | Background for critical risk cards and choke points |\n"
        "| `--critical-border` | `#fecaca` (Red 200) | Border highlight for critical conditions |\n"
        "| `--warning` | `#d97706` (Amber 600) | High alert priority, radar outage banner, moderate runoff |\n"
        "| `--warning-bg` | `#fffbeb` (Amber 50) | Background for warning states and degraded fallback alerts |\n"
        "| `--warning-border` | `#fde68a` (Amber 200) | Border highlight for warning badges |\n"
        "| `--safe` | `#16a34a` (Green 600) | Low priority, nominal safety, verified status, online gateway |\n"
        "| `--safe-bg` | `#f0fdf4` (Green 50) | Background for safe bypass corridors and verified checks |\n"
        "| `--safe-border` | `#bbf7d0` (Green 200) | Border highlight for safe condition tags |\n"
        "| `--accent-cyan` | `#0284c7` (Sky 600) | Primary operational accent, rainfall nowcast bars, zone focus |\n\n"
        "### Typography\n"
        "- **Standard UI Body**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`\n"
        "- **Telemetry & Numeric Readouts**: `.font-telemetry` $\\rightarrow$ `ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` with tabular numerals (`font-feature-settings: 'tnum' 1`).\n\n"
        "### Component Utility Classes\n"
        "- `.panel-technical`: Card surface (`bg-[var(--card)]`), border (`border-[var(--border)]`), rounded (`rounded-xl`), soft shadow (`shadow-2xs`).\n"
        "- `.panel-elevated`: Secondary surface (`bg-[var(--card-elevated)]`), border (`border-[var(--border)]`), rounded (`rounded-lg`).\n"
        "- `.corner-accents`: Subtle positional accents framing command-center cards.\n"
        "- `.label-tactical`: Uppercase 10px bold tracking-wider header for section cards.\n\n"
        "---\n\n"
    )

    # Closing Redesign Objective
    parts.append(
        "DESIGN REDESIGN OBJECTIVE\n\n"
        "The existing HydroSurge interface must be redesigned into a credible, professional early rainfall prediction and urban flood early-warning dashboard.\n\n"
        "Preserve existing functionality and information architecture where appropriate, but improve:\n"
        "- information hierarchy\n"
        "- rainfall-first communication\n"
        "- forecast visualization\n"
        "- risk communication\n"
        "- map usability\n"
        "- emergency decision support\n"
        "- readability\n"
        "- spacing\n"
        "- responsive behavior\n"
        "- interaction affordances\n"
        "- visual consistency\n\n"
        "Remove unnecessary developer/prototype-facing presentation from the primary operational UI.\n\n"
        "Do NOT invent data or capabilities.\n"
    )

    full_text = "".join(parts)
    OUTPUT_FILE.write_text(full_text, encoding="utf-8")
    print(f"Successfully generated {OUTPUT_FILE} (Length: {len(full_text):,} bytes)")


if __name__ == "__main__":
    generate()
