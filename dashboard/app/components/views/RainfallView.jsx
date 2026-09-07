"use client";

import React from "react";
import { IconRainfall, IconRefresh, IconAlert } from "../Icons";

export default function RainfallView({
  eventData,
  activeTimelineStep,
  isRadarOutage,
  onToggleRadarOutage,
}) {
  const rain = eventData?.rainfall || {};
  const timeline = eventData?.timeline || [];

  const currentRainRate = activeTimelineStep
    ? activeTimelineStep.rainfall_mm_hr
    : (rain.rainfall_mm_hr ?? 87.0);

  const currentAccumulation = activeTimelineStep
    ? activeTimelineStep.rainfall_accumulation_mm
    : (rain.rainfall_accumulation_mm ?? 124.0);

  const currentLead = activeTimelineStep
    ? activeTimelineStep.lead_minutes
    : (rain.lead_minutes ?? 60);

  const confidence = rain.confidence ?? 0.84;
  const isOutageActive = Boolean(eventData?.radar_outage || isRadarOutage);
  const sensorSource = isOutageActive
    ? "imd_kalpana_satellite_fallback"
    : (rain.source === "mock" ? "DWR_CHENNAI_S_BAND (REPLAY)" : (rain.source || "DWR_RADAR"));

  // IMD Intensity Classification
  let classification = "HEAVY RAINFALL (64.5 – 115.5 mm/hr)";
  let classBadge = "bg-amber-100 text-amber-900 border-amber-300";
  if (currentRainRate > 115.5) {
    classification = "VERY HEAVY RAINFALL (>115.5 mm/hr)";
    classBadge = "bg-rose-100 text-rose-900 border-rose-300 font-bold";
  } else if (currentRainRate < 15.5) {
    classification = "LIGHT RAINFALL (<15.5 mm/hr)";
    classBadge = "bg-emerald-100 text-emerald-900 border-emerald-300";
  } else if (currentRainRate < 64.5) {
    classification = "MODERATE RAINFALL (15.5 – 64.5 mm/hr)";
    classBadge = "bg-sky-100 text-sky-900 border-sky-300";
  }

  // Max value for hyetograph normalization
  const maxRainInTimeline = Math.max(...timeline.map((t) => t.rainfall_mm_hr || 0), 100);

  return (
    <div className="space-y-5">
      {/* 1. Header Banner with Radar Outage Control */}
      <div className={`p-4 rounded-xl border transition-all ${
        isOutageActive
          ? "bg-amber-50/80 border-amber-300 shadow-xs"
          : "bg-[var(--card)] border-[var(--border)] shadow-2xs"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isOutageActive ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                {isOutageActive
                  ? "Degraded Sensor Fallback Active — Satellite Nowcast Synthesis"
                  : "Precipitation Nowcast & Optical Radar Flow — Primary Stream"}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {isOutageActive
                ? "Simulating S-band / X-band Doppler radar outage. Fallback model consuming Kalpana-1 / INSAT-3DR thermal IR infrared brightness telemetry with expanded confidence bounds."
                : "Active Doppler Weather Radar (DWR) 6-minute volumetric scans calibrated with AWS surface tipping-bucket gauges."}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleRadarOutage}
            className={`cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg border transition-all shrink-0 font-telemetry ${
              isOutageActive
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold hover:bg-amber-400 shadow-xs"
                : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-primary)] hover:border-slate-400 hover:bg-slate-200"
            }`}
          >
            {isOutageActive ? "✓ RESTORE PRIMARY RADAR" : "⚡ SIMULATE RADAR OUTAGE"}
          </button>
        </div>

        {isOutageActive && (
          <div className="mt-3 p-3 rounded-lg bg-amber-100/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
            <span className="text-base leading-none">⚠️</span>
            <div>
              <strong>Degraded Fallback Operational Notice:</strong> Sensor provenance transferred to{" "}
              <code className="font-telemetry font-bold">{sensorSource}</code>. Model confidence adjusted from baseline 0.84 to{" "}
              <strong>{(confidence * 100).toFixed(0)}%</strong>. Spatial resolution coarse-grained to 4km satellite grid.
            </div>
          </div>
        )}
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="panel-technical p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-telemetry">Instantaneous Rate</div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] font-telemetry mt-1 flex items-baseline gap-1">
            <span>{currentRainRate}</span>
            <span className="text-xs font-normal text-[var(--text-muted)]">mm/hr</span>
          </div>
          <div className="mt-2">
            <span className={`text-[10px] font-telemetry font-semibold px-2 py-0.5 rounded border inline-block ${classBadge}`}>
              {classification}
            </span>
          </div>
        </div>

        <div className="panel-technical p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-telemetry">Accumulation Total</div>
          <div className="text-3xl font-extrabold text-sky-800 font-telemetry mt-1 flex items-baseline gap-1">
            <span>{currentAccumulation}</span>
            <span className="text-xs font-normal text-[var(--text-muted)]">mm</span>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] font-telemetry mt-2">
            Horizon Window: <strong>+{currentLead} min</strong>
          </div>
        </div>

        <div className="panel-technical p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-telemetry">Forecast Horizon</div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] font-telemetry mt-1 flex items-baseline gap-1">
            <span>+{currentLead}</span>
            <span className="text-xs font-normal text-[var(--text-muted)]">min</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-telemetry font-semibold mt-2">
            0 to 3hr High-Density Lead
          </div>
        </div>

        <div className="panel-technical p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-telemetry">Model Confidence</div>
          <div className="text-3xl font-extrabold font-telemetry mt-1 flex items-baseline gap-1 text-emerald-700">
            <span>{((confidence ?? 0.8) * 100).toFixed(0)}%</span>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] font-telemetry mt-2">
            Fused Precipitation Score
          </div>
        </div>

        <div className="col-span-2 sm:col-span-2 lg:col-span-1 panel-technical p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-telemetry">Sensor Provenance</div>
          <div className="text-xs font-mono font-bold text-sky-900 mt-1 truncate">
            {sensorSource}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-telemetry mt-2">
            Mode: <strong>{eventData?.data_source || "PRECOMPUTED_REPLAY"}</strong>
          </div>
        </div>
      </div>

      {/* 3. Precipitation Evolution Hyetograph (SVG Data Visualization) */}
      <div className="panel-technical p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-600"></span>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-telemetry">
                Precipitation Hyetograph &amp; Intensity Evolution
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Temporal rainfall intensity profile across the event horizon with critical convective thresholds
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-telemetry">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-600"></span>
              <span className="text-[var(--text-secondary)]">Rate (mm/hr)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500"></span>
              <span className="text-[var(--text-secondary)]">Warning Threshold (50 mm/hr)</span>
            </span>
          </div>
        </div>

        {/* Hyetograph Bar Chart */}
        <div className="mt-4 pt-2">
          <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-[var(--border)]">
            {timeline.map((step, idx) => {
              const rate = step.rainfall_mm_hr || 0;
              const heightPercent = Math.max(8, Math.min(100, (rate / maxRainInTimeline) * 100));
              const isPeak = rate >= 80;
              const isWarning = rate >= 50;

              return (
                <div key={step.timestamp || idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-telemetry px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    <div>{rate} mm/hr · {step.rainfall_accumulation_mm}mm accum</div>
                    <div className="text-slate-300">Lead: +{step.lead_minutes}m</div>
                  </div>

                  {/* Intensity Value Label */}
                  <span className="text-[11px] font-telemetry font-bold text-[var(--text-primary)]">
                    {rate}
                  </span>

                  {/* Bar */}
                  <div
                    className={`w-full max-w-[48px] rounded-t transition-all duration-500 ${
                      isPeak
                        ? "bg-rose-600 hover:bg-rose-500"
                        : isWarning
                        ? "bg-amber-500 hover:bg-amber-400"
                        : "bg-sky-600 hover:bg-sky-500"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between text-xs font-telemetry text-[var(--text-muted)] pt-2 px-2">
            {timeline.map((step, idx) => (
              <div key={idx} className="flex-1 text-center">
                <div className="font-bold text-[var(--text-primary)]">+{step.lead_minutes}m</div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {step.timestamp ? step.timestamp.substring(11, 16) : `T+${step.lead_minutes}`}Z
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Scientific Context & Verification Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-telemetry">
        <div className="panel-technical p-4 rounded-xl space-y-2.5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            IMD Hyetograph Classification Criteria
          </h4>
          <div className="space-y-1.5 text-[var(--text-secondary)]">
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span>Light Rainfall:</span>
              <span className="font-bold text-emerald-700">2.5 to 15.5 mm/hr</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span>Moderate Rainfall:</span>
              <span className="font-bold text-sky-700">15.6 to 64.4 mm/hr</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span>Heavy Rainfall:</span>
              <span className="font-bold text-amber-700">64.5 to 115.5 mm/hr (Active Focus)</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Very Heavy Rainfall:</span>
              <span className="font-bold text-rose-600">&gt;115.5 mm/hr</span>
            </div>
          </div>
        </div>

        <div className="panel-technical p-4 rounded-xl space-y-2.5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Model Validation &amp; Provenance Invariant
          </h4>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            In accordance with SRS-04 Section 1 non-negotiable rules, model accuracy metrics (MAE, RMSE, Critical Success Index) require validation against measured AWS tipping-bucket rain gauge arrays. Unverified accuracy numbers are not manufactured.
          </p>
          <div className="p-2.5 rounded bg-[var(--canvas)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>Capability Status Tag:</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold">
              PROTOTYPE 🟡 (Replay Scenario)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
