"use client";

import { ZONE_COORDINATES } from "../data/fallback";

export default function ZoneMap({ selectedZoneId, onSelectZone }) {
  const activeZone = ZONE_COORDINATES[selectedZoneId] || ZONE_COORDINATES.Z42;

  const zonePositions = {
    Z42: { top: "60%", left: "48%" },
    Z18: { top: "45%", left: "55%" },
    Z07: { top: "35%", left: "58%" },
    Z29: { top: "75%", left: "25%" },
    Z12: { top: "30%", left: "75%" },
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white">Spatial Risk & Zone Locator</h2>
          <p className="text-xs text-slate-400">Chennai Metropolitan Basin • GCC Grid</p>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
          {activeZone.lat}° N, {activeZone.lng}° E
        </span>
      </div>

      <div className="relative h-64 md:h-72 w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 500 300">
          <path d="M 380 0 Q 370 80 390 150 T 400 300" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="4 4" />
          <text x="405" y="150" fill="#0284c7" fontSize="12" fontFamily="monospace">Bay of Bengal</text>
          <path d="M 100 160 Q 250 140 390 150" fill="none" stroke="#0369a1" strokeWidth="2" />
          <text x="170" y="145" fill="#0284c7" fontSize="10" fontFamily="monospace">Adyar River</text>
        </svg>

        <div className="relative w-full h-full">
          {Object.entries(ZONE_COORDINATES).map(([zId, zData]) => {
            const isActive = selectedZoneId === zId;
            const pos = zonePositions[zId] || { top: "50%", left: "50%" };

            return (
              <div
                key={zId}
                style={{ top: pos.top, left: pos.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer"
                onClick={() => onSelectZone && onSelectZone(zId)}
              >
                {isActive && (
                  <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping"></span>
                )}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all ${
                    isActive
                      ? "bg-rose-600 text-white border-rose-300 scale-110 shadow-lg shadow-rose-900/50 z-20"
                      : "bg-slate-900/90 text-slate-400 border-slate-700 hover:border-slate-500 z-10"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-white" : "bg-cyan-400"}`}></span>
                  <span>{zId}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Target: <strong className="text-white">{activeZone.name}</strong></span>
        <span>Topography: <strong className="text-cyan-400">{activeZone.floodArea}</strong></span>
      </div>
    </div>
  );
}