"use client";

export default function StatusStrip({ apiConnected, eventData, isRadarOutage }) {
  const dataSource = eventData?.data_source || "PRECOMPUTED_REPLAY";
  const statusTag = eventData?.status || "PROTOTYPE";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs shadow-sm">
      {/* Left: Replay Scenario & Data Source */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--card-elevated)] border border-[var(--border)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span className="font-semibold tracking-wide text-white text-[11px] font-telemetry uppercase">
            {dataSource === "LIVE"
              ? "LIVE PRODUCER TELEMETRY"
              : dataSource === "MIXED"
              ? "MIXED PROVIDER STREAM"
              : "VALIDATED REPLAY DATA"}
          </span>
          <span className="text-[10px] text-slate-400 font-telemetry border-l border-[var(--border)] pl-2">
            CHENNAI-ADYAR-CATCHMENT
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
          <span className={`h-2 w-2 rounded-full ${statusTag === "VERIFIED" ? "bg-[var(--safe)] shadow-sm shadow-emerald-500/50" : "bg-[var(--warning)]"}`}></span>
          <span className="font-telemetry font-bold text-[11px] text-slate-200">
            {statusTag === "VERIFIED" ? "VERIFIED 🟢" : "PROTOTYPE 🟡"}
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {statusTag === "VERIFIED" ? "Deterministic Validation Passed" : "Replay Simulation"}
          </span>
        </div>

        {isRadarOutage && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/50 border border-amber-500/60 text-amber-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-bold font-telemetry text-[10px] tracking-wider uppercase">
              RADAR OUTAGE: DEGRADED FALLBACK ACTIVE
            </span>
          </div>
        )}
      </div>

      {/* Right: Latency Benchmark & Gateway Status */}
      <div className="flex flex-wrap items-center gap-2.5 font-telemetry text-[11px]">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--canvas)] border border-[var(--border)]" title="API Gateway mock provider latency benchmark (results/latency.json)">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Gateway Latency:</span>
          <span className="text-slate-200 font-bold">p50 7.0ms</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-bold">p95 9.2ms</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <span className={`h-2 w-2 rounded-full ${apiConnected ? "bg-[var(--safe)] shadow-sm shadow-emerald-500/50" : "bg-rose-500 animate-pulse"}`}></span>
          <span className={apiConnected ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
            {apiConnected ? "FastAPI Online" : "Gateway Offline"}
          </span>
        </div>

        <span className="px-2 py-1 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-slate-400 text-[10px] font-bold">
          MOD_4 INTEGRATED
        </span>
      </div>
    </div>
  );
}
