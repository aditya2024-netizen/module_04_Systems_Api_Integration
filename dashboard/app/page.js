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

  const priorityStyles = {
    CRITICAL: "bg-rose-500/20 text-rose-300 border-rose-500/50",
    HIGH: "bg-amber-500/20 text-amber-300 border-amber-500/50",
    MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    LOW: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto border-b border-slate-800 pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                SIH PS 26071 • Module 4
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              HydroSurge AI — Decision Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Systems & API Integration: Rainfall Nowcasting → Flood Inundation → Decision Protocol
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">API Gateway:</span>
              <span className={`font-semibold flex items-center gap-1.5 ${apiConnected ? "text-emerald-400" : "text-amber-400"}`}>
                <span className={`h-2 w-2 rounded-full ${apiConnected ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                {apiConnected ? "ONLINE (localhost:8000)" : "REPLAY FAILSAFE ACTIVE"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Mode:</span>
              <span className="font-mono text-cyan-300 font-medium">
                {healthData ? healthData.provider_mode : "mock"}
              </span>
            </div>
          </div>
        </div>

        {/* Event Selector */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Replay Events:
          </span>
          {SAMPLE_EVENTS.map((ev) => {
            const isSelected = selectedEventId === ev.id;
            return (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all border ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <span className="font-bold">{ev.id}</span> — {ev.name} ({ev.priority})
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border shadow-lg ${priorityStyles[eventData.priority] || priorityStyles.MEDIUM}`}>
            <div className="text-xs uppercase font-bold tracking-wider opacity-80">Action Priority Level</div>
            <div className="text-3xl font-extrabold tracking-tight mt-1">{eventData.priority}</div>
            <div className="text-xs mt-2 opacity-90">
              Target Zone: <span className="font-semibold">{eventData.location.zone_id}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">Data Provenance (SRS-04)</div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${
                eventData.data_source === "LIVE"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                  : "bg-indigo-950/80 text-indigo-300 border-indigo-500/50"
              }`}>
                {eventData.data_source === "LIVE" ? "● LIVE" : "↻ PRECOMPUTED_REPLAY"}
              </span>
              <span className="text-xs text-slate-400 font-mono">[{eventData.status}]</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Contract-verified replay event.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">System Confidence</div>
            <div className="text-3xl font-bold text-cyan-300 mt-1">{(eventData.confidence * 100).toFixed(0)}%</div>
            <div className="text-xs text-slate-400 mt-2">
              Rain ({eventData.rainfall.confidence}) • Flood ({eventData.inundation.confidence})
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">Forecast Horizon</div>
            <div className="text-xl font-bold text-slate-200 mt-1">{eventData.rainfall.lead_minutes} min</div>
            <div className="text-xs text-slate-400 mt-2 font-mono truncate">
              {eventData.rainfall.valid_time}
            </div>
          </div>
        </div>

        {/* Rain & Flood Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌧️</span>
                <div>
                  <h2 className="text-base font-bold text-white">Rainfall Nowcast</h2>
                  <span className="text-xs font-mono text-cyan-400">R&D-1 Contract</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-300">
                {eventData.rainfall.source}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-xs text-slate-400 uppercase tracking-wide">Intensity</div>
                <div className="text-3xl font-extrabold text-blue-400 mt-1">
                  {eventData.rainfall.rainfall_mm_hr} <span className="text-sm font-normal text-slate-400">mm/hr</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-xs text-slate-400 uppercase tracking-wide">Accumulation</div>
                <div className="text-3xl font-extrabold text-indigo-300 mt-1">
                  {eventData.rainfall.rainfall_accumulation_mm} <span className="text-sm font-normal text-slate-400">mm</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs font-mono text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <div className="text-slate-500">prediction_uri:</div>
              <div className="text-cyan-400 truncate">{eventData.rainfall.prediction_uri}</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌊</span>
                <div>
                  <h2 className="text-base font-bold text-white">Inundation Risk</h2>
                  <span className="text-xs font-mono text-cyan-400">R&D-2 Contract</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-300">
                {eventData.inundation.source}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-xs text-slate-400 uppercase tracking-wide">Flood Probability</div>
                <div className="text-3xl font-extrabold text-rose-400 mt-1">
                  {(eventData.inundation.flood_probability * 100).toFixed(0)}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-xs text-slate-400 uppercase tracking-wide">Depth Band</div>
                <div className="text-2xl font-extrabold text-amber-300 mt-1">
                  {eventData.inundation.depth_band}
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs font-mono text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <div className="text-slate-500">risk_uri:</div>
              <div className="text-cyan-400 truncate">{eventData.inundation.risk_uri}</div>
            </div>
          </div>
        </div>

        {/* Spatial Map & Decision Action Protocol */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ZoneMap
              selectedZoneId={eventData.location.zone_id}
              onSelectZone={(zId) => {
                const found = SAMPLE_EVENTS.find((e) => e.zone === zId);
                if (found) setSelectedEventId(found.id);
              }}
            />
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-4">
                Impact & Action Plan
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Exposed Population</span>
                  <span className="text-base font-bold text-rose-300">
                    {eventData.impact.population_exposed.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Critical Infrastructure</span>
                  <span className="text-base font-bold text-amber-300">
                    {eventData.impact.critical_assets} units
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Road Arterials Affected</span>
                  <span className="text-base font-bold text-cyan-300">
                    {eventData.impact.roads_affected} segments
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
                  Emergency Actions
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventData.actions.map((act, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs font-bold tracking-wider"
                    >
                      ⚡ {act}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Contract: <code className="text-cyan-400">DecisionObject</code>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}