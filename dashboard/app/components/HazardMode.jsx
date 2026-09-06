"use client";

export default function HazardMode({
  eventData,
  activeTimelineStep,
  isRadarOutage,
  onToggleRadarOutage,
}) {
  const rain = eventData.rainfall || {};
  const inun = eventData.inundation || {};

  // If timeline step is active, take values from timeline step
  const currentRainRate = activeTimelineStep
    ? activeTimelineStep.rainfall_mm_hr
    : rain.rainfall_mm_hr;
  const currentDepthBand = activeTimelineStep
    ? activeTimelineStep.depth_band
    : inun.depth_band;
  const currentProb = activeTimelineStep
    ? activeTimelineStep.flood_probability
    : inun.flood_probability;

  // Values directly from API contract
  const isOutageActive = Boolean(eventData.radar_outage || isRadarOutage);
  const effectiveRainConfidence = rain.confidence ?? 0.84;
  const effectiveInunConfidence = inun.confidence ?? 0.81;
  const effectiveSource = eventData.fallback_source || rain.source || "mock";

  return (
    <div className="space-y-4">
      {/* Radar Outage Simulation Control Banner */}
      <div className={`p-4 rounded-lg border transition-all ${
        isOutageActive
          ? "bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/20"
          : "bg-[var(--card)] border-[var(--border)]"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isOutageActive ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}></span>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {isOutageActive ? "Simulated Radar Outage — Degraded Fallback Mode Active" : "Doppler Weather Radar Telemetry (Replay Primary)"}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {isOutageActive
                ? "Simulating X-band / S-band radar telemetry disruption via API query. Degraded fallback active with increased uncertainty."
                : "Continuous high-resolution precipitation nowcasting active with replay Doppler radar telemetry."}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleRadarOutage}
            className={`cursor-pointer px-3.5 py-2 text-xs font-semibold rounded-md border transition-all shrink-0 ${
              isOutageActive
                ? "bg-amber-500 text-black border-amber-400 hover:bg-amber-400 font-bold"
                : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-primary)] hover:border-slate-500 hover:bg-[#141e33]"
            }`}
          >
            {isOutageActive ? "Restore Nominal Radar Telemetry" : "⚡ Simulate Radar Outage"}
          </button>
        </div>

        {isOutageActive && (
          <div className="mt-3 p-2.5 rounded bg-amber-900/30 border border-amber-600/40 text-xs text-amber-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>Degraded Fallback Telemetry (API-Verified):</strong> Sensor source redirected to <code className="font-mono">{effectiveSource}</code>. Rainfall confidence: {(effectiveRainConfidence * 100).toFixed(0)}%. Flood probability confidence: {(effectiveInunConfidence * 100).toFixed(0)}%.
            </span>
          </div>
        )}
      </div>

      {/* Environmental Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Precipitation Nowcast Card */}
        <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-base">🌧️</span>
                <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Precipitation Nowcast
                </h4>
              </div>
              <span className={`text-[11px] font-telemetry px-2 py-0.5 rounded ${
                isOutageActive ? "bg-amber-950 border border-amber-600 text-amber-300" : "bg-[var(--card-elevated)] text-slate-300 border border-[var(--border)]"
              }`}>
                Conf: {(effectiveRainConfidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[var(--card-elevated)] p-3 rounded border border-[var(--border)]">
                <div className="text-xs text-[var(--text-secondary)]">Instantaneous rate</div>
                <div className="text-2xl font-bold text-[var(--text-primary)] font-telemetry mt-1">
                  {currentRainRate}{" "}
                  <span className="text-xs font-normal text-[var(--text-secondary)]">mm/hr</span>
                </div>
              </div>

              <div className="bg-[var(--card-elevated)] p-3 rounded border border-[var(--border)]">
                <div className="text-xs text-[var(--text-secondary)]">Total accumulation</div>
                <div className="text-2xl font-bold text-[var(--text-primary)] font-telemetry mt-1">
                  {rain.rainfall_accumulation_mm}{" "}
                  <span className="text-xs font-normal text-[var(--text-secondary)]">mm</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-telemetry text-[var(--text-secondary)]">
              <div className="flex justify-between py-1 border-b border-[var(--border)]/60">
                <span>Forecast lead horizon:</span>
                <span className="text-[var(--text-primary)] font-semibold">{rain.lead_minutes} min</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]/60">
                <span>Nowcast sensor source:</span>
                <span className="text-sky-400 font-mono">{effectiveSource}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Telemetry valid timestamp:</span>
                <span className="text-[var(--text-primary)]">{rain.valid_time}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
            Sensor stream mapped to Chennai Catchment Adyar Basin
          </div>
        </div>

        {/* Hydrodynamic Inundation Telemetry */}
        <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-base">🌊</span>
                <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Hydrodynamic Inundation
                </h4>
              </div>
              <span className={`text-[11px] font-telemetry px-2 py-0.5 rounded ${
                isOutageActive ? "bg-amber-950 border border-amber-600 text-amber-300" : "bg-[var(--card-elevated)] text-slate-300 border border-[var(--border)]"
              }`}>
                Conf: {(effectiveInunConfidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[var(--card-elevated)] p-3 rounded border border-[var(--border)]">
                <div className="text-xs text-[var(--text-secondary)]">Inundation probability</div>
                <div className="text-2xl font-bold font-telemetry mt-1 text-rose-400">
                  {((currentProb || 0) * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-[var(--card-elevated)] p-3 rounded border border-[var(--border)]">
                <div className="text-xs text-[var(--text-secondary)]">Projected depth band</div>
                <div className="text-2xl font-bold font-telemetry mt-1 text-amber-300">
                  {currentDepthBand}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-telemetry text-[var(--text-secondary)]">
              <div className="flex justify-between py-1 border-b border-[var(--border)]/60">
                <span>Hydraulic model engine:</span>
                <span className="text-[var(--text-primary)] font-semibold">2D Overland Shallow-Water (Replay)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]/60">
                <span>Model state artifact:</span>
                <span className="text-sky-400 font-mono truncate max-w-[200px]">{inun.risk_uri}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Topographic mesh resolution:</span>
                <span className="text-[var(--text-primary)]">5m DEM (Adyar Catchment)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
            Depth bands: nominal (&lt;0.1m) · moderate (0.3–0.5m) · critical (0.5–1.0m+)
          </div>
        </div>

      </div>
    </div>
  );
}
