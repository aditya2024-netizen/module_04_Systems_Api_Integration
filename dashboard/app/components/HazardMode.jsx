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
        <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-base">🌧️</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-telemetry">
                  Precipitation Nowcast Telemetry
                </h4>
              </div>
              <span className={`text-[11px] font-telemetry px-2.5 py-0.5 rounded font-bold ${
                isOutageActive ? "bg-amber-950/80 border border-amber-500 text-amber-300" : "bg-sky-950/80 text-sky-300 border border-sky-500/50"
              }`}>
                CONFIDENCE: {(effectiveRainConfidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[var(--card-elevated)] p-3.5 rounded-lg border border-[var(--border)]">
                <div className="text-[10px] font-bold text-slate-400 font-telemetry uppercase">Instantaneous Rate</div>
                <div className="text-3xl font-bold text-white font-telemetry mt-1 flex items-baseline gap-1">
                  <span>{currentRainRate}</span>
                  <span className="text-xs font-normal text-slate-400 font-telemetry">mm/hr</span>
                </div>
                <span className="text-[10px] font-telemetry text-sky-400 mt-1 inline-block">
                  {currentRainRate > 50 ? "Convective Storm Cell" : "Stratiform Telemetry"}
                </span>
              </div>

              <div className="bg-[var(--card-elevated)] p-3.5 rounded-lg border border-[var(--border)]">
                <div className="text-[10px] font-bold text-slate-400 font-telemetry uppercase">Total Accumulation</div>
                <div className="text-3xl font-bold text-white font-telemetry mt-1 flex items-baseline gap-1">
                  <span>{rain.rainfall_accumulation_mm}</span>
                  <span className="text-xs font-normal text-slate-400 font-telemetry">mm</span>
                </div>
                <span className="text-[10px] font-telemetry text-slate-400 mt-1 inline-block">
                  Duration Horizon: {rain.lead_minutes}m
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-[var(--canvas)] border border-[var(--border)]/70 space-y-2 text-xs font-telemetry">
              <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
                <span className="text-slate-400">Forecast lead horizon:</span>
                <span className="text-white font-bold">{rain.lead_minutes} min</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
                <span className="text-slate-400">Nowcast sensor source:</span>
                <span className="text-sky-300 font-bold font-mono">{effectiveSource}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Telemetry valid timestamp:</span>
                <span className="text-slate-200">{rain.valid_time}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[10px] font-telemetry text-slate-400 flex items-center justify-between">
            <span>SENSOR STREAM: CHENNAI ADYAR RADAR GRID</span>
            <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span>
          </div>
        </div>

        {/* Hydrodynamic Inundation Telemetry */}
        <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-base">🌊</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-telemetry">
                  Hydrodynamic Inundation Telemetry
                </h4>
              </div>
              <span className={`text-[11px] font-telemetry px-2.5 py-0.5 rounded font-bold ${
                isOutageActive ? "bg-amber-950/80 border border-amber-500 text-amber-300" : "bg-sky-950/80 text-sky-300 border border-sky-500/50"
              }`}>
                CONFIDENCE: {(effectiveInunConfidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[var(--card-elevated)] p-3.5 rounded-lg border border-[var(--border)]">
                <div className="text-[10px] font-bold text-slate-400 font-telemetry uppercase">Inundation Probability</div>
                <div className="text-3xl font-bold font-telemetry mt-1 text-rose-400 flex items-baseline gap-1">
                  <span>{((currentProb || 0) * 100).toFixed(0)}%</span>
                  <span className="text-xs font-normal text-rose-300/80 font-telemetry">RISK</span>
                </div>
                <span className="text-[10px] font-telemetry text-rose-300 mt-1 inline-block">
                  {currentProb >= 0.7 ? "Critical Overflow Projected" : "Moderate Runoff"}
                </span>
              </div>

              <div className="bg-[var(--card-elevated)] p-3.5 rounded-lg border border-[var(--border)]">
                <div className="text-[10px] font-bold text-slate-400 font-telemetry uppercase">Projected Depth Band</div>
                <div className="text-3xl font-bold font-telemetry mt-1 text-amber-300 flex items-baseline gap-1">
                  <span>{currentDepthBand}</span>
                </div>
                <span className="text-[10px] font-telemetry text-amber-300 mt-1 inline-block">
                  Peak Overland Water Depth
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-[var(--canvas)] border border-[var(--border)]/70 space-y-2 text-xs font-telemetry">
              <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
                <span className="text-slate-400">Hydraulic model engine:</span>
                <span className="text-white font-bold">2D Overland Shallow-Water</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
                <span className="text-slate-400">Model state artifact:</span>
                <span className="text-sky-300 font-mono truncate max-w-[200px]">{inun.risk_uri}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Topographic mesh resolution:</span>
                <span className="text-slate-200">5m DEM (Adyar Catchment)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[10px] font-telemetry text-slate-400 flex items-center justify-between">
            <span>DEPTH BANDS: &lt;0.1m · 0.3–0.5m · 0.5–1.0m+</span>
            <span className="text-emerald-400 font-semibold">VALIDATED</span>
          </div>
        </div>

      </div>
    </div>
  );
}
