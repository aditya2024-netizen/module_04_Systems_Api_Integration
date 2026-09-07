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

// Enterprise App Shell Components & Dedicated Views
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import RainfallView from "./components/views/RainfallView";
import InundationView from "./components/views/InundationView";
import ImpactView from "./components/views/ImpactView";
import AlertsView from "./components/views/AlertsView";
import DataSourcesView from "./components/views/DataSourcesView";
import SystemHealthView from "./components/views/SystemHealthView";
import ReplayView from "./components/views/ReplayView";

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

  // Operational Navigation Section: "overview" | "rainfall" | "inundation" | "impact" | "alerts" | "datasources" | "health" | "replay"
  const [activeNav, setActiveNav] = useState("overview");

  // Overview Sub-Modes: "hazard" | "impact" | "response"
  const [overviewSubMode, setOverviewSubMode] = useState("hazard");

  // Interactive Timeline State
  const [timelineStepIndex, setTimelineStepIndex] = useState(0);

  // Radar Outage Simulation State
  const [isRadarOutage, setIsRadarOutage] = useState(false);

  // Collapsible Navigation Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      banner: "bg-[var(--card)] border border-rose-300 shadow-sm shadow-rose-500/5",
      badge: "bg-[var(--critical)] text-white font-bold",
      indicator: "bg-rose-600",
      headline: "Emergency Inundation Warning — Evacuation Advisory Active",
    },
    HIGH: {
      banner: "bg-[var(--card)] border border-amber-300 shadow-sm shadow-amber-500/5",
      badge: "bg-[var(--warning)] text-white font-bold",
      indicator: "bg-amber-600",
      headline: "High Inundation Risk — Preparedness and Silt Clearance Active",
    },
    MEDIUM: {
      banner: "bg-[var(--card)] border border-yellow-300 shadow-2xs",
      badge: "bg-yellow-600 text-white font-bold",
      indicator: "bg-yellow-600",
      headline: "Moderate Waterlogging Advisory — Drainage Telemetry Active",
    },
    LOW: {
      banner: "bg-[var(--card)] border border-emerald-300 shadow-2xs",
      badge: "bg-[var(--safe)] text-white font-bold",
      indicator: "bg-emerald-600",
      headline: "Nominal Conditions — Routine Drainage Telemetry",
    },
  };

  // Render Initial Loading Skeleton
  if (initialLoading) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="h-10 w-10 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Connecting to HydroSurge API Gateway</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Synchronizing with versioned FastAPI endpoints (health, events, spatial risk)...
            </p>
          </div>
          <div className="p-2.5 rounded bg-[var(--card)] border border-[var(--border)] text-[11px] font-telemetry text-[var(--text-muted)]">
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
        <div className="max-w-md w-full rounded-xl bg-[var(--card)] border border-rose-300 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 text-rose-600">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-base font-bold text-[var(--text-primary)]">API Gateway Unavailable</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {errorMessage}
          </p>
          <div className="p-3 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-[11px] font-telemetry text-[var(--text-secondary)] space-y-1">
            <div className="font-semibold text-[var(--text-primary)]">Data Integrity Invariant:</div>
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
        <div className="max-w-md w-full rounded-xl bg-[var(--card)] border border-amber-300 p-6 space-y-4 shadow-xl text-center">
          <div className="text-3xl text-amber-500">🔍</div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Event Not Found (404)</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Event <code className="font-telemetry text-amber-700 font-semibold">{notFoundEventId}</code> was not found in the current scenario replay catalog.
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

  // Active Alert Count
  const criticalCount = eventsList.filter((e) => e.priority === "CRITICAL" || e.priority === "HIGH").length;

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-row">
      {/* 1. Left Operational Navigation Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        alertCount={criticalCount}
        apiConnected={apiConnected}
        dataSource={eventData?.data_source || "PRECOMPUTED_REPLAY"}
      />

      {/* 2. Main Operational Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Enterprise Application Toolbar */}
        <TopNav
          eventsList={eventsList}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          eventData={eventData}
          isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
          onToggleRadarOutage={handleToggleRadarOutage}
          onOpenCapDrawer={() => setIsCapDrawerOpen(true)}
          apiConnected={apiConnected}
          onRefresh={loadInitialData}
        />

        {/* Dynamic Operational Content Area */}
        <main className="p-3 sm:p-5 lg:p-6 flex-1 space-y-4 max-w-7xl w-full mx-auto">
          
          {/* VIEW 1: COMMAND CENTER (OVERVIEW) */}
          {activeNav === "overview" && (
            <div className="space-y-4">
              {/* Global Operational Status Strip */}
              <StatusStrip
                apiConnected={apiConnected}
                eventData={eventData}
                isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
              />

              {/* Priority Command Alert Banner */}
              <section className={`rounded-xl p-4 sm:p-5 transition-all ${currentTheme.banner}`}>
                <div className="flex flex-col gap-4">
                  {/* Top row: Alert Priority, Title, and Location */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-[var(--border)]">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold tracking-wider uppercase font-telemetry ${currentTheme.badge}`}>
                          {eventData?.priority}
                        </span>
                        <span className="text-[11px] font-bold text-[var(--text-muted)] font-telemetry uppercase tracking-wider">
                          SITUATIONAL ASSESSMENT &middot; {eventData?.event_id}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                        {currentTheme.headline}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)] font-telemetry">
                        <span>Catchment: <strong className="text-[var(--text-primary)]">{activeLoc.zone_name}</strong> ({activeLoc.zone_id})</span>
                        <span className="text-slate-300">|</span>
                        <span>Terrain: <strong className="text-sky-700">{activeLoc.flood_area_type}</strong></span>
                        <span className="text-slate-300">|</span>
                        <span>City: <strong className="text-[var(--text-primary)]">{activeLoc.city || "Chennai"}</strong></span>
                      </div>
                    </div>

                    {/* Recommended Response Protocol Checklist */}
                    <div className="flex flex-col gap-1.5 lg:items-end">
                      <span className="text-[10px] font-bold uppercase font-telemetry text-[var(--text-muted)] tracking-wider">
                        Recommended Response Protocols
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(eventData?.actions || ["ALERT", "CLOSE_ROAD", "DEPLOY_TEAM"]).map((act) => (
                          <span
                            key={act}
                            className="px-2.5 py-1 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-xs font-telemetry font-bold text-sky-800 flex items-center gap-1 shadow-xs"
                          >
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{act}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: Operational Telemetry Gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs font-telemetry">
                    <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-2xs">
                      <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Model Confidence</div>
                      <div className="text-base font-bold text-[var(--text-primary)] mt-0.5 flex items-center gap-1.5">
                        <span>{((eventData?.confidence ?? 0.8) * 100).toFixed(0)}%</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">FUSED</span>
                      </div>
                    </div>

                    <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-2xs">
                      <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Forecast Lead</div>
                      <div className="text-base font-bold text-sky-700 mt-0.5">
                        {eventData?.rainfall?.lead_minutes || 60} min
                      </div>
                    </div>

                    <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-2xs">
                      <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Exposed Census</div>
                      <div className="text-base font-bold text-rose-600 mt-0.5">
                        {(eventData?.impact?.population_exposed || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-2xs">
                      <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Critical Assets</div>
                      <div className="text-base font-bold text-amber-700 mt-0.5">
                        {eventData?.impact?.critical_assets || 0} Facilities
                      </div>
                    </div>

                    <div className="bg-[var(--canvas)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-2xs">
                      <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Roadways At Risk</div>
                      <div className="text-base font-bold text-rose-600 mt-0.5">
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

              {/* Primary Interactive GIS Map Hero */}
              <ZoneMap
                activeLocation={activeLoc}
                zones={riskTiles}
                onSelectZone={handleSelectZoneFromMap}
                activeTimelineStep={activeTimelineStep}
                isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
                responseRoute={eventData?.response_route}
                activeMode={overviewSubMode}
                eventData={eventData}
              />

              {/* Operational Sub-Mode Navigation Tabs */}
              <div className="border-b border-[var(--border)] pt-2 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  <button
                    type="button"
                    onClick={() => setOverviewSubMode("hazard")}
                    className={`cursor-pointer px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                      overviewSubMode === "hazard"
                        ? "border-sky-600 text-sky-700 bg-sky-50 font-bold"
                        : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100/70"
                    }`}
                  >
                    <span>🌧️</span>
                    <span>Hazard Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOverviewSubMode("impact")}
                    className={`cursor-pointer px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                      overviewSubMode === "impact"
                        ? "border-amber-600 text-amber-700 bg-amber-50 font-bold"
                        : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100/70"
                    }`}
                  >
                    <span>👥</span>
                    <span>Impact &amp; What-If Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOverviewSubMode("response")}
                    className={`cursor-pointer px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                      overviewSubMode === "response"
                        ? "border-rose-600 text-rose-700 bg-rose-50 font-bold"
                        : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100/70"
                    }`}
                  >
                    <span>🚨</span>
                    <span>Response &amp; Routing Mode</span>
                  </button>
                </div>
              </div>

              {/* Active Sub-Mode Panel */}
              <section className="pt-2">
                {overviewSubMode === "hazard" && (
                  <HazardMode
                    eventData={eventData}
                    activeTimelineStep={activeTimelineStep}
                    isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
                    onToggleRadarOutage={handleToggleRadarOutage}
                  />
                )}

                {overviewSubMode === "impact" && (
                  <ImpactMode eventData={eventData} />
                )}

                {overviewSubMode === "response" && (
                  <ResponseMode
                    eventData={eventData}
                    availableEvents={eventsList}
                    onSelectEvent={(id) => setSelectedEventId(id)}
                    onOpenCapDrawer={() => setIsCapDrawerOpen(true)}
                  />
                )}
              </section>
            </div>
          )}

          {/* VIEW 2: DEDICATED RAINFALL FORECAST */}
          {activeNav === "rainfall" && (
            <RainfallView
              eventData={eventData}
              activeTimelineStep={activeTimelineStep}
              isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
              onToggleRadarOutage={handleToggleRadarOutage}
            />
          )}

          {/* VIEW 3: DEDICATED INUNDATION RISK */}
          {activeNav === "inundation" && (
            <InundationView
              eventData={eventData}
              activeTimelineStep={activeTimelineStep}
              isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
            />
          )}

          {/* VIEW 4: DEDICATED IMPACT & WHAT-IF */}
          {activeNav === "impact" && (
            <ImpactView eventData={eventData} />
          )}

          {/* VIEW 5: DEDICATED ACTION & ALERTS */}
          {activeNav === "alerts" && (
            <AlertsView
              eventData={eventData}
              availableEvents={eventsList}
              onSelectEvent={setSelectedEventId}
              onOpenCapDrawer={() => setIsCapDrawerOpen(true)}
            />
          )}

          {/* VIEW 6: DEDICATED DATA SOURCES */}
          {activeNav === "datasources" && (
            <DataSourcesView
              isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
              onToggleRadarOutage={handleToggleRadarOutage}
              eventData={eventData}
            />
          )}

          {/* VIEW 7: DEDICATED SYSTEM HEALTH */}
          {activeNav === "health" && (
            <SystemHealthView apiConnected={apiConnected} />
          )}

          {/* VIEW 8: DEDICATED HISTORICAL REPLAY */}
          {activeNav === "replay" && (
            <ReplayView
              eventData={eventData}
              eventsList={eventsList}
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
              timelineStepIndex={timelineStepIndex}
              onTimelineStepChange={setTimelineStepIndex}
            />
          )}

          {/* Global CAP / SACHET XML Modal Drawer */}
          <CapDrawer
            isOpen={isCapDrawerOpen}
            onClose={() => setIsCapDrawerOpen(false)}
            eventData={eventData}
            activeLocation={activeLoc}
          />

          {/* Enterprise Operational Footer */}
          <footer className="pt-6 pb-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row items-center justify-between gap-3 font-telemetry">
            <p>
              HydroSurge AI Decision Support &bull; Automated Inundation Modeling &amp; Early Warning System (SIH PS 26071)
            </p>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]"></span>
              <span>FastAPI Gateway Contract &bull; OASIS CAP v1.2 / SACHET Compliant</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}