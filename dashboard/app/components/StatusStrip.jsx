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
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
          </span>
          <span className="font-semibold tracking-wide text-[var(--text-primary)] text-[11px] font-telemetry uppercase">
            {dataSource === "LIVE"
              ? "LIVE PRODUCER TELEMETRY"
              : dataSource === "MIXED"
              ? "MIXED PROVIDER STREAM"
              : "PRECOMPUTED REPLAY (PROTOTYPE)"}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-telemetry border-l border-[var(--border)] pl-2">
            CHENNAI-ADYAR-CATCHMENT
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
          <span className={`h-2 w-2 rounded-full ${statusTag === "VERIFIED" ? "bg-[var(--safe)] shadow-sm shadow-emerald-500/40" : "bg-[var(--warning)]"}`}></span>
          <span className="font-telemetry font-bold text-[11px] text-[var(--text-primary)]">
            {statusTag === "VERIFIED" ? "VERIFIED 🟢" : "PROTOTYPE 🟡"}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">
            {statusTag === "VERIFIED" ? "Deterministic Validation Passed" : "Replay Simulation"}
          </span>
        </div>

        {isRadarOutage && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
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
          <span className="text-[var(--text-muted)] text-[10px] uppercase font-semibold">Gateway Latency:</span>
          <span className="text-[var(--text-primary)] font-bold">p50 7.0ms</span>
          <span className="text-slate-300">/</span>
          <span className="text-[var(--text-primary)] font-bold">p95 9.2ms</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <span className={`h-2 w-2 rounded-full ${apiConnected ? "bg-[var(--safe)] shadow-sm shadow-emerald-500/40" : "bg-rose-600 animate-pulse"}`}></span>
          <span className={apiConnected ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
            {apiConnected ? "FastAPI Online" : "Gateway Offline"}
          </span>
        </div>

        <span className="px-2 py-1 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--text-muted)] text-[10px] font-bold">
          MOD_4 INTEGRATED
        </span>
      </div>
    </div>
  );
}
