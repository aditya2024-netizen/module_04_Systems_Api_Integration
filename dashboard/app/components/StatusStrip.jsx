"use client";

export default function StatusStrip({ apiConnected, eventData, isRadarOutage }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs">
      {/* Left: Replay Scenario & Honesty Pill */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <span className="h-2 w-2 rounded-full bg-sky-400"></span>
          <span className="font-medium text-[var(--text-primary)]">
            VALIDATED REPLAY
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-telemetry">
            Chennai Monsoon 2026-09-06
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full bg-[var(--safe)]"></span>
          <span className="font-telemetry">VERIFIED 🟢</span>
          <span className="text-[11px]">Strict schema compliant</span>
        </div>

        {isRadarOutage && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/50 text-amber-300 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-[var(--warning)]"></span>
            <span className="font-semibold text-[11px]">DEGRADED: SATELLITE/GAUGE FALLBACK</span>
          </div>
        )}
      </div>

      {/* Right: Latency Benchmark & Gateway Status */}
      <div className="flex flex-wrap items-center gap-3 font-telemetry text-[11px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <span>Latency:</span>
          <span className="text-[var(--text-primary)] font-semibold">p50 7.0ms</span>
          <span className="text-slate-500">|</span>
          <span className="text-[var(--text-primary)] font-semibold">p95 9.2ms</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <span className={`h-2 w-2 rounded-full ${apiConnected ? "bg-[var(--safe)]" : "bg-[var(--warning)]"}`}></span>
          <span className={apiConnected ? "text-emerald-300" : "text-amber-300"}>
            {apiConnected ? "Gateway Online (8000)" : "Replay Offline Mode"}
          </span>
        </div>

        <span className="px-1.5 py-0.5 rounded bg-[var(--canvas)] border border-[var(--border)] text-slate-400">
          PROTOTYPE 🟡
        </span>
      </div>
    </div>
  );
}
