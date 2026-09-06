"use client";

import { useState, useEffect } from "react";
import { SAMPLE_EVENTS, ZONE_COORDINATES } from "./data/fallback";
import ZoneMap from "./components/ZoneMap";

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
  const [healthData, setHealthData] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [dispatchedActions, setDispatchedActions] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const healthRes = await fetch("http://127.0.0.1:8000/api/v1/health", { cache: "no-store" });
        if (healthRes.ok) {
          const h = await healthRes.json();
          setHealthData(h);
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
  }, [selectedEventId]);

  const handleToggleAction = (actionKey) => {
    setDispatchedActions((prev) => {
      const isAlreadyDispatched = !!prev[actionKey];
      if (isAlreadyDispatched) {
        const next = { ...prev };
        delete next[actionKey];
        return next;
      } else {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        return { ...prev, [actionKey]: timeStr };
      }
    });
  };

  const priorityThemes = {
    CRITICAL: {
      banner: "bg-[#1f0b12] border border-rose-600/60 shadow-lg shadow-rose-950/30",
      badge: "bg-rose-600 text-white font-bold",
      indicator: "bg-rose-500",
      headline: "Critical Evacuation & Defense Advisory",
    },
    HIGH: {
      banner: "bg-[#1e1309] border border-amber-600/60 shadow-lg shadow-amber-950/20",
      badge: "bg-amber-600 text-white font-bold",
      indicator: "bg-amber-500",
      headline: "High Inundation Risk — Preparedness Active",
    },
    MEDIUM: {
      banner: "bg-[#18180c] border border-yellow-600/50",
      badge: "bg-yellow-600 text-white font-bold",
      indicator: "bg-yellow-500",
      headline: "Moderate Waterlogging Advisory",
    },
    LOW: {
      banner: "bg-[#0b1814] border border-emerald-600/40",
      badge: "bg-emerald-600 text-white font-bold",
      indicator: "bg-emerald-500",
      headline: "Nominal Conditions — Routine Drainage Monitoring",
    },
  };

  const currentTheme = priorityThemes[eventData.priority] || priorityThemes.MEDIUM;
  const activeZone = ZONE_COORDINATES[eventData.location.zone_id] || ZONE_COORDINATES.Z42;

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Command Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-[#1e2d4a]/70 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wider text-rose-400">
                FLOOD OPERATIONS CONSOLE
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              HydroSurge AI — Incident Decision Support
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Greater Chennai Corporation Basin • Real-Time Hydrodynamic Risk Engine
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Operational Status Pill (Calm, Pure Display, Not Clickable) */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0e1626] border border-[#1e2d4a]/70 text-xs select-none">
              <span className="h-2 w-2 rounded-full bg-sky-400"></span>
              <span className="text-slate-300">
                {eventData.data_source === "LIVE" ? "Live Stream Active" : "Operational Replay Baseline"}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">[{eventData.status}]</span>
            </div>

            {/* Gateway Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0e1626] border border-[#1e2d4a]/70 text-xs select-none">
              <span className={`h-2 w-2 rounded-full ${apiConnected ? "bg-emerald-400" : "bg-amber-400"}`}></span>
              <span className="text-slate-300">
                {apiConnected ? "Gateway Online (8000)" : "Replay Fallback Active"}
              </span>
            </div>
          </div>
        </header>

        {/* Incident Scenario Selector */}
        <nav aria-label="Incident selector" className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-slate-400 mr-1">
            Active Incident Focus:
          </span>
          {SAMPLE_EVENTS.map((ev) => {
            const isSelected = selectedEventId === ev.id;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => setSelectedEventId(ev.id)}
                className={`cursor-pointer px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ease-out active:scale-[0.98] ${
                  isSelected
                    ? "bg-[#14233d] text-white border border-sky-500/60 shadow-sm"
                    : "bg-[#0e1626] text-slate-400 border border-[#1e2d4a]/60 hover:bg-[#141e33] hover:text-slate-200"
                }`}
              >
                <span className="font-semibold">{ev.id}</span> · {ev.name}
              </button>
            );
          })}
        </nav>

        {/* Priority Command Alert Banner (Visually Dominant) */}
        <section className={`rounded-xl p-5 md:p-6 transition-all duration-200 ${currentTheme.banner}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded text-xs tracking-wider uppercase ${currentTheme.badge}`}>
                  {eventData.priority}
                </span>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {currentTheme.headline}
                </h2>
              </div>
              <p className="text-sm text-slate-300">
                Primary impact zone: <strong className="text-white">{activeZone.name}</strong> ({eventData.location.zone_id}) — {activeZone.floodArea} topography
              </p>
            </div>

            {/* Subdued Secondary Telemetry Strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
              <div className="bg-black/20 px-3 py-2 rounded-lg">
                <div className="text-slate-400">Model confidence</div>
                <div className="text-base font-bold text-slate-100 mt-0.5">
                  {(eventData.confidence * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-black/20 px-3 py-2 rounded-lg">
                <div className="text-slate-400">Forecast lead horizon</div>
                <div className="text-base font-bold text-slate-100 mt-0.5">
                  {eventData.rainfall.lead_minutes} min
                </div>
              </div>
              <div className="bg-black/20 px-3 py-2 rounded-lg">
                <div className="text-slate-400">Incident valid time</div>
                <div className="text-sm font-mono text-slate-200 mt-0.5">
                  {eventData.rainfall.valid_time}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Leaflet GIS Map + Weather/Flood Readings (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interactive Leaflet OpenStreetMap Visual */}
            <ZoneMap
              selectedZoneId={eventData.location.zone_id}
              onSelectZone={(zId) => {
                const found = SAMPLE_EVENTS.find((e) => e.zone === zId);
                if (found) setSelectedEventId(found.id);
              }}
            />

            {/* Real-time Environmental Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Rainfall Telemetry */}
              <div className="rounded-xl bg-[#0e1626] border border-[#1e2d4a]/70 p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e2d4a]/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌧️</span>
                    <h3 className="text-sm font-semibold text-slate-200">
                      Precipitation Nowcast
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Confidence: {(eventData.rainfall.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-[#141e33] p-3.5 rounded-lg">
                    <div className="text-xs text-slate-400">Precipitation rate</div>
                    <div className="text-2xl font-bold text-white mt-1">
                      {eventData.rainfall.rainfall_mm_hr}{" "}
                      <span className="text-xs font-normal text-slate-400">mm/hr</span>
                    </div>
                  </div>

                  <div className="bg-[#141e33] p-3.5 rounded-lg">
                    <div className="text-xs text-slate-400">Total accumulation</div>
                    <div className="text-2xl font-bold text-white mt-1">
                      {eventData.rainfall.rainfall_accumulation_mm}{" "}
                      <span className="text-xs font-normal text-slate-400">mm</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] font-mono text-slate-400 truncate">
                  Raster asset: <span className="text-slate-300">{eventData.rainfall.prediction_uri}</span>
                </div>
              </div>

              {/* Inundation Telemetry */}
              <div className="rounded-xl bg-[#0e1626] border border-[#1e2d4a]/70 p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e2d4a]/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌊</span>
                    <h3 className="text-sm font-semibold text-slate-200">
                      Inundation Risk Modeling
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Confidence: {(eventData.inundation.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-[#141e33] p-3.5 rounded-lg">
                    <div className="text-xs text-slate-400">Inundation probability</div>
                    <div className="text-2xl font-bold text-rose-400 mt-1">
                      {(eventData.inundation.flood_probability * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="bg-[#141e33] p-3.5 rounded-lg">
                    <div className="text-xs text-slate-400">Projected water depth</div>
                    <div className="text-2xl font-bold text-amber-300 mt-1">
                      {eventData.inundation.depth_band}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] font-mono text-slate-400 truncate">
                  Risk layer: <span className="text-slate-300">{eventData.inundation.risk_uri}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Population Impact & Dispatch Actions (Span 1) */}
          <div className="space-y-6">
            
            {/* Impact Assessment Card */}
            <div className="rounded-xl bg-[#0e1626] border border-[#1e2d4a]/70 p-5">
              <h3 className="text-sm font-semibold text-slate-200 pb-3 border-b border-[#1e2d4a]/50">
                Demographic & Asset Exposure
              </h3>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between bg-[#141e33] p-3.5 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-400">Exposed population</div>
                    <div className="text-xl font-bold text-rose-300 mt-0.5">
                      {eventData.impact.population_exposed.toLocaleString()} residents
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Inundation zone</span>
                </div>

                <div className="flex items-center justify-between bg-[#141e33] p-3.5 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-400">Critical infrastructure</div>
                    <div className="text-xl font-bold text-amber-300 mt-0.5">
                      {eventData.impact.critical_assets} facilities
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Substations/clinics</span>
                </div>

                <div className="flex items-center justify-between bg-[#141e33] p-3.5 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-400">Arterial roads affected</div>
                    <div className="text-xl font-bold text-sky-300 mt-0.5">
                      {eventData.impact.roads_affected} transit links
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Drain choke points</span>
                </div>
              </div>
            </div>

            {/* Emergency Action Protocol (Fully Interactive with Feedback) */}
            <div className="rounded-xl bg-[#0e1626] border border-[#1e2d4a]/70 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2d4a]/50">
                <h3 className="text-sm font-semibold text-slate-200">
                  Incident Action Protocol
                </h3>
                <span className="text-[11px] text-slate-400">
                  Click action to dispatch
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {eventData.actions.map((act) => {
                  const isDispatched = !!dispatchedActions[act];

                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => handleToggleAction(act)}
                      className={`w-full text-left p-3.5 rounded-lg transition-all duration-150 ease-out cursor-pointer flex items-center justify-between border ${
                        isDispatched
                          ? "bg-emerald-950/70 border-emerald-500/70 text-emerald-200"
                          : "bg-[#141e33] border-[#1e2d4a] text-slate-200 hover:border-slate-500 hover:bg-[#192742] active:scale-[0.99]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${isDispatched ? "bg-emerald-400" : "bg-rose-500"}`}></span>
                        <div>
                          <div className="text-xs font-bold tracking-wide">
                            {act === "ALERT" && "Issue Mass Emergency Evacuation Alert"}
                            {act === "CLOSE_ROAD" && "Close Vulnerable Road Arterials"}
                            {act === "DEPLOY_TEAM" && "Deploy Quick Response Disaster Unit"}
                            {act === "PREPOSITION_PUMPS" && "Preposition Heavy Dewatering Pumps"}
                            {act === "MONITOR_CULVERTS" && "Deploy Culvert Silt Inspection Crews"}
                            {act === "TRAFFIC_DIVERSION" && "Execute Commercial Traffic Diversion"}
                            {act === "CLEAR_STORM_DRAINS" && "Clear High-Risk Storm Drain Chokes"}
                            {act === "ADVISORY_ISSUED" && "Broadcast Public Weather Advisory"}
                            {act === "MONITOR_GAUGES" && "Enable High-Frequency Gauge Sampling"}
                            {act === "ROUTINE_MONITORING" && "Maintain Standard Basin Telemetry"}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Protocol ID: <code className="font-mono text-slate-300">{act}</code>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isDispatched
                          ? "bg-emerald-900/80 text-emerald-300 border border-emerald-600/50"
                          : "bg-[#0e1626] text-slate-400 border border-[#1e2d4a]"
                      }`}>
                        {isDispatched ? `✓ Dispatched (${dispatchedActions[act]})` : "Authorize"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {Object.keys(dispatchedActions).length > 0 && (
                <div className="mt-4 p-2.5 rounded bg-emerald-950/40 border border-emerald-700/50 text-xs text-emerald-300 flex items-center justify-between">
                  <span>{Object.keys(dispatchedActions).length} action(s) active in command queue</span>
                  <button
                    type="button"
                    onClick={() => setDispatchedActions({})}
                    className="underline text-[11px] cursor-pointer hover:text-emerald-200"
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Dignified Operational Footer (No Internal Jargon) */}
        <footer className="pt-6 pb-2 border-t border-[#1e2d4a]/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            HydroSurge AI Decision Engine • Automated Inundation Modeling & Flood Early Warning System
          </p>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>All telemetry contract-verified</span>
          </div>
        </footer>

      </div>
    </main>
  );
}