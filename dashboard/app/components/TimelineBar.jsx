"use client";

import { useEffect, useState } from "react";

export default function TimelineBar({
  timeline = [],
  activeStepIndex = 0,
  onStepChange,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  // If no timeline steps provided by API, render honest empty state
  if (!timeline || timeline.length === 0) {
    return (
      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">⏱️</span>
          <span>Temporal Forecast Timeline: Single forecast horizon active (No multi-step time series in API payload).</span>
        </div>
        <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-slate-400 shrink-0">
          STATIC HORIZON
        </span>
      </div>
    );
  }

  const steps = timeline;
  const currentIndex = Math.min(Math.max(0, activeStepIndex), steps.length - 1);
  const currentStep = steps[currentIndex] || steps[0];

  // Auto-play timer
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (onStepChange) {
          onStepChange((prev) => (prev + 1) % steps.length);
        }
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, steps.length, onStepChange]);

  return (
    <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-sky-400"></span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase font-telemetry">
              Temporal Forecast Sequence
            </span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded bg-sky-950/80 border border-sky-500/60 font-telemetry font-bold text-sky-300">
            {currentStep.step_label || `+${currentStep.lead_minutes || 0} min`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 font-telemetry ${
              isPlaying
                ? "bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm shadow-amber-950/40"
                : "bg-[var(--card-elevated)] border-[var(--border)] text-slate-200 hover:border-slate-500 hover:text-white"
            }`}
          >
            <span className={isPlaying ? "animate-pulse text-amber-400" : "text-sky-400"}>
              {isPlaying ? "⏸ PAUSE" : "▶ AUTO-PLAY"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              if (onStepChange) onStepChange(0);
            }}
            className="cursor-pointer px-2.5 py-1.5 text-xs font-telemetry rounded-md border border-[var(--border)] bg-[var(--card-elevated)] text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Step Buttons Grid with Progress Track */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-2 pt-1">
        {steps.map((st, idx) => {
          const isSelected = idx === currentIndex;
          const prob = st.flood_probability || 0;
          let dotColor = "bg-[var(--safe)]";
          let badgeBorder = "border-emerald-500/30 text-emerald-400";
          if (prob >= 0.7) {
            dotColor = "bg-[var(--critical)]";
            badgeBorder = "border-rose-500/30 text-rose-300";
          } else if (prob >= 0.4) {
            dotColor = "bg-[var(--warning)]";
            badgeBorder = "border-amber-500/30 text-amber-300";
          }

          return (
            <button
              key={st.step_label || st.timestamp || idx}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                if (onStepChange) onStepChange(idx);
              }}
              className={`cursor-pointer p-2.5 rounded-lg flex flex-col items-center justify-between border transition-all text-center ${
                isSelected
                  ? "bg-sky-950/80 border-sky-400 text-white shadow-md shadow-sky-950/40 ring-1 ring-sky-500/50"
                  : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-1.5 w-full justify-between pb-1 border-b border-[var(--border)]/50">
                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                <span className="font-telemetry font-bold text-xs tracking-wider">
                  {st.step_label || `+${st.lead_minutes}m`}
                </span>
                <span className={`text-[9px] font-telemetry px-1 rounded ${badgeBorder}`}>
                  {(prob * 100).toFixed(0)}%
                </span>
              </div>
              <div className="my-1 text-center w-full">
                <div className="text-[11px] font-bold text-slate-100 font-telemetry">
                  {st.rainfall_mm_hr !== undefined ? `${st.rainfall_mm_hr} mm/hr` : "—"}
                </div>
                <div className="text-[10px] font-medium text-sky-300 font-telemetry mt-0.5">
                  Depth: {st.depth_band || "—"}
                </div>
              </div>
              <span className="text-[9px] text-slate-400 font-telemetry uppercase">
                {st.rainfall_accumulation_mm ? `${st.rainfall_accumulation_mm}mm accum` : "Step"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scrub Details Strip */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)] font-telemetry gap-2 bg-[var(--canvas)] p-2.5 rounded-md border border-[var(--border)]/70">
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] uppercase">Horizon:</span>
          <strong className="text-white text-xs font-bold">+{currentStep.lead_minutes || 0} min</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] uppercase">Precipitation:</span>
          <strong className="text-sky-300 text-xs font-bold">{currentStep.rainfall_mm_hr || 0} mm/hr</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] uppercase">Projected Depth:</span>
          <strong className="text-rose-400 text-xs font-bold">{currentStep.depth_band || "nominal"}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] uppercase">Inundation Prob:</span>
          <strong className="text-amber-300 text-xs font-bold">{((currentStep.flood_probability || 0) * 100).toFixed(0)}%</strong>
        </span>
      </div>
    </div>
  );
}
