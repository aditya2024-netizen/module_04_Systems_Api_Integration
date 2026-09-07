"use client";

import React from "react";
import { IconDataSources, IconRefresh, IconShield } from "../Icons";

export default function DataSourcesView({
  isRadarOutage,
  onToggleRadarOutage,
  eventData,
}) {
  const isOutage = Boolean(eventData?.radar_outage || isRadarOutage);

  const sources = [
    {
      id: "dwr",
      name: "Doppler Weather Radar (DWR)",
      type: "Remote Sensing / Reflectivity Nowcasting",
      station: "IMD Meenambakkam S-Band & X-Band Urban Radar",
      status: isOutage ? "DEGRADED" : "AVAILABLE",
      statusClass: isOutage ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-emerald-100 text-emerald-900 border-emerald-300",
      dotColor: isOutage ? "bg-amber-500 animate-pulse" : "bg-emerald-500",
      quality: isOutage ? "45%" : "92%",
      latency: isOutage ? "Offline (Fallback active)" : "3.2 min",
      interval: "6-minute volumetric scans",
      coverage: "250 km radius (Adyar & Cooum Basins)",
      role: "Primary precipitation rate (mm/hr) nowcast engine. Drives immediate 0–60 min storm cell advection.",
      degradedNote: isOutage ? "Simulated outage active. System safely redirected to Kalpana/INSAT satellite synthesis." : null,
    },
    {
      id: "sat",
      name: "Geostationary Satellite (INSAT-3DR / Kalpana-1)",
      type: "Thermal Infrared & Water Vapor Sounding",
      station: "ISRO / MOSDAC Geostationary Earth Observation",
      status: "AVAILABLE",
      statusClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      dotColor: "bg-emerald-500",
      quality: "78%",
      latency: "11.4 min",
      interval: "15-minute rapid scan cycle",
      coverage: "Synoptic Indian Subcontinent",
      role: "Macro convective cloud-top tracking and secondary fallback stream when coastal radar experiences attenuation.",
      degradedNote: isOutage ? "Serving as primary fallback source during simulated radar disruption." : null,
    },
    {
      id: "aws",
      name: "AWS / ARG Surface Meteorological Network",
      type: "In-Situ Hydro-Meteorological Gauges",
      station: "Greater Chennai Corporation (GCC) & IMD Stations",
      status: "NOMINAL",
      statusClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      dotColor: "bg-emerald-500",
      quality: "94%",
      latency: "2.1 min",
      interval: "15-minute telemetry intervals",
      coverage: "42 calibrated stations across GCC zones",
      role: "Ground-truth calibration for radar Z-R conversion and antecedent soil saturation estimation.",
      degradedNote: null,
    },
    {
      id: "nwp",
      name: "Numerical Weather Prediction (NWP WRF / GFS)",
      type: "Dynamical Atmospheric Physics Simulation",
      station: "NCMRWF Unified Model & IMD 3km Regional WRF",
      status: "NOMINAL",
      statusClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      dotColor: "bg-emerald-500",
      quality: "84%",
      latency: "1.4 hrs (Cycle sync)",
      interval: "6-hourly operational initialization",
      coverage: "Peninsular India Mesoscale Grid",
      role: "Medium-range synoptic steering, moisture flux convergence, and 6–24 hour flood guidance.",
      degradedNote: null,
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <div className="p-4 rounded-xl panel-technical flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-600"></span>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Multi-Source Data Ingestion &amp; Quality Provenance
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Continuous health, telemetry latency, and quality verification across radar, satellite, surface AWS, and NWP pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleRadarOutage}
            className={`cursor-pointer px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all font-telemetry ${
              isOutage
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold hover:bg-amber-400"
                : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-primary)] hover:border-slate-400"
            }`}
          >
            {isOutage ? "Restore Radar Telemetry" : "⚡ Simulate Radar Outage"}
          </button>
        </div>
      </div>

      {/* 2. Sensor Stream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className={`panel-technical p-4 rounded-xl flex flex-col justify-between transition-all ${
              src.status === "DEGRADED" ? "border-amber-400 bg-amber-50/40" : ""
            }`}
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-[var(--border)] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${src.dotColor}`}></span>
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-telemetry">
                      {src.name}
                    </h3>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {src.type}
                  </div>
                </div>

                <span className={`text-[10px] font-telemetry font-bold px-2 py-0.5 rounded border shrink-0 ${src.statusClass}`}>
                  {src.status}
                </span>
              </div>

              {/* Source Details Grid */}
              <div className="grid grid-cols-3 gap-2 my-3 text-xs font-telemetry">
                <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Quality Score</div>
                  <div className="text-base font-bold text-[var(--text-primary)] mt-0.5">{src.quality}</div>
                </div>

                <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Latency</div>
                  <div className="text-xs font-bold text-sky-800 mt-0.5">{src.latency}</div>
                </div>

                <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Sampling</div>
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)] mt-0.5 truncate">{src.interval}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[var(--text-secondary)] font-telemetry">
                <div>Station: <strong className="text-[var(--text-primary)]">{src.station}</strong></div>
                <div>Coverage: <strong className="text-[var(--text-primary)]">{src.coverage}</strong></div>
                <p className="text-[11px] text-[var(--text-muted)] font-sans mt-2 leading-relaxed">
                  {src.role}
                </p>
              </div>

              {src.degradedNote && (
                <div className="mt-3 p-2 rounded bg-amber-100/90 border border-amber-300 text-xs text-amber-950 flex items-center gap-2 font-telemetry">
                  <span>⚠️</span>
                  <span>{src.degradedNote}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[10px] font-telemetry text-[var(--text-muted)] flex justify-between">
              <span>SOURCE ID: {src.id.toUpperCase()}_OPERATIONAL</span>
              <span className="text-sky-700 font-bold">CONTRACT VERIFIED</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Sensor Fusion Architecture Explanation */}
      <div className="panel-technical p-4 rounded-xl space-y-3 font-telemetry text-xs">
        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
          Confidence-Aware Sensor Fusion Architecture
        </h4>
        <p className="text-[var(--text-secondary)] font-sans leading-relaxed">
          HydroSurge AI does not rely on a single sensor channel. Precipitation estimation uses an ensemble Kalman fusion algorithm. If Doppler weather radar telemetry drops below nominal SNR thresholds or encounters hardware maintenance, the gateway automatically falls back to geostationary satellite thermal infrared sounding without service interruption, accompanied by an explicit widening of model confidence intervals.
        </p>
        <div className="p-3 rounded bg-[var(--canvas)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
          <span>Active Ingestion Mode: <strong className="text-[var(--text-primary)]">{eventData?.data_source || "PRECOMPUTED_REPLAY"}</strong></span>
          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-300 font-bold">
            PROTOTYPE 🟡
          </span>
        </div>
      </div>
    </div>
  );
}
