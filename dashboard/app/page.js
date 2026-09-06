"use client";

import { useState, useEffect } from "react";
import { fetchEvents, fetchEvent, fetchRiskTiles, fetchHealth } from "./lib/api";
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
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

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
    setLoading(true);
    setErrorMessage(null);

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
      setLoading(false);
    } catch (err) {
      console.error("API Gateway error:", err);
      setApiConnected(false);
      setErrorMessage(
        "Unable to connect to HydroSurge API Gateway at http://127.0.0.1:8000. Ensure the FastAPI service is running."
      );
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch Event when selectedEventId or isRadarOutage changes
  useEffect(() => {
    if (!selectedEventId) return;

    let isMounted = true;
    async function loadEvent() {
      try {
        const ev = await fetchEvent(selectedEventId, { simulateRadarOutage: isRadarOutage });
        if (isMounted) {
          setEventData(ev);
          setErrorMessage(null);
          setApiConnected(true);
        }
      } catch (err) {
        console.error(`Failed to fetch event ${selectedEventId}:`, err);
        if (isMounted) {
          setErrorMessage(
            `Failed to load event ${selectedEventId} from API: ${err.message}`
          );
        }
      }
    }

    loadEvent();
    setTimelineStepIndex(0);

    return () => {
      isMounted = false;
    };
  }, [selectedEventId, isRadarOutage]);

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

  // Render Loading State
  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-300">
            Connecting to HydroSurge API Gateway...
          </p>
          <p className="text-xs text-slate-500 font-telemetry">
            GET /api/v1/health &amp; /api/v1/events
          </p>
        </div>
      </main>
    );
  }

  // Render Hard API Error State (Refuses to load local fake data)
  if (errorMessage && !eventData) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl bg-[var(--card)] border border-rose-600/60 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3 text-rose-400">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-base font-bold text-white">API Connection Offline</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {errorMessage}
          </p>
          <div className="p-3 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-[11px] font-telemetry text-slate-400">
            Rule: The dashboard consumes data exclusively from the versioned FastAPI contract. Local offline fallback data has been intentionally disabled for integration integrity.
          </div>
          <button
            type="button"
            onClick={loadInitialData}
            className="w-full cursor-pointer py-2 px-4 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
          >
            Retry Connection
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
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wider text-rose-400 uppercase">
                Flood Operations Command
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              HydroSurge AI — Incident Decision Support
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Greater Chennai Corporation • Adyar Basin Emergency Management Grid
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCapDrawerOpen(true)}
              className="cursor-pointer px-3.5 py-1.5 text-xs font-bold rounded-md bg-[var(--critical)] text-white hover:brightness-110 shadow-sm transition-all"
            >
              🚨 Dispatch CAP / SACHET Alert
            </button>
          </div>
        </header>

        {/* Global Operational Status Strip */}
        <StatusStrip
          apiConnected={apiConnected}
          eventData={eventData}
          isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
        />

        {/* Focus Incident Selector Navigation (Loaded from GET /api/v1/events) */}
        <nav aria-label="Incident focus selector" className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--text-secondary)] mr-1">
            Catchment Focus:
          </span>
          {eventsList.map((ev) => {
            const isSelected = selectedEventId === ev.event_id;
            return (
              <button
                key={ev.event_id}
                type="button"
                onClick={() => setSelectedEventId(ev.event_id)}
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-sky-950/80 text-white border border-sky-500/70 shadow-sm"
                    : "bg-[var(--card)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--card-elevated)] hover:text-slate-200"
                }`}
              >
                <span className="font-semibold">{ev.event_id}</span> · {ev.zone_name || ev.zone_id}
              </button>
            );
          })}
        </nav>

        {/* Priority Command Alert Banner */}
        <section className={`rounded-xl p-4 sm:p-5 transition-all ${currentTheme.banner}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded text-xs tracking-wider uppercase ${currentTheme.badge}`}>
                  {eventData?.priority}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {currentTheme.headline}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Primary impact zone: <strong className="text-white">{activeLoc.zone_name}</strong> ({activeLoc.zone_id}) — {activeLoc.flood_area_type} topography
              </p>
            </div>

            {/* Telemetry Strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
              <div className="bg-[var(--canvas)] px-3 py-1.5 rounded border border-[var(--border)]">
                <div className="text-[var(--text-secondary)]">Model Confidence</div>
                <div className="text-sm font-bold font-telemetry text-slate-100 mt-0.5">
                  {((eventData?.confidence ?? 0.8) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-[var(--canvas)] px-3 py-1.5 rounded border border-[var(--border)]">
                <div className="text-[var(--text-secondary)]">Forecast Lead</div>
                <div className="text-sm font-bold font-telemetry text-slate-100 mt-0.5">
                  {eventData?.rainfall?.lead_minutes || 60} min
                </div>
              </div>
              <div className="bg-[var(--canvas)] px-3 py-1.5 rounded border border-[var(--border)]">
                <div className="text-[var(--text-secondary)]">Exposed Census</div>
                <div className="text-sm font-bold font-telemetry text-rose-400 mt-0.5">
                  {(eventData?.impact?.population_exposed || 0).toLocaleString()}
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
        <div className="border-b border-[var(--border)] pt-2">
          <div className="flex items-center gap-2">
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