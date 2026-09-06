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
    <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-3.5 sm:p-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
            Temporal Forecast Scrub Bar
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--card-elevated)] border border-[var(--border)] font-telemetry text-sky-400">
            {currentStep.step_label || `+${currentStep.lead_minutes || 0}m`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`cursor-pointer px-3 py-1 text-xs font-medium rounded border transition-colors flex items-center gap-1.5 ${
              isPlaying
                ? "bg-amber-950/70 border-amber-500 text-amber-300"
                : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-primary)] hover:border-slate-500"
            }`}
          >
            <span>{isPlaying ? "⏸ Pause" : "▶ Auto-play sequence"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              if (onStepChange) onStepChange(0);
            }}
            className="cursor-pointer px-2 py-1 text-xs rounded border border-[var(--border)] bg-[var(--card-elevated)] text-[var(--text-secondary)] hover:text-white"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Step Buttons Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-1.5 pt-1 overflow-x-auto">
        {steps.map((st, idx) => {
          const isSelected = idx === currentIndex;
          const prob = st.flood_probability || 0;
          let dotColor = "bg-[var(--safe)]";
          if (prob >= 0.7) dotColor = "bg-[var(--critical)]";
          else if (prob >= 0.4) dotColor = "bg-[var(--warning)]";

          return (
            <button
              key={st.step_label || st.timestamp || idx}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                if (onStepChange) onStepChange(idx);
              }}
              className={`cursor-pointer p-2 rounded flex flex-col items-center justify-between border transition-all text-center min-w-[70px] ${
                isSelected
                  ? "bg-sky-950/70 border-sky-500 text-white shadow-sm"
                  : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                <span className="font-telemetry font-bold text-xs">{st.step_label || `+${st.lead_minutes}m`}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                {st.rainfall_mm_hr !== undefined ? `${st.rainfall_mm_hr}mm` : "—"}
              </span>
              <span className="text-[10px] font-semibold text-sky-300">
                {st.depth_band || "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scrub Details Strip */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[var(--text-secondary)] pt-1.5 border-t border-[var(--border)] font-telemetry gap-2">
        <span>
          Lead Horizon: <strong className="text-[var(--text-primary)]">+{currentStep.lead_minutes || 0} min</strong>
        </span>
        <span>
          Precipitation: <strong className="text-[var(--text-primary)]">{currentStep.rainfall_mm_hr || 0} mm/hr</strong>
        </span>
        <span>
          Peak Depth: <strong className="text-rose-400">{currentStep.depth_band || "nominal"}</strong>
        </span>
        <span>
          Flood Prob: <strong className="text-amber-300">{((currentStep.flood_probability || 0) * 100).toFixed(0)}%</strong>
        </span>
      </div>
    </div>
  );
}
