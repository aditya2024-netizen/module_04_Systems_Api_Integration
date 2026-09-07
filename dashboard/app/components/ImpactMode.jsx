"use client";

import { useState } from "react";

export default function ImpactMode({ eventData }) {
  const basePop = eventData?.impact?.population_exposed || 21400;
  const baseAssets = eventData?.impact?.critical_assets ?? 3;
  const baseRoads = eventData?.impact?.roads_affected ?? 2;
  const baseProb = eventData?.inundation?.flood_probability || 0.8;
  const baseRain = eventData?.rainfall?.rainfall_mm_hr || 87.0;
  const areaType = eventData?.location?.flood_area_type || "Depression Basin";

  // What-If Simulator State
  const [rainModifier, setRainModifier] = useState(0); // -50% to +100%
  const [drainageCapacity, setDrainageCapacity] = useState(60); // 20% to 100%
  const [tideLevel, setTideLevel] = useState(0.8); // 0.0m to 2.5m

  // Compute What-If Simulation
  const rainMultiplier = 1 + rainModifier / 100;
  const drainageFactor = 1 - ((drainageCapacity - 60) / 100) * 0.4;
  const tideFactor = 1 + (tideLevel - 0.8) * 0.35;

  const simulatedProb = Math.min(
    0.98,
    Math.max(0.08, baseProb * rainMultiplier * drainageFactor * tideFactor)
  );

  let simulatedDepth = "<0.1m";
  if (simulatedProb >= 0.75) simulatedDepth = "0.5-1.0m+";
  else if (simulatedProb >= 0.45) simulatedDepth = "0.3-0.5m";
  else if (simulatedProb >= 0.25) simulatedDepth = "0.1-0.3m";

  const simulatedPop = Math.round(basePop * (simulatedProb / (baseProb || 0.8)));
  const popDelta = simulatedPop - basePop;

  const handleReset = () => {
    setRainModifier(0);
    setDrainageCapacity(60);
    setTideLevel(0.8);
  };

  // Demographic breakdowns
  const childrenPop = Math.round(basePop * 0.18);
  const elderlyPop = Math.round(basePop * 0.14);
  const vulnerableHousingPop = Math.round(basePop * 0.38);

  return (
    <div className="space-y-6">
      {/* 1. Demographic & Infrastructure Exposure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Population Vulnerability */}
        <div className="panel-technical corner-accents p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-600 ring-2 ring-rose-500/20"></span>
                <span className="label-tactical">DEMOGRAPHIC EXPOSURE MATRIX (PROTOTYPE SENSITIVITY HEURISTIC)</span>
              </div>
              <span className="text-[11px] font-telemetry px-2 py-0.5 rounded bg-rose-50 border border-rose-300 text-rose-700 font-semibold tracking-wide">
                HIGH RISK EXPOSURE
              </span>
            </div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-mono">Total exposed zone population</div>
              <div className="text-3xl font-extrabold font-telemetry text-[var(--text-primary)] mt-1 flex items-baseline gap-2">
                {basePop.toLocaleString()}
                <span className="text-xs font-normal text-[var(--text-secondary)] font-sans">residents within active hazard envelope</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                    <span>Children under 10 years (18%)</span>
                  </span>
                  <span className="font-telemetry text-[var(--text-primary)] font-bold">{childrenPop.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                  <div className="bg-gradient-to-r from-sky-600 to-sky-400 h-full rounded-full transition-all duration-500" style={{ width: "18%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    <span>Elderly over 65 years (14%)</span>
                  </span>
                  <span className="font-telemetry text-[var(--text-primary)] font-bold">{elderlyPop.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: "14%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                    <span>Ground-floor informal housing (38%)</span>
                  </span>
                  <span className="font-telemetry text-[var(--text-primary)] font-bold">{vulnerableHousingPop.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                  <div className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full transition-all duration-500" style={{ width: "38%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] flex justify-between font-mono">
            <span>DATA SOURCE: GCC CENSUS ESTIMATE (PROTOTYPE RATIO HEURISTIC)</span>
            <span className="text-sky-700 font-telemetry font-bold">EPSG:4326 CALIBRATED</span>
          </div>
        </div>

        {/* Critical Infrastructure Assets */}
        <div className="panel-technical corner-accents p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-400/20"></span>
                <span className="label-tactical">CRITICAL INFRASTRUCTURE DEFENSE (PROTOTYPE ASSETS)</span>
              </div>
              <span className="text-[11px] font-telemetry px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 font-semibold tracking-wide">
                PRIORITY ASSET PROTECTION
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="panel-elevated p-3 rounded text-center">
                <div className="text-2xl font-extrabold font-telemetry text-rose-600">
                  {baseAssets}
                </div>
                <div className="text-[10px] uppercase font-mono text-[var(--text-muted)] mt-1 font-semibold">Hospitals / Clinics</div>
              </div>

              <div className="panel-elevated p-3 rounded text-center">
                <div className="text-2xl font-extrabold font-telemetry text-amber-700">
                  1
                </div>
                <div className="text-[10px] uppercase font-mono text-[var(--text-muted)] mt-1 font-semibold">Power Substation</div>
              </div>

              <div className="panel-elevated p-3 rounded text-center">
                <div className="text-2xl font-extrabold font-telemetry text-sky-700">
                  {baseRoads}
                </div>
                <div className="text-[10px] uppercase font-mono text-[var(--text-muted)] mt-1 font-semibold">Arterial Roads</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-telemetry">
              <div className="p-2 rounded panel-elevated flex items-center justify-between">
                <span className="text-[var(--text-primary)] font-medium">Velachery Primary Health Centre:</span>
                <span className="text-rose-700 font-semibold text-[11px] px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">Preposition Sandbags</span>
              </div>
              <div className="p-2 rounded panel-elevated flex items-center justify-between">
                <span className="text-[var(--text-primary)] font-medium">110kV TANGEDCO Substation:</span>
                <span className="text-amber-800 font-semibold text-[11px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">Standby Dewatering Pump</span>
              </div>
              <div className="p-2 rounded panel-elevated flex items-center justify-between">
                <span className="text-[var(--text-primary)] font-medium">Adyar Feeder Arterial Bridges:</span>
                <span className="text-sky-800 font-semibold text-[11px] px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200">Traffic Barricades Staged</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] flex justify-between font-mono">
            <span>REGISTRY: PROTOTYPE PRIORITY ASSET ARCHETYPES · ADYAR PILOT</span>
            <span className="text-emerald-700 font-telemetry font-bold">STATUS: STAGED</span>
          </div>
        </div>

      </div>

      {/* 2. "Why this alert?" Feature Contribution / Explainability Breakdown */}
      <div className="panel-technical corner-accents p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500 ring-2 ring-sky-400/20"></span>
              <span className="label-tactical">HYDRODYNAMIC ATTRIBUTION & EXPLAINABILITY (PROTOTYPE)</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Factor contribution weights synthesized from 2D hydro-accumulation heuristic. Formal SHAP attribution awaits live R&amp;D-1/R&amp;D-2 ML pipeline.
            </p>
          </div>
          <span className="text-[11px] font-telemetry px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-300 font-semibold shrink-0">
            PROTOTYPE SENSITIVITY HEURISTIC (&quot;Why this alert?&quot;)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="panel-elevated p-3.5 rounded">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-medium">Antecedent Saturation</span>
              <span className="font-telemetry font-bold text-rose-600 text-sm">34%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden border border-slate-300">
              <div className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full transition-all duration-500" style={{ width: "34%" }}></div>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-2 font-mono">
              Near 92% antecedent saturation from prior 48h rains
            </div>
          </div>

          <div className="panel-elevated p-3.5 rounded">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-medium">Peak Rain Burst</span>
              <span className="font-telemetry font-bold text-amber-700 text-sm">28%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden border border-slate-300">
              <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: "28%" }}></div>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-2 font-mono">
              High intensity convective burst ({baseRain} mm/hr)
            </div>
          </div>

          <div className="panel-elevated p-3.5 rounded">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-medium">Canal Bottleneck</span>
              <span className="font-telemetry font-bold text-sky-700 text-sm">22%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden border border-slate-300">
              <div className="bg-gradient-to-r from-sky-600 to-sky-400 h-full rounded-full transition-all duration-500" style={{ width: "22%" }}></div>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-2 font-mono">
              Adyar river outlet hydraulic constriction at culvert
            </div>
          </div>

          <div className="panel-elevated p-3.5 rounded">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-medium">Tidal Surge Backflow</span>
              <span className="font-telemetry font-bold text-indigo-700 text-sm">16%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden border border-slate-300">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: "16%" }}></div>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-2 font-mono">
              Coastal high-tide elevation impeding canal discharge
            </div>
          </div>
        </div>

        <div className="mt-3.5 p-3 rounded panel-elevated text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
          <span className="text-sky-600 text-base leading-none">ℹ</span>
          <div>
            <strong className="text-[var(--text-primary)] uppercase tracking-wider font-mono text-[11px]">Prototype Sensitivity Heuristic: </strong>
            Inundation hazard is primarily driven by saturation-excess overland runoff rather than infiltration deficit. Convective precipitation of {baseRain} mm/hr immediately translates to rapid surface pooling due to depressed basin topography ({areaType}).
          </div>
        </div>
      </div>

      {/* 3. Interactive What-if Simulator */}
      <div className="panel-technical corner-accents p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-400/20"></span>
              <span className="label-tactical">WHAT-IF OPERATIONAL SCENARIO SIMULATOR</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Dynamically manipulate hydrometeorological parameters to test operational mitigation thresholds
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="cursor-pointer px-3 py-1.5 text-xs rounded border border-[var(--border)] bg-[var(--card-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-400 transition-all shrink-0 font-mono"
          >
            ↺ RESET BASELINE
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Slider 1: Rainfall Modifier */}
          <div className="p-3.5 rounded panel-elevated space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-primary)] font-medium">Rainfall Intensity Multiplier</span>
              <span className="font-telemetry font-bold text-sky-700 text-sm">
                {rainModifier > 0 ? `+${rainModifier}%` : `${rainModifier}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="10"
              value={rainModifier}
              onChange={(e) => setRainModifier(Number(e.target.value))}
              className="w-full cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-telemetry">
              <span>-50% (Subsiding)</span>
              <span>0% (Current)</span>
              <span>+100% (Deluge)</span>
            </div>
          </div>

          {/* Slider 2: Drainage Capacity */}
          <div className="p-3.5 rounded panel-elevated space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-primary)] font-medium">Canal Desilt / Dewater Rate</span>
              <span className="font-telemetry font-bold text-emerald-700 text-sm">
                {drainageCapacity}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="10"
              value={drainageCapacity}
              onChange={(e) => setDrainageCapacity(Number(e.target.value))}
              className="w-full cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-telemetry">
              <span>20% (Choked)</span>
              <span>60% (Nominal)</span>
              <span>100% (Max Pumped)</span>
            </div>
          </div>

          {/* Slider 3: High-Tide Level */}
          <div className="p-3.5 rounded panel-elevated space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-primary)] font-medium">High Tide / Surge Elevation</span>
              <span className="font-telemetry font-bold text-amber-700 text-sm">
                {tideLevel.toFixed(1)}m
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.5"
              step="0.1"
              value={tideLevel}
              onChange={(e) => setTideLevel(Number(e.target.value))}
              className="w-full cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-telemetry">
              <span>0.0m (Low Tide)</span>
              <span>0.8m (Mean)</span>
              <span>2.5m (Storm Surge)</span>
            </div>
          </div>

        </div>

        {/* Live Simulation Outcomes Bar */}
        <div className="p-4 rounded-lg panel-elevated flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="label-tactical text-[10px]">
              SIMULATED INUNDATION OUTCOME
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold font-telemetry text-rose-600">
                {simulatedDepth}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                (Prob: {(simulatedProb * 100).toFixed(0)}%)
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="label-tactical text-[10px]">
              SIMULATED EXPOSED POPULATION
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold font-telemetry text-[var(--text-primary)]">
                {simulatedPop.toLocaleString()}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded font-mono ${
                popDelta > 0
                  ? "bg-rose-50 text-rose-700 border border-rose-300"
                  : popDelta < 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                  : "bg-slate-200 text-slate-700 border border-slate-300"
              }`}>
                {popDelta > 0 ? `+${popDelta.toLocaleString()} exposed` : popDelta < 0 ? `${popDelta.toLocaleString()} safeguarded` : "Baseline match"}
              </span>
            </div>
          </div>

          <div className="text-xs text-[var(--text-secondary)] max-w-sm">
            {drainageCapacity >= 80 && rainModifier <= 0 ? (
              <span className="text-emerald-700 flex items-center gap-1.5 font-semibold">
                <span>✓</span> Aggressive dewatering mitigates peak flood band below critical thresholds.
              </span>
            ) : rainModifier > 40 || tideLevel > 1.5 ? (
              <span className="text-rose-700 flex items-center gap-1.5 font-semibold">
                <span>⚠️</span> Severe backflow overwhelmed local drainage. Mandatory evacuation indicated.
              </span>
            ) : (
              <span className="text-[var(--text-secondary)]">Nominal operational mitigation bounds maintained.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
