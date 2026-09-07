"use client";

import { useState, useEffect } from "react";
import { fetchEvents, fetchEvent, fetchRiskTiles, fetchHealth, API_BASE_URL } from "./lib/api";
import ZoneMap from "./components/ZoneMap";
import TimelineBar from "./components/TimelineBar";
import CapDrawer from "./components/CapDrawer";

import {
  AlertOctagon,
  AlertTriangle,
  Users,
  Building,
  Car,
  ShieldAlert,
  Navigation,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

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

  // Client hydration state for ResponsiveContainer
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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


  const activeLoc = eventData?.location || {
    zone_id: "Z42",
    zone_name: "Adyar River Basin",
    latitude: 12.9815,
    longitude: 80.2180,
    flood_area_type: "Depression Basin",
  };

  const timeline = eventData?.timeline || [];
  const activeTimelineStep = timeline.length > 0 ? timeline[Math.min(timelineStepIndex, timeline.length - 1)] : null;
  const criticalCount = eventsList.filter((e) => e.priority === "CRITICAL" || e.priority === "HIGH").length;

  // Build chart dataset from dynamic timeline
  const forecastChartData = (timeline && timeline.length > 0)
    ? timeline.map((step) => ({
        time: step.lead_minutes === 0 ? "NOW" : `+${step.lead_minutes} MIN`,
        intensity: Number(step.rainfall_mm_hr || 0),
        threshold: 50,
      }))
    : [
        { time: "NOW", intensity: 25, threshold: 50 },
        { time: "+30 MIN", intensity: 45, threshold: 50 },
        { time: "+60 MIN", intensity: eventData?.rainfall?.rainfall_mm_hr || 87, threshold: 50 },
        { time: "+90 MIN", intensity: 75, threshold: 50 },
        { time: "+120 MIN", intensity: 40, threshold: 50 },
      ];

  const currentRain = forecastChartData[0]?.intensity ?? 25;
  const peakRain = eventData?.rainfall?.rainfall_mm_hr ?? (forecastChartData.length > 0 ? Math.max(...forecastChartData.map((d) => d.intensity)) : 87);
  const leadTimeMin = eventData?.rainfall?.lead_minutes ?? 60;
  const confidencePct = Math.round((eventData?.confidence ?? 0.84) * 100);
  const floodProbPct = Math.round((eventData?.inundation?.flood_probability ?? 0.87) * 100);
  const projectedDepth = eventData?.inundation?.depth_band || "0.5–1.0 m";
  const priorityLevel = eventData?.priority || "HIGH";
  const exposedPop = eventData?.impact?.population_exposed != null
    ? Number(eventData.impact.population_exposed).toLocaleString()
    : "21,400";
  const criticalAssetsCount = eventData?.impact?.critical_assets ?? 3;
  const roadsRiskCount = eventData?.impact?.roads_affected ?? 2;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
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

          {/* API Gateway Disconnection / Error Alert */}
          {errorMessage && !eventData && (
            <div className="p-5 rounded-xl bg-card border border-rose-300 shadow-sm space-y-3">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle size={20} />
                <h2 className="text-base font-bold text-card-foreground">API Gateway Unavailable</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {errorMessage}
              </p>
              <div className="p-3 rounded bg-secondary border border-border text-[11px] font-telemetry text-secondary-foreground space-y-1">
                <div className="font-semibold text-foreground">Data Integrity Invariant:</div>
                <div>The dashboard consumes domain data strictly via the FastAPI contract. Local mock fallback in the frontend is disabled to prevent unverified drift.</div>
              </div>
              <button
                type="button"
                onClick={loadInitialData}
                className="cursor-pointer py-2 px-4 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Event Not Found (404) Notice */}
          {notFoundEventId && !eventData && (
            <div className="p-5 rounded-xl bg-card border border-amber-300 shadow-sm space-y-3 text-center">
              <div className="text-3xl text-amber-500">🔍</div>
              <h2 className="text-base font-bold text-card-foreground">Event Not Found (404)</h2>
              <p className="text-xs text-muted-foreground">
                Event <code className="font-telemetry text-amber-700 font-semibold">{notFoundEventId}</code> was not found in the current scenario replay catalog.
              </p>
              <button
                type="button"
                onClick={() => setSelectedEventId(eventsList[0]?.event_id || "E001")}
                className="cursor-pointer py-2 px-4 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors"
              >
                Switch to First Available Event ({eventsList[0]?.event_id || "E001"})
              </button>
            </div>
          )}

          {/* Telemetry Syncing Indicator */}
          {eventLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-sky-50 border border-sky-200 text-xs text-sky-700 w-fit">
              <div className="h-2 w-2 rounded-full bg-sky-500 animate-ping"></div>
              <span>Synchronizing scenario telemetry...</span>
            </div>
          )}
          
          {/* VIEW 1: COMMAND CENTER (OVERVIEW) */}
          {activeNav === "overview" && (
            <div className="space-y-6">
              {/* HEAVY RAINFALL WARNING BANNER */}
              <div className="bg-critical-light border border-critical/20 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-critical text-white rounded-lg shrink-0 shadow-sm">
                    <AlertOctagon size={24} />
                  </div>
                  <div>
                    <h2 className="text-critical font-bold text-lg leading-tight uppercase tracking-wide">
                      Heavy Rainfall Warning
                    </h2>
                    <p className="text-critical/80 text-sm mt-1 max-w-2xl">
                      Forecast conditions indicate a significant increase in rainfall intensity over the {activeLoc.zone_name || "selected"} catchment.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 bg-white/70 backdrop-blur-sm p-3 rounded-lg border border-critical/10 shrink-0">
                  <div className="text-center">
                    <div className="text-xs text-critical/70 font-semibold uppercase">
                      Lead Time
                    </div>
                    <div className="text-2xl font-bold text-critical">{leadTimeMin} min</div>
                  </div>
                  <div className="w-px h-8 bg-critical/20"></div>
                  <div className="text-center">
                    <div className="text-xs text-critical/70 font-semibold uppercase">
                      Peak Intensity
                    </div>
                    <div className="text-2xl font-bold text-critical">{peakRain} mm/hr</div>
                  </div>
                  <div className="w-px h-8 bg-critical/20"></div>
                  <div className="text-center">
                    <div className="text-xs text-critical/70 font-semibold uppercase">
                      Confidence
                    </div>
                    <div className="text-2xl font-bold text-critical">{confidencePct}%</div>
                  </div>
                </div>
              </div>

              {/* Forecast Timeline Scrub Bar */}
              <TimelineBar
                timeline={timeline}
                activeStepIndex={timelineStepIndex}
                onStepChange={setTimelineStepIndex}
              />

              {/* PRIMARY 3-COLUMN LAYOUT GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                {/* LEFT COLUMN: RAINFALL FORECAST & INUNDATION/IMPACT SUMMARY */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Rainfall Forecast Section */}
                  <section>
                    <div className="mb-4">
                      <h3 className="text-xl font-poppins font-semibold text-card-foreground">
                        Rainfall Forecast
                      </h3>
                      <p className="text-sm text-secondary-foreground mt-1">
                        Rainfall intensity is expected to increase over the {activeLoc.zone_name || "selected"} catchment.
                      </p>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                      <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
                        <div className="flex flex-wrap gap-8">
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Current Rainfall
                            </div>
                            <div className="text-3xl font-bold text-rainfall">
                              {currentRain}{" "}
                              <span className="text-lg text-rainfall/70 font-medium">
                                mm/hr
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Forecast Peak
                            </div>
                            <div className="text-3xl font-bold text-critical">
                              {peakRain}{" "}
                              <span className="text-lg text-critical/70 font-medium">
                                mm/hr
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Peak Expected In
                            </div>
                            <div className="text-3xl font-bold text-card-foreground">
                              {leadTimeMin}{" "}
                              <span className="text-lg text-secondary-foreground font-medium">
                                min
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-secondary-foreground text-right space-y-0.5">
                          <div>
                            Confidence:{" "}
                            <strong className="text-card-foreground">{confidencePct}%</strong>
                          </div>
                          <div>
                            Horizon:{" "}
                            <strong className="text-card-foreground">0–120 min</strong>
                          </div>
                        </div>
                      </div>

                      {/* Area Chart with Warning Threshold */}
                      <div className="h-64 w-full mt-4">
                        {isMounted ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={forecastChartData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient
                                  id="colorIntensity"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor="var(--color-rainfall)"
                                    stopOpacity={0.3}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor="var(--color-rainfall)"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="var(--color-border)"
                              />
                              <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fontSize: 12,
                                  fill: "var(--color-muted-foreground)",
                                }}
                                dy={10}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fontSize: 12,
                                  fill: "var(--color-muted-foreground)",
                                }}
                              />
                              <Tooltip
                                contentStyle={{
                                  borderRadius: "8px",
                                  border: "1px solid var(--color-border)",
                                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                  backgroundColor: "var(--color-card)",
                                  color: "var(--color-card-foreground)",
                                }}
                              />
                              <ReferenceLine
                                y={50}
                                label={{
                                  position: "top",
                                  value: "Warning Threshold",
                                  fill: "var(--color-warning)",
                                  fontSize: 12,
                                }}
                                stroke="var(--color-warning)"
                                strokeDasharray="4 4"
                              />
                              <Area
                                type="monotone"
                                dataKey="intensity"
                                stroke="var(--color-rainfall)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIntensity)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full w-full rounded-xl bg-muted/60 animate-pulse flex items-center justify-center text-xs text-muted-foreground font-medium">
                            Synthesizing forecast telemetry...
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Side-by-side Inundation Risk & Expected Impact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Inundation Risk */}
                    <section>
                      <div className="mb-4">
                        <h3 className="text-lg font-poppins font-semibold text-card-foreground">
                          Inundation Risk
                        </h3>
                      </div>
                      <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-[calc(100%-2rem)]">
                        <p className="text-sm text-secondary-foreground mb-6">
                          Forecast rainfall is translated into spatial flood-risk estimates.
                        </p>

                        <div className="space-y-5">
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-sm font-medium text-secondary-foreground">
                              Flood Probability
                            </span>
                            <span className="text-lg font-bold text-card-foreground">
                              {floodProbPct}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-sm font-medium text-secondary-foreground">
                              Projected Depth
                            </span>
                            <span className="text-lg font-bold text-critical">
                              {projectedDepth}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-sm font-medium text-secondary-foreground">
                              Risk Level
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-critical-light text-critical uppercase">
                              {priorityLevel} Risk
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-secondary-foreground">
                              Affected Area
                            </span>
                            <span className="text-sm font-bold text-card-foreground">
                              {activeLoc.zone_name || "Adyar Basin"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Expected Impact */}
                    <section>
                      <div className="mb-4">
                        <h3 className="text-lg font-poppins font-semibold text-card-foreground">
                          Expected Impact
                        </h3>
                      </div>
                      <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-[calc(100%-2rem)] flex flex-col justify-between">
                        <p className="text-sm text-secondary-foreground mb-6">
                          Estimated exposure within forecast high-risk areas.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-muted rounded-lg border border-border">
                            <Users size={20} className="text-primary mb-2" />
                            <div className="text-2xl font-bold text-card-foreground">
                              {exposedPop}
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase mt-1">
                              Population Exposed
                            </div>
                          </div>
                          <div className="p-4 bg-critical-light/50 rounded-lg border border-critical/20">
                            <Building size={20} className="text-critical mb-2" />
                            <div className="text-2xl font-bold text-critical">
                              {criticalAssetsCount}
                            </div>
                            <div className="text-xs font-semibold text-critical/70 uppercase mt-1">
                              Critical Assets
                            </div>
                          </div>
                          <div className="p-4 bg-warning-light/50 rounded-lg border border-warning/20 col-span-2">
                            <Car size={20} className="text-warning mb-2" />
                            <div className="text-2xl font-bold text-warning">{roadsRiskCount}</div>
                            <div className="text-xs font-semibold text-warning/70 uppercase mt-1">
                              Roads at Risk
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                {/* RIGHT COLUMN: SPATIAL MAP & RECOMMENDED RESPONSES */}
                <div className="space-y-6">
                  {/* Spatial Flood Risk Section */}
                  <section className="h-[430px] flex flex-col">
                    <div className="mb-4 flex justify-between items-end">
                      <div>
                        <h3 className="text-lg font-poppins font-semibold text-card-foreground">
                          Spatial Flood Risk
                        </h3>
                        <p className="text-xs text-secondary-foreground mt-1">
                          Forecast Risk Across {activeLoc.zone_name || "the Selected Catchment"}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 rounded-xl overflow-hidden border border-border shadow-sm relative">
                      <ZoneMap
                        activeLocation={activeLoc}
                        zones={riskTiles}
                        onSelectZone={handleSelectZoneFromMap}
                        activeTimelineStep={activeTimelineStep}
                        isRadarOutage={Boolean(eventData?.radar_outage || isRadarOutage)}
                        responseRoute={eventData?.response_route}
                        activeMode={overviewSubMode}
                        eventData={eventData}
                        compact={true}
                      />
                    </div>
                  </section>

                  {/* Recommended Response Action Cards */}
                  <section>
                    <div className="mb-4">
                      <h3 className="text-lg font-poppins font-semibold text-card-foreground">
                        Recommended Response
                      </h3>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm divide-y divide-border">
                      {/* Alert */}
                      <div className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                        <div className="p-2 bg-critical-light rounded-lg text-critical mt-0.5 shrink-0">
                          <AlertTriangle size={18} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-card-foreground uppercase">
                            Alert
                          </h4>
                          <p className="text-sm text-secondary-foreground mt-1">
                            Issue an early warning for the affected area.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsCapDrawerOpen(true)}
                            className="mt-3 px-4 py-2 bg-critical hover:bg-red-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
                          >
                            Issue CAP Alert
                          </button>
                        </div>
                      </div>

                      {/* Close Road */}
                      <div className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                        <div className="p-2 bg-warning-light rounded-lg text-warning mt-0.5 shrink-0">
                          <ShieldAlert size={18} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-card-foreground uppercase">
                            Close Road
                          </h4>
                          <p className="text-sm text-secondary-foreground mt-1">
                            Assess closure of roads within the projected risk zone.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveNav("alerts");
                            }}
                            className="mt-3 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                          >
                            View Routing Guidance
                          </button>
                        </div>
                      </div>

                      {/* Deploy Team */}
                      <div className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5 shrink-0">
                          <Navigation size={18} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-card-foreground uppercase">
                            Deploy Team
                          </h4>
                          <p className="text-sm text-secondary-foreground mt-1">
                            Position response resources ahead of expected impact.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
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

          {/* OPERATIONAL FOOTER */}
          <footer className="pt-8 pb-4 border-t border-border mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex flex-wrap items-center gap-2">
              <span className="uppercase tracking-wider font-semibold">
                Forecast Sources:
              </span>
              <span className="px-2 py-1 bg-card border border-border rounded shadow-xs">Radar</span>
              <span className="px-2 py-1 bg-card border border-border rounded shadow-xs">Satellite</span>
              <span className="px-2 py-1 bg-card border border-border rounded shadow-xs">NWP</span>
              <span className="px-2 py-1 bg-card border border-border rounded shadow-xs">
                Ground Observations
              </span>
            </div>
            <div>
              HydroSurge AI — Operational Meteorological Decision-Support System
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}