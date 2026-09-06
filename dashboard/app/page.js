"use client";

import { useState, useEffect } from "react";
import { SAMPLE_EVENTS, ZONE_COORDINATES, INCIDENTS } from "./data/fallback";
import ZoneMap from "./components/ZoneMap";
import StatusStrip from "./components/StatusStrip";
import TimelineBar from "./components/TimelineBar";
import HazardMode from "./components/HazardMode";
import ImpactMode from "./components/ImpactMode";
import ResponseMode from "./components/ResponseMode";
import CapDrawer from "./components/CapDrawer";

const FALLBACK_PAYLOADS = {
  E001: {
    event_id: "E001",
    location: { zone_id: "Z42" },
    rainfall: {
      event_id: "E001",
      zone_id: "Z42",
      valid_time: "2026-09-06T09:00:00Z",
      lead_minutes: 60,
      rainfall_mm_hr: 87.0,
      rainfall_accumulation_mm: 124.0,
      confidence: 0.84,
      prediction_uri: "mock://rainfall/E001",
      source: "mock",
      status: "PROTOTYPE",
    },
    inundation: {
      event_id: "E001",
      zone_id: "Z42",
      flood_probability: 0.87,
      depth_band: "0.5-1.0m",
      risk_uri: "mock://inundation/E001",
      confidence: 0.81,
      valid_time: "2026-09-06T09:00:00Z",
      source: "mock",
      status: "PROTOTYPE",
    },
    confidence: 0.81,
    impact: { population_exposed: 21400, critical_assets: 3, roads_affected: 2 },
    priority: "CRITICAL",
    actions: ["ALERT", "CLOSE_ROAD", "DEPLOY_TEAM"],
    data_source: "PRECOMPUTED_REPLAY",
    status: "PROTOTYPE",
    timeline: [
      { step_label: "T+00", lead_minutes: 0, rainfall_mm_hr: 38.0, depth_band: "<0.1m", flood_probability: 0.22 },
      { step_label: "T+15", lead_minutes: 15, rainfall_mm_hr: 62.0, depth_band: "0.1-0.3m", flood_probability: 0.45 },
      { step_label: "T+30", lead_minutes: 30, rainfall_mm_hr: 87.0, depth_band: "0.3-0.5m", flood_probability: 0.72 },
      { step_label: "T+45", lead_minutes: 45, rainfall_mm_hr: 105.0, depth_band: "0.5-1.0m", flood_probability: 0.87 },
      { step_label: "T+60", lead_minutes: 60, rainfall_mm_hr: 87.0, depth_band: "0.5-1.0m", flood_probability: 0.84 },
    ]
  },
  E002: {
    event_id: "E002",
    location: { zone_id: "Z18" },
    rainfall: {
      event_id: "E002",
      zone_id: "Z18",
      valid_time: "2026-09-06T09:00:00Z",
      lead_minutes: 60,
      rainfall_mm_hr: 65.0,
      rainfall_accumulation_mm: 88.0,
      confidence: 0.82,
      prediction_uri: "mock://rainfall/E002",
      source: "mock",
      status: "PROTOTYPE",
    },
    inundation: {
      event_id: "E002",
      zone_id: "Z18",
      flood_probability: 0.76,
      depth_band: "0.3-0.5m",
      risk_uri: "mock://inundation/E002",
      confidence: 0.79,
      valid_time: "2026-09-06T09:00:00Z",
      source: "mock",
      status: "PROTOTYPE",
    },
    confidence: 0.79,
    impact: { population_exposed: 14200, critical_assets: 2, roads_affected: 3 },
    priority: "HIGH",
    actions: ["ALERT", "PREPOSITION_PUMPS", "MONITOR_CULVERTS"],
    data_source: "PRECOMPUTED_REPLAY",
    status: "PROTOTYPE",
    timeline: [
      { step_label: "T+00", lead_minutes: 0, rainfall_mm_hr: 30.0, depth_band: "<0.1m", flood_probability: 0.20 },
      { step_label: "T+20", lead_minutes: 20, rainfall_mm_hr: 48.0, depth_band: "0.1-0.3m", flood_probability: 0.40 },
      { step_label: "T+40", lead_minutes: 40, rainfall_mm_hr: 65.0, depth_band: "0.3-0.5m", flood_probability: 0.65 },
      { step_label: "T+60", lead_minutes: 60, rainfall_mm_hr: 65.0, depth_band: "0.3-0.5m", flood_probability: 0.76 },
    ]
  },
  E003: {
    event_id: "E003",
    location: { zone_id: "Z07" },
    rainfall: {
      event_id: "E003",
      zone_id: "Z07",
      valid_time: "2026-09-06T09:00:00Z",
      lead_minutes: 45,
      rainfall_mm_hr: 52.0,
      rainfall_accumulation_mm: 64.0,
      confidence: 0.80,
      prediction_uri: "mock://rainfall/E003",
      source: "mock",
      status: "PROTOTYPE",
    },
    inundation: {
      event_id: "E003",
      zone_id: "Z07",
      flood_probability: 0.62,
      depth_band: "0.1-0.3m",
      risk_uri: "mock://inundation/E003",
      confidence: 0.75,
      valid_time: "2026-09-06T09:00:00Z",
      source: "mock",
      status: "PROTOTYPE",
    },
    confidence: 0.75,
    impact: { population_exposed: 35000, critical_assets: 5, roads_affected: 4 },
    priority: "HIGH",
    actions: ["TRAFFIC_DIVERSION", "CLEAR_STORM_DRAINS"],
    data_source: "PRECOMPUTED_REPLAY",
    status: "PROTOTYPE",
  },
  E004: {
    event_id: "E004",
    location: { zone_id: "Z29" },
    rainfall: {
      event_id: "E004",
      zone_id: "Z29",
      valid_time: "2026-09-06T09:00:00Z",
      lead_minutes: 90,
      rainfall_mm_hr: 38.0,
      rainfall_accumulation_mm: 45.0,
      confidence: 0.78,
      prediction_uri: "mock://rainfall/E004",
      source: "mock",
      status: "PROTOTYPE",
    },
    inundation: {
      event_id: "E004",
      zone_id: "Z29",
      flood_probability: 0.44,
      depth_band: "<0.1m",
      risk_uri: "mock://inundation/E004",
      confidence: 0.73,
      valid_time: "2026-09-06T09:00:00Z",
      source: "mock",
      status: "PROTOTYPE",
    },
    confidence: 0.73,
    impact: { population_exposed: 8500, critical_assets: 1, roads_affected: 1 },
    priority: "MEDIUM",
    actions: ["ADVISORY_ISSUED", "MONITOR_GAUGES"],
    data_source: "PRECOMPUTED_REPLAY",
    status: "PROTOTYPE",
  },
  E005: {
    event_id: "E005",
    location: { zone_id: "Z12" },
    rainfall: {
      event_id: "E005",
      zone_id: "Z12",
      valid_time: "2026-09-06T09:00:00Z",
      lead_minutes: 120,
      rainfall_mm_hr: 22.0,
      rainfall_accumulation_mm: 28.0,
      confidence: 0.86,
      prediction_uri: "mock://rainfall/E005",
      source: "mock",
      status: "PROTOTYPE",
    },
    inundation: {
      event_id: "E005",
      zone_id: "Z12",
      flood_probability: 0.18,
      depth_band: "<0.1m",
      risk_uri: "mock://inundation/E005",
      confidence: 0.80,
      valid_time: "2026-09-06T09:00:00Z",
      source: "mock",
      status: "PROTOTYPE",
    },
    confidence: 0.80,
    impact: { population_exposed: 3200, critical_assets: 0, roads_affected: 0 },
    priority: "LOW",
    actions: ["ROUTINE_MONITORING"],
    data_source: "PRECOMPUTED_REPLAY",
    status: "PROTOTYPE",
  },
};

export default function DashboardPage() {
  const [selectedEventId, setSelectedEventId] = useState("E001");
  const [eventData, setEventData] = useState(FALLBACK_PAYLOADS.E001);
  const [apiConnected, setApiConnected] = useState(false);
  
  // Dashboard Modes: "hazard" | "impact" | "response"
  const [activeMode, setActiveMode] = useState("hazard");
  
  // Interactive Timeline State
  const [timelineStepIndex, setTimelineStepIndex] = useState(0);

  // Radar Outage Simulation
  const [isRadarOutage, setIsRadarOutage] = useState(false);

  // Active Incident for Response Routing
  const [selectedIncidentId, setSelectedIncidentId] = useState("INC-01");

  // CAP Alert Modal Drawer State
  const [isCapDrawerOpen, setIsCapDrawerOpen] = useState(false);

  // Fetch Event from FastAPI Single Source of Truth
  useEffect(() => {
    async function loadData() {
      try {
        const healthRes = await fetch("http://127.0.0.1:8000/api/v1/health", { cache: "no-store" });
        if (healthRes.ok) {
          setApiConnected(true);
        } else {
          setApiConnected(false);
        }

        const eventRes = await fetch(`http://127.0.0.1:8000/api/v1/event/${selectedEventId}`, { cache: "no-store" });
        if (eventRes.ok) {
          const e = await eventRes.json();
          setEventData(e);
        } else {
          setEventData(FALLBACK_PAYLOADS[selectedEventId] || FALLBACK_PAYLOADS.E001);
        }
      } catch (err) {
        setApiConnected(false);
        setEventData(FALLBACK_PAYLOADS[selectedEventId] || FALLBACK_PAYLOADS.E001);
      }
    }

    loadData();
    setTimelineStepIndex(0);
  }, [selectedEventId]);

  const activeZoneId = eventData.location?.zone_id || "Z42";
  const activeZone = ZONE_COORDINATES[activeZoneId] || ZONE_COORDINATES.Z42;
  const activeIncident = INCIDENTS.find((i) => i.id === selectedIncidentId) || INCIDENTS[0];

  // Derive active timeline step
  const timeline = eventData.timeline || [];
  const activeTimelineStep = timeline.length > 0 ? timeline[Math.min(timelineStepIndex, timeline.length - 1)] : null;

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

  const currentTheme = priorityThemes[eventData.priority] || priorityThemes.MEDIUM;

  const handleSelectZoneFromMap = (zId) => {
    const matched = SAMPLE_EVENTS.find((e) => e.zone === zId);
    if (matched) setSelectedEventId(matched.id);
  };

  const handleSelectIncident = (incId) => {
    setSelectedIncidentId(incId);
    const inc = INCIDENTS.find((i) => i.id === incId);
    if (inc) {
      const ev = SAMPLE_EVENTS.find((e) => e.zone === inc.zoneId);
      if (ev) setSelectedEventId(ev.id);
    }
  };

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
          isRadarOutage={isRadarOutage}
        />

        {/* Focus Incident Selector Navigation */}
        <nav aria-label="Incident focus selector" className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--text-secondary)] mr-1">
            Catchment Focus:
          </span>
          {SAMPLE_EVENTS.map((ev) => {
            const isSelected = selectedEventId === ev.id;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => setSelectedEventId(ev.id)}
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-sky-950/80 text-white border border-sky-500/70 shadow-sm"
                    : "bg-[var(--card)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--card-elevated)] hover:text-slate-200"
                }`}
              >
                <span className="font-semibold">{ev.id}</span> · {ev.name}
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
                  {eventData.priority}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {currentTheme.headline}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Primary impact zone: <strong className="text-white">{activeZone.name}</strong> ({activeZoneId}) — {activeZone.floodArea} topography
              </p>
            </div>

            {/* Subdued Telemetry Strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
              <div className="bg-[var(--canvas)] px-3 py-1.5 rounded border border-[var(--border)]">
                <div className="text-[var(--text-secondary)]">Confidence</div>
                <div className="text-sm font-bold font-telemetry text-slate-100 mt-0.5">
                  {((isRadarOutage ? Math.max(0.45, eventData.confidence - 0.25) : eventData.confidence) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-[var(--canvas)] px-3 py-1.5 rounded border border-[var(--border)]">
                <div className="text-[var(--text-secondary)]">Lead Horizon</div>
                <div className="text-sm font-bold font-telemetry text-slate-100 mt-0.5">
                  {eventData.rainfall?.lead_minutes || 60} min
                </div>
              </div>
              <div className="bg-[var(--canvas)] px-3 py-1.5 rounded border border-[var(--border)]">
                <div className="text-[var(--text-secondary)]">Exposed Census</div>
                <div className="text-sm font-bold font-telemetry text-rose-400 mt-0.5">
                  {(eventData.impact?.population_exposed || activeZone.population).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Temporal Forecast Scrub Bar (Active across modes) */}
        <TimelineBar
          timeline={timeline}
          activeStepIndex={timelineStepIndex}
          onStepChange={setTimelineStepIndex}
        />

        {/* Primary Interactive GIS Map */}
        <ZoneMap
          selectedZoneId={activeZoneId}
          onSelectZone={handleSelectZoneFromMap}
          activeTimelineStep={activeTimelineStep}
          isRadarOutage={isRadarOutage}
          activeIncident={activeIncident}
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
              <span>Impact & What-If Mode</span>
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
              <span>Response & Routing Mode</span>
            </button>
          </div>
        </div>

        {/* Active Mode Panels */}
        <section className="pt-2">
          {activeMode === "hazard" && (
            <HazardMode
              eventData={eventData}
              activeTimelineStep={activeTimelineStep}
              isRadarOutage={isRadarOutage}
              onToggleRadarOutage={() => setIsRadarOutage(!isRadarOutage)}
            />
          )}

          {activeMode === "impact" && (
            <ImpactMode
              eventData={eventData}
              activeZone={activeZone}
            />
          )}

          {activeMode === "response" && (
            <ResponseMode
              eventData={eventData}
              activeZone={activeZone}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={handleSelectIncident}
              onOpenCapDrawer={() => setIsCapDrawerOpen(true)}
            />
          )}
        </section>

        {/* CAP / SACHET XML Drawer Modal */}
        <CapDrawer
          isOpen={isCapDrawerOpen}
          onClose={() => setIsCapDrawerOpen(false)}
          eventData={eventData}
          activeZone={activeZone}
        />

        {/* Operational Footer */}
        <footer className="pt-6 pb-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            HydroSurge AI Decision Support • Automated Inundation Modeling & Flash Flood Early Warning System
          </p>
          <div className="flex items-center gap-3 font-telemetry">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]"></span>
            <span>OASIS CAP v1.2 & FastHydro Engine Validated</span>
          </div>
        </footer>

      </div>
    </main>
  );
}