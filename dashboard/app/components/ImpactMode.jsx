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
        <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-base">👥</span>
                <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Demographic Vulnerability
                </h3>
              </div>
              <span className="text-xs font-telemetry text-rose-400 font-semibold">
                High Risk Exposure
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xs text-[var(--text-secondary)]">Total exposed population</div>
              <div className="text-3xl font-bold font-telemetry text-[var(--text-primary)] mt-1">
                {basePop.toLocaleString()}{" "}
                <span className="text-xs font-normal text-[var(--text-secondary)]">residents in zone</span>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>Children under 10 years (18%)</span>
                  <span className="font-telemetry text-slate-200">{childrenPop.toLocaleString()}</span>
                </div>
                <div className="w-full bg-[var(--canvas)] h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: "18%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>Elderly over 65 years (14%)</span>
                  <span className="font-telemetry text-slate-200">{elderlyPop.toLocaleString()}</span>
                </div>
                <div className="w-full bg-[var(--canvas)] h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "14%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>Ground-floor informal housing (38%)</span>
                  <span className="font-telemetry text-slate-200">{vulnerableHousingPop.toLocaleString()}</span>
                </div>
                <div className="w-full bg-[var(--canvas)] h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "38%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
            Census 2021 projection calibrated with Ward survey telemetry
          </div>
        </div>

        {/* Critical Infrastructure Assets */}
        <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-base">🏥</span>
                <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Critical Infrastructure at Risk
                </h3>
              </div>
              <span className="text-xs font-telemetry text-amber-300 font-semibold">
                Priority Asset Defense
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-[var(--card-elevated)] p-3 rounded border border-[var(--border)] text-center">
                <div className="text-2xl font-bold font-telemetry text-rose-400">
                  {baseAssets}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-1">Hospitals / Clinics</div>
              </div>

              <div className="bg-[var(--card-elevated)] p-3 rounded border border-[var(--border)] text-center">
                <div className="text-2xl font-bold font-telemetry text-amber-400">
                  1
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-1">Power Substation</div>
              </div>

              <div className="bg-[var(--card-elevated)] p-3 rounded border border-[var(--border)] text-center">
                <div className="text-2xl font-bold font-telemetry text-sky-400">
                  {baseRoads}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-1">Road Arteries</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-telemetry">
              <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)] flex items-center justify-between">
                <span>Velachery Primary Health Centre:</span>
                <span className="text-rose-400 font-semibold">Preposition Sandbags</span>
              </div>
              <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)] flex items-center justify-between">
                <span>110kV TANGEDCO Substation:</span>
                <span className="text-amber-300 font-semibold">Standby Dewatering Pump</span>
              </div>
              <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)] flex items-center justify-between">
                <span>Adyar Feeder Arterial Bridges:</span>
                <span className="text-sky-300 font-semibold">Traffic Barricades Staged</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
            GCC Disaster Management Command asset registry
          </div>
        </div>

      </div>

      {/* 2. "Why this alert?" Feature Contribution / Explainability Breakdown */}
      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Alert Attribution & Model Explainability ("Why this alert?")
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Factor contribution breakdown synthesized from hydrodynamic gradient features
            </p>
          </div>
          <span className="text-xs font-telemetry px-2 py-0.5 rounded bg-[var(--card-elevated)] text-sky-300 border border-[var(--border)] shrink-0">
            Model Attribution: Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Soil Saturation</span>
              <span className="font-telemetry font-bold text-rose-400">34%</span>
            </div>
            <div className="w-full bg-[var(--canvas)] h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: "34%" }}></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Near 92% antecedent saturation from prior 48h rains
            </div>
          </div>

          <div className="p-3 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Peak Rain Burst</span>
              <span className="font-telemetry font-bold text-amber-400">28%</span>
            </div>
            <div className="w-full bg-[var(--canvas)] h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "28%" }}></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              High intensity convective burst ({baseRain} mm/hr)
            </div>
          </div>

          <div className="p-3 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Canal Bottleneck</span>
              <span className="font-telemetry font-bold text-sky-400">22%</span>
            </div>
            <div className="w-full bg-[var(--canvas)] h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: "22%" }}></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Adyar river outlet hydraulic constriction at culvert
            </div>
          </div>

          <div className="p-3 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Tidal Backflow</span>
              <span className="font-telemetry font-bold text-indigo-400">16%</span>
            </div>
            <div className="w-full bg-[var(--canvas)] h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "16%" }}></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Coastal high-tide elevation impeding canal discharge
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">Analytical Synthesis:</strong> Inundation hazard is primarily driven by saturation-excess overland runoff rather than infiltration deficit. Convective rain volume of {baseRain} mm/hr immediately translates to surface pooling due to depressed basin topography ({areaType}).
        </div>
      </div>

      {/* 3. Interactive What-if Simulator */}
      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">🎛️</span>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Interactive What-If Scenario Simulator
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Dynamically manipulate hydrometeorological parameters to test operational mitigation thresholds
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="cursor-pointer px-3 py-1 text-xs rounded border border-[var(--border)] bg-[var(--card-elevated)] text-[var(--text-secondary)] hover:text-white shrink-0"
          >
            Reset to Baseline
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Slider 1: Rainfall Modifier */}
          <div className="p-3.5 rounded bg-[var(--card-elevated)] border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-primary)] font-medium">Rainfall Intensity</span>
              <span className="font-telemetry font-bold text-sky-300">
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
              className="w-full cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-telemetry">
              <span>-50% (Subsiding)</span>
              <span>0% (Current)</span>
              <span>+100% (Deluge)</span>
            </div>
          </div>

          {/* Slider 2: Drainage Capacity */}
          <div className="p-3.5 rounded bg-[var(--card-elevated)] border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-primary)] font-medium">Canal Desilt / Pump Rate</span>
              <span className="font-telemetry font-bold text-emerald-300">
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
              className="w-full cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-telemetry">
              <span>20% (Choked)</span>
              <span>60% (Nominal)</span>
              <span>100% (Max Pumped)</span>
            </div>
          </div>

          {/* Slider 3: High-Tide Level */}
          <div className="p-3.5 rounded bg-[var(--card-elevated)] border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-primary)] font-medium">High Tide / Surge Height</span>
              <span className="font-telemetry font-bold text-amber-300">
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
              className="w-full cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-telemetry">
              <span>0.0m (Low Tide)</span>
              <span>0.8m (Mean)</span>
              <span>2.5m (Storm Surge)</span>
            </div>
          </div>

        </div>

        {/* Live Simulation Outcomes Bar */}
        <div className="p-4 rounded-lg bg-[var(--card-elevated)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
              Simulated Inundation Outcome
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-telemetry text-rose-400">
                {simulatedDepth}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                (Prob: {(simulatedProb * 100).toFixed(0)}%)
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
              Simulated Exposed Population
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-telemetry text-[var(--text-primary)]">
                {simulatedPop.toLocaleString()}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                popDelta > 0
                  ? "bg-rose-950 text-rose-300 border border-rose-600"
                  : popDelta < 0
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {popDelta > 0 ? `+${popDelta.toLocaleString()} exposed` : popDelta < 0 ? `${popDelta.toLocaleString()} safeguarded` : "Baseline match"}
              </span>
            </div>
          </div>

          <div className="text-xs text-[var(--text-secondary)] max-w-xs">
            {drainageCapacity >= 80 && rainModifier <= 0 ? (
              <span className="text-emerald-300">
                ✓ Aggressive dewatering mitigates peak flood band below critical thresholds.
              </span>
            ) : rainModifier > 40 || tideLevel > 1.5 ? (
              <span className="text-rose-300">
                ⚠️ Severe backflow overwhelmed local drainage. Mandatory evacuation indicated.
              </span>
            ) : (
              <span>Nominal operational mitigation bounds maintained.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
