"use client";

import React from "react";
import { IconInundation, IconTarget, IconShield } from "../Icons";

export default function InundationView({
  eventData,
  activeTimelineStep,
  isRadarOutage,
}) {
  const inun = eventData?.inundation || {};
  const location = eventData?.location || {};
  const currentDepth = activeTimelineStep
    ? activeTimelineStep.depth_band
    : (inun.depth_band || "0.5-1.0m");
  const currentProb = activeTimelineStep
    ? activeTimelineStep.flood_probability
    : (inun.flood_probability ?? 0.87);
  const confidence = inun.confidence ?? 0.81;

  const depthBands = [
    { band: "<0.1m", label: "Nominal Runoff", desc: "Superficial sheet flow; municipal storm drains free-flowing", active: currentDepth === "<0.1m", color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
    { band: "0.1–0.3m", label: "Minor Waterlogging", desc: "Curbside pooling; traffic slows; storm drains nearing capacity", active: currentDepth === "0.1-0.3m", color: "text-sky-800 bg-sky-50 border-sky-300" },
    { band: "0.3–0.5m", label: "Arterial Inundation", desc: "Low-lying underpasses cut off; pedestrian hazard; ground floor splash", active: currentDepth === "0.3-0.5m", color: "text-amber-800 bg-amber-50 border-amber-300" },
    { band: "0.5–1.0m", label: "Critical Flood Overflow", desc: "Residential ground floors inundated; light vehicles submerged; power cutoff", active: currentDepth === "0.5-1.0m", color: "text-rose-700 bg-rose-50 border-rose-300 font-bold" },
    { band: ">1.0m", label: "Extreme Disaster Surge", desc: "Structural threat; rapid rescue required; life-safety evacuation", active: currentDepth === ">1.0m", color: "text-rose-950 bg-rose-200 border-rose-400 font-black" },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header Information */}
      <div className="p-4 rounded-xl panel-technical flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-600 ring-2 ring-rose-500/20"></span>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Hydrodynamic Inundation &amp; Surface Pooling Intelligence
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            2D Overland shallow-water numerical solver modeling overland sheet flow, curb storage, and culvert headwater backpressure.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-telemetry shrink-0">
          <span className="px-2.5 py-1 rounded bg-[var(--canvas)] border border-[var(--border)] text-[var(--text-secondary)]">
            Catchment: <strong className="text-[var(--text-primary)]">{location.zone_name || location.zone_id}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-300 font-bold">
            {location.flood_area_type || "Depression Bowl"}
          </span>
        </div>
      </div>

      {/* 2. Primary Inundation Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="panel-technical p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-telemetry">Inundation Probability</div>
          <div className="text-3xl font-extrabold text-rose-600 font-telemetry mt-1 flex items-baseline gap-1">
            <span>{((currentProb || 0) * 100).toFixed(0)}%</span>
            <span className="text-xs font-semibold text-rose-700">RISK</span>
          </div>
          <div className="text-[10px] text-rose-700 font-telemetry font-bold mt-2">
            {currentProb >= 0.75 ? "CRITICAL FLOOD ADVISORY" : currentProb >= 0.5 ? "HIGH FLOOD ADVISORY" : "MONITORING"}
          </div>
        </div>

        <div className="panel-technical p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-telemetry">Peak Depth Band</div>
          <div className="text-3xl font-extrabold text-amber-700 font-telemetry mt-1">
            {currentDepth}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] font-telemetry mt-2">
            Surface Water Stagnation
          </div>
        </div>

        <div className="panel-technical p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-telemetry">Solver Confidence</div>
          <div className="text-3xl font-extrabold text-emerald-700 font-telemetry mt-1">
            {((confidence ?? 0.81) * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-telemetry mt-2">
            Hydrodynamic Convergence
          </div>
        </div>

        <div className="panel-technical p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-telemetry">Terrain Topography</div>
          <div className="text-sm font-bold text-sky-900 font-telemetry mt-1 truncate">
            {location.flood_area_type || "Depression Basin"}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] font-telemetry mt-2">
            Adyar Catchment Lowpoint
          </div>
        </div>
      </div>

      {/* 3. Inundation Depth Band Progression Matrix */}
      <div className="panel-technical p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-telemetry">
                Inundation Depth Band Operational Thresholds
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Standard civil defense depth categorization for urban flood emergency response
            </p>
          </div>
          <span className="text-[10px] font-telemetry px-2.5 py-1 rounded bg-[var(--canvas)] border border-[var(--border)] text-[var(--text-muted)]">
            ACTIVE DEPTH: <strong className="text-rose-600">{currentDepth}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 pt-1">
          {depthBands.map((db) => (
            <div
              key={db.band}
              className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                db.active
                  ? "bg-rose-50/90 border-rose-400 shadow-sm ring-1 ring-rose-500/30"
                  : "bg-[var(--card-elevated)] border-[var(--border)] opacity-85"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-telemetry font-bold text-sm text-[var(--text-primary)]">{db.band}</span>
                  {db.active && (
                    <span className="text-[9px] font-telemetry font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                      CURRENT
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-[var(--text-primary)] mt-1">{db.label}</div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                  {db.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Hydraulic Engine Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-telemetry">
        <div className="panel-technical p-4 rounded-xl space-y-2.5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Hydraulic Solver Specifications
          </h4>
          <div className="space-y-1.5 text-[var(--text-secondary)]">
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span>Governing Equations:</span>
              <span className="font-bold text-[var(--text-primary)]">2D Shallow-Water (Saint-Venant)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span>Friction Formulation:</span>
              <span className="font-bold text-sky-800">Manning&apos;s n roughness grid (0.025–0.065)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span>Elevation Model:</span>
              <span className="font-bold text-[var(--text-primary)]">CartoDEM 10m / LIDAR-calibrated</span>
            </div>
            <div className="flex justify-between py-1">
              <span>State Raster URI:</span>
              <span className="font-mono text-sky-700 font-semibold">{inun.risk_uri || "mock://inundation/E001"}</span>
            </div>
          </div>
        </div>

        <div className="panel-technical p-4 rounded-xl space-y-2.5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Scientific Truthfulness &amp; Model Status
          </h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Hydrodynamic meshes and spatial depth rasters are served directly through the FastAPI <code className="font-mono text-sky-700 font-bold">/api/v1/inundation</code> contract. Future real-time telemetry from live R&amp;D-2 numerical engines will replace precomputed scenario matrices without altering the API interface.
          </p>
          <div className="p-2.5 rounded bg-[var(--canvas)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>Integration Status Tag:</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold">
              PROTOTYPE 🟡 (Replay Scenario)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
