"use client";

import { useState, useEffect } from "react";
import { fetchEvents, fetchEvent, fetchRiskTiles, fetchHealth, API_BASE_URL } from "./lib/api";
import ZoneMap from "./components/ZoneMap";
import StatusStrip from "./components/StatusStrip";
import TimelineBar from "./components/TimelineBar";
import HazardMode from "./components/HazardMode";
import ImpactMode from "./components/ImpactMode";
import ResponseMode from "./components/ResponseMode";
import CapDrawer from "./components/CapDrawer";

export default function DashboardPage() {
  const [selectedEventId, setSelectedEventId] = useState("E001");
  const [eventsList, setEventsList] = useState([]);
  const [eventData, setEventData] = useState(null);
  const [riskTiles, setRiskTiles] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [notFoundEventId, setNotFoundEventId] = useState(null);

  // Dashboard Modes: "hazard" | "impact" | "response"
  const [activeMode, setActiveMode] = useState("hazard");

  // Interactive Timeline State
  const [timelineStepIndex, setTimelineStepIndex] = useState(0);

  // Radar Outage Simulation State
  const [isRadarOutage, setIsRadarOutage] = useState(false);

  // CAP Alert Modal Drawer State
  const [isCapDrawerOpen, setIsCapDrawerOpen] = useState(false);

  // Initial Load: Events List, Risk Tiles, and Health
  async function loadInitialData() {
    setInitialLoading(true);
    setErrorMessage(null);
    setNotFoundEventId(null);

    try {
      // 1. Health check
      try {
        const health = await fetchHealth();
        if (health && health.status === "healthy") {
          setApiConnected(true);
        }
      } catch (hErr) {
        setApiConnected(false);
      }

      // 2. Fetch Events List
      const events = await fetchEvents();
      setEventsList(events);

      // 3. Fetch Spatial Risk Tiles for map
      const tiles = await fetchRiskTiles();
      setRiskTiles(tiles);

      // 4. Fetch Active Event (E001 or first event)
      const initialId = events.length > 0 ? events[0].event_id : "E001";
      setSelectedEventId(initialId);
      const ev = await fetchEvent(initialId, { simulateRadarOutage: isRadarOutage });
      setEventData(ev);
      setApiConnected(true);
    } catch (err) {
      console.error("API Gateway error during initial load:", err);
      setApiConnected(false);
      setErrorMessage(
        `Unable to connect to HydroSurge API Gateway at ${API_BASE_URL}. Ensure the FastAPI service is running.`
      );
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch Event when selectedEventId or isRadarOutage changes
  useEffect(() => {
    if (!selectedEventId || initialLoading) return;

    // Deduplicate if already matches current eventData
    if (
      eventData &&
      eventData.event_id === selectedEventId &&
      eventData.radar_outage === isRadarOutage
    ) {
      return;
    }

    let isMounted = true;
    setEventLoading(true);

    async function loadEvent() {
      try {
        const ev = await fetchEvent(selectedEventId, { simulateRadarOutage: isRadarOutage });
        if (isMounted) {
          setEventData(ev);
          setErrorMessage(null);
          setNotFoundEventId(null);
          setApiConnected(true);
          setEventLoading(false);
        }
      } catch (err) {
        console.error(`Failed to fetch event ${selectedEventId}:`, err);
        if (isMounted) {
          if (err.message.includes("404")) {
            setNotFoundEventId(selectedEventId);
          } else {
            setErrorMessage(
              `Failed to load event ${selectedEventId} from API: ${err.message}`
            );
          }
          setEventLoading(false);
        }
      }
    }

    loadEvent();
    setTimelineStepIndex(0);

    return () => {
      isMounted = false;
    };
  }, [selectedEventId, isRadarOutage, initialLoading, eventData]);

  const handleToggleRadarOutage = () => {
    setIsRadarOutage((prev) => !prev);
  };

  const handleSelectZoneFromMap = (zId) => {
    const matched = eventsList.find((e) => e.zone_id === zId);
    if (matched) {
      setSelectedEventId(matched.event_id);
    }
  };

  const priorityThemes = {
    CRITICAL: {
      banner: "bg-[var(--card)] border border-[var(--critical)] shadow-lg shadow-rose-950/20",
      badge: "bg-[var(--critical)] text-white font-bold",
      indicator: "bg-rose-500",
      headline: "Emergency Inundation Warning — Evacuation Advisory Active",
    },
    HIGH: {
      banner: "bg-[var(--card)] border border-[var(--warning)] shadow-lg shadow-amber-950/20",
      badge: "bg-[var(--warning)] text-white font-bold",
      indicator: "bg-amber-500",
      headline: "High Inundation Risk — Preparedness and Silt Clearance Active",
    },
    MEDIUM: {
      banner: "bg-[var(--card)] border border-yellow-600/50",
      badge: "bg-yellow-600 text-white font-bold",
      indicator: "bg-yellow-500",
      headline: "Moderate Waterlogging Advisory — Drainage Telemetry Active",
    },
    LOW: {
      banner: "bg-[var(--card)] border border-[var(--safe)]/50",
      badge: "bg-[var(--safe)] text-white font-bold",
      indicator: "bg-emerald-500",
      headline: "Nominal Conditions — Routine Drainage Telemetry",
    },
  };

  // Render Initial Loading Skeleton
  if (initialLoading) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="h-10 w-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-base font-bold text-white">Connecting to HydroSurge API Gateway</h2>
            <p className="text-xs text-slate-400 mt-1">
              Synchronizing with versioned FastAPI endpoints (health, events, spatial risk)...
            </p>
          </div>
          <div className="p-2.5 rounded bg-[var(--card)] border border-[var(--border)] text-[11px] font-telemetry text-slate-500">
            Target: {API_BASE_URL}
          </div>
        </div>
      </main>
    );
  }

  // Render API Offline Error State
  if (errorMessage && !eventData) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl bg-[var(--card)] border border-rose-600/60 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3 text-rose-400">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-base font-bold text-white">API Gateway Unavailable</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {errorMessage}
          </p>
          <div className="p-3 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-[11px] font-telemetry text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Data Integrity Invariant:</div>
            <div>The dashboard consumes domain data strictly via the FastAPI contract. Local mock fallback in the frontend is disabled to prevent unverified drift.</div>
          </div>
          <button
            type="button"
            onClick={loadInitialData}
            className="w-full cursor-pointer py-2.5 px-4 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </main>
    );
  }

  // Render Event Not Found (404) State
  if (notFoundEventId && !eventData) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl bg-[var(--card)] border border-amber-600/60 p-6 space-y-4 shadow-2xl text-center">
          <div className="text-3xl text-amber-400">🔍</div>
          <h2 className="text-base font-bold text-white">Event Not Found (404)</h2>
          <p className="text-xs text-slate-300">
            Event <code className="font-telemetry text-amber-300">{notFoundEventId}</code> was not found in the current scenario replay catalog.
          </p>
          <button
            type="button"
            onClick={() => setSelectedEventId(eventsList[0]?.event_id || "E001")}
            className="cursor-pointer py-2 px-4 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
          >
            Switch to First Available Event ({eventsList[0]?.event_id || "E001"})
          </button>
        </div>
      </main>
    );
  }

  const activeLoc = eventData?.location || {
    zone_id: "Z42",
    zone_name: "Velachery South",
    latitude: 12.9815,
    longitude: 80.2180,
    flood_area_type: "Depression Basin",
  };

  const timeline = eventData?.timeline || [];
  const activeTimelineStep = timeline.length > 0 ? timeline[Math.min(timelineStepIndex, timeline.length - 1)] : null;
  const currentTheme = priorityThemes[eventData?.priority] || priorityThemes.MEDIUM;

  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between p-3 sm:p-5 lg:p-7">
      <div className="max-w-7xl mx-auto w-full space-y-4">
        
        {/* Top Command Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[var(--border)] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-widest text-rose-400 uppercase font-telemetry">
                Flood Operations Command &amp; Mission Intelligence
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              HydroSurge AI — Incident Decision Support
            </h1>
            <p className="text-xs text-slate-400 font-telemetry mt-0.5">
              SECTOR: GREATER CHENNAI · BASIN: ADYAR (PILOT) · EPSG:4326 · TNSDMA / GCC GRID
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCapDrawerOpen(true)}
              className="cursor-pointer px-4 py-2 text-xs font-bold rounded-md bg-[var(--critical)] text-white hover:brightness-110 shadow-md shadow-rose-950/40 border border-rose-400/40 transition-all flex items-center gap-2 font-telemetry tracking-wide"
            >
              <span>🚨</span>
              <span>DISPATCH CAP / SACHET ALERT</span>
            </button>
          </div>
        </header>

        {/* Global Operational Status Strip */}
        <StatusStrip
          apiConnected={apiConnected}
          eventData={eventData}
          isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
        />

        {/* Focus Incident Selector Navigation (Loaded dynamically from GET /api/v1/events) */}
        <nav aria-label="Incident focus selector" className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
          <span className="text-[11px] font-bold text-slate-400 font-telemetry uppercase tracking-wider px-2">
            Target Focus:
          </span>
          {eventsList.map((ev) => {
            const isSelected = selectedEventId === ev.event_id;
            let priorityDot = "bg-slate-500";
            if (ev.priority === "CRITICAL") priorityDot = "bg-rose-500";
            else if (ev.priority === "HIGH") priorityDot = "bg-amber-500";
            else if (ev.priority === "MEDIUM") priorityDot = "bg-yellow-500";
            else if (ev.priority === "LOW") priorityDot = "bg-emerald-500";

            return (
              <button
                key={ev.event_id}
                type="button"
                onClick={() => setSelectedEventId(ev.event_id)}
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition-all active:scale-[0.98] flex items-center gap-2 ${
                  isSelected
                    ? "bg-sky-950/90 text-white border border-sky-400 shadow-md shadow-sky-950/40 font-semibold ring-1 ring-sky-500/40"
                    : "bg-[var(--card-elevated)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--card-hover)] hover:text-white"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${priorityDot}`}></span>
                <span className="font-telemetry font-bold text-sky-300">{ev.event_id}</span>
                <span className="text-slate-200">{ev.zone_name || ev.zone_id}</span>
                <span className="text-[10px] text-slate-400 font-telemetry">({ev.zone_id})</span>
              </button>
            );
          })}
          {eventLoading && (
            <span className="text-[11px] font-telemetry text-sky-400 animate-pulse ml-2">
              Syncing telemetry...
            </span>
          )}
        </nav>

        {/* Priority Command Alert Banner — Dataminr & Palantir AI Decision Architecture */}
        <section className={`rounded-xl p-4 sm:p-5 transition-all ${currentTheme.banner}`}>
          <div className="flex flex-col gap-4">
            
            {/* Top row: Alert Priority, Title, and Location */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-[var(--border)]/70">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold tracking-wider uppercase font-telemetry ${currentTheme.badge}`}>
                    {eventData?.priority}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 font-telemetry uppercase tracking-wider">
                    AI SITUATIONAL ASSESSMENT
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {currentTheme.headline}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-telemetry">
                  <span>Catchment: <strong className="text-white">{activeLoc.zone_name}</strong> ({activeLoc.zone_id})</span>
                  <span className="text-slate-500">|</span>
                  <span>Terrain: <strong className="text-sky-300">{activeLoc.flood_area_type}</strong></span>
                  <span className="text-slate-500">|</span>
                  <span>City: <strong className="text-white">{activeLoc.city || "Chennai"}</strong></span>
                </div>
              </div>

              {/* Recommended Response Protocol Checklist */}
              <div className="flex flex-col gap-1.5 lg:items-end">
                <span className="text-[10px] font-bold uppercase font-telemetry text-slate-400 tracking-wider">
                  Recommended Response Protocols
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(eventData?.actions || ["ALERT", "CLOSE_ROAD", "DEPLOY_TEAM"]).map((act) => (
                    <span
                      key={act}
                      className="px-2.5 py-1 rounded bg-[var(--canvas)] border border-[var(--border)] text-xs font-telemetry font-bold text-sky-300 flex items-center gap-1 shadow-sm"
                    >
                      <span className="text-emerald-400">✓</span>
                      <span>{act}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom row: Operational Telemetry Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs font-telemetry">
              <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)]">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Model Confidence</div>
                <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <span>{((eventData?.confidence ?? 0.8) * 100).toFixed(0)}%</span>
                  <span className="text-[10px] font-normal text-emerald-400">FUSED</span>
                </div>
              </div>

              <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)]">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Forecast Lead</div>
                <div className="text-base font-bold text-sky-300 mt-0.5">
                  {eventData?.rainfall?.lead_minutes || 60} min
                </div>
              </div>

              <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)]">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Exposed Census</div>
                <div className="text-base font-bold text-rose-400 mt-0.5">
                  {(eventData?.impact?.population_exposed || 0).toLocaleString()}
                </div>
              </div>

              <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)]">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Critical Assets</div>
                <div className="text-base font-bold text-amber-300 mt-0.5">
                  {eventData?.impact?.critical_assets || 0} Facilities
                </div>
              </div>

              <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)]">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Roadways At Risk</div>
                <div className="text-base font-bold text-rose-300 mt-0.5">
                  {eventData?.impact?.roads_affected || 0} Arterials
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Temporal Forecast Scrub Bar */}
        <TimelineBar
          timeline={timeline}
          activeStepIndex={timelineStepIndex}
          onStepChange={setTimelineStepIndex}
        />

        {/* Primary Interactive GIS Map */}
        <ZoneMap
          activeLocation={activeLoc}
          zones={riskTiles}
          onSelectZone={handleSelectZoneFromMap}
          activeTimelineStep={activeTimelineStep}
          isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
          responseRoute={eventData?.response_route}
          activeMode={activeMode}
        />

        {/* Operational Mode Navigation Tabs */}
        <div className="border-b border-[var(--border)] pt-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setActiveMode("hazard")}
              className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeMode === "hazard"
                  ? "border-sky-500 text-sky-400 bg-sky-950/20"
                  : "border-transparent text-[var(--text-secondary)] hover:text-slate-200"
              }`}
            >
              <span>🌧️</span>
              <span>Hazard Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("impact")}
              className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeMode === "impact"
                  ? "border-amber-500 text-amber-400 bg-amber-950/20"
                  : "border-transparent text-[var(--text-secondary)] hover:text-slate-200"
              }`}
            >
              <span>👥</span>
              <span>Impact &amp; What-If Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("response")}
              className={`cursor-pointer px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeMode === "response"
                  ? "border-rose-500 text-rose-400 bg-rose-950/20"
                  : "border-transparent text-[var(--text-secondary)] hover:text-slate-200"
              }`}
            >
              <span>🚨</span>
              <span>Response &amp; Routing Mode</span>
            </button>
          </div>
        </div>

        {/* Active Mode Panels */}
        <section className="pt-2">
          {activeMode === "hazard" && (
            <HazardMode
              eventData={eventData}
              activeTimelineStep={activeTimelineStep}
              isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
              onToggleRadarOutage={handleToggleRadarOutage}
            />
          )}

          {activeMode === "impact" && (
            <ImpactMode
              eventData={eventData}
            />
          )}

          {activeMode === "response" && (
            <ResponseMode
              eventData={eventData}
              availableEvents={eventsList}
              onSelectEvent={(id) => setSelectedEventId(id)}
              onOpenCapDrawer={() => setIsCapDrawerOpen(true)}
            />
          )}
        </section>

        {/* CAP / SACHET XML Drawer Modal */}
        <CapDrawer
          isOpen={isCapDrawerOpen}
          onClose={() => setIsCapDrawerOpen(false)}
          eventData={eventData}
          activeLocation={activeLoc}
        />

        {/* Operational Footer */}
        <footer className="pt-6 pb-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            HydroSurge AI Decision Support • Automated Inundation Modeling &amp; Early Warning System
          </p>
          <div className="flex items-center gap-3 font-telemetry">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]"></span>
            <span>OASIS CAP v1.2 &amp; FastAPI Contract Verified</span>
          </div>
        </footer>

      </div>
    </main>
  );
}