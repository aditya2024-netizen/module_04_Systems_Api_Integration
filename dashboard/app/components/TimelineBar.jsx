"use client";

import { useEffect, useState } from "react";

export default function TimelineBar({
  timeline,
  activeStepIndex,
  onStepChange,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Default steps if backend event has no timeline
  const defaultSteps = [
    { step_label: "T+00", lead_minutes: 0, rainfall_mm_hr: 35.0, depth_band: "<0.1m", flood_probability: 0.25 },
    { step_label: "T+15", lead_minutes: 15, rainfall_mm_hr: 58.0, depth_band: "0.1-0.3m", flood_probability: 0.48 },
    { step_label: "T+30", lead_minutes: 30, rainfall_mm_hr: 87.0, depth_band: "0.3-0.5m", flood_probability: 0.72 },
    { step_label: "T+45", lead_minutes: 45, rainfall_mm_hr: 104.0, depth_band: "0.5-1.0m", flood_probability: 0.87 },
    { step_label: "T+60", lead_minutes: 60, rainfall_mm_hr: 72.0, depth_band: "0.5-1.0m", flood_probability: 0.81 },
    { step_label: "T+90", lead_minutes: 90, rainfall_mm_hr: 45.0, depth_band: "0.3-0.5m", flood_probability: 0.65 },
    { step_label: "T+120", lead_minutes: 120, rainfall_mm_hr: 20.0, depth_band: "0.1-0.3m", flood_probability: 0.38 },
  ];

  const steps = (timeline && timeline.length > 0) ? timeline : defaultSteps;
  const currentIndex = Math.min(activeStepIndex, steps.length - 1);
  const currentStep = steps[currentIndex] || steps[0];

  // Auto-play timer
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onStepChange((prev) => (prev + 1) % steps.length);
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, steps.length, onStepChange]);

  return (
    <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Temporal Forecast Scrub Bar
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--card-elevated)] border border-[var(--border)] font-telemetry text-sky-400">
            {currentStep.step_label || `T+${currentStep.lead_minutes}m`}
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
              onStepChange(0);
            }}
            className="cursor-pointer px-2 py-1 text-xs rounded border border-[var(--border)] bg-[var(--card-elevated)] text-[var(--text-secondary)] hover:text-white"
          >
            Reset T+00
          </button>
        </div>
      </div>

      {/* Step Buttons Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
        {steps.map((st, idx) => {
          const isSelected = idx === currentIndex;
          const prob = st.flood_probability || 0;
          let dotColor = "bg-[var(--safe)]";
          if (prob >= 0.7) dotColor = "bg-[var(--critical)]";
          else if (prob >= 0.4) dotColor = "bg-[var(--warning)]";

          return (
            <button
              key={st.step_label || idx}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onStepChange(idx);
              }}
              className={`cursor-pointer p-2 rounded flex flex-col items-center justify-between border transition-all text-center ${
                isSelected
                  ? "bg-sky-950/60 border-sky-500/70 text-white shadow-sm"
                  : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                <span className="font-telemetry font-bold text-xs">{st.step_label || `+${st.lead_minutes}m`}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                {st.rainfall_mm_hr ? `${st.rainfall_mm_hr}mm` : "—"}
              </span>
              <span className="text-[10px] font-semibold text-sky-300">
                {st.depth_band || "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scrub Details Strip */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border)] font-telemetry">
        <span>
          Progression: <strong className="text-[var(--text-primary)]">Lead horizon +{currentStep.lead_minutes || 0} min</strong>
        </span>
        <span>
          Instantaneous rate: <strong className="text-[var(--text-primary)]">{currentStep.rainfall_mm_hr || 0} mm/hr</strong>
        </span>
        <span>
          Projected peak depth: <strong className="text-rose-400">{currentStep.depth_band || "nominal"}</strong>
        </span>
        <span>
          Flood likelihood: <strong className="text-amber-300">{((currentStep.flood_probability || 0) * 100).toFixed(0)}%</strong>
        </span>
      </div>
    </div>
  );
}
