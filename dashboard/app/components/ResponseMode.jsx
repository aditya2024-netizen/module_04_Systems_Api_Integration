"use client";

import { useState, useEffect } from "react";

export default function ResponseMode({
  eventData,
  availableEvents = [],
  onSelectEvent,
  onOpenCapDrawer,
}) {
  const [dispatchedActions, setDispatchedActions] = useState({});
  const [countdownSeconds, setCountdownSeconds] = useState(1185); // ~19m 45s

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const route = eventData?.response_route || {
    incident_id: "INC-01",
    title: "Critical Inundation Response",
    lead_time: "T-20 min",
    risk_score: 0.85,
    impassable_road: "Low-Lying Roadway Segment",
    safe_route: "Designated Arterial Elevated Bypass",
    milestones: [
      { time: "T-20 min", label: "Low-lying segments become impassable" },
      { time: "T-35 min", label: "Overland flood surge reaches residential culverts" },
      { time: "T-70 min", label: "Projected peak inundation depth" }
    ]
  };

  const handleToggleAction = (actionKey) => {
    setDispatchedActions((prev) => {
      const isAlreadyDispatched = !!prev[actionKey];
      if (isAlreadyDispatched) {
        const next = { ...prev };
        delete next[actionKey];
        return next;
      } else {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        return { ...prev, [actionKey]: timeStr };
      }
    });
  };

  const handleDispatchAll = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const all = {};
    (eventData?.actions || []).forEach((act) => {
      all[act] = timeStr;
    });
    setDispatchedActions(all);
  };

  const actionLabels = {
    ALERT: "Issue Mass Emergency Evacuation Alert",
    CLOSE_ROAD: "Close Vulnerable Road Arterials & Underpasses",
    DEPLOY_TEAM: "Deploy Quick Response Disaster Rescue Unit",
    PREPOSITION_PUMPS: "Preposition Heavy Dewatering High-Flow Pumps",
    MONITOR_CULVERTS: "Deploy Culvert Silt Inspection Crews",
    TRAFFIC_DIVERSION: "Execute Commercial Traffic Diversion Plan",
    CLEAR_STORM_DRAINS: "Clear High-Risk Storm Drain Chokes",
    ADVISORY_ISSUED: "Broadcast Public Weather Advisory via GCC Cell",
    MONITOR_GAUGES: "Enable High-Frequency Gauge Sampling (5-min)",
    ROUTINE_MONITORING: "Maintain Standard Basin Telemetry Watch",
  };

  return (
    <div className="space-y-6">
      {/* 1. Incident Queue Selector & Priority Header */}
      <div className="panel-technical corner-accents p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20"></span>
              <span className="label-tactical">ACTIVE INCIDENT RESPONSE QUEUE (PROTOTYPE FOCUS)</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select incident focus to inspect simulated choke points, safe routing, and dispatch protocols
            </p>
          </div>
          <span className="text-[11px] font-telemetry px-2.5 py-1 rounded bg-[var(--card-elevated)] text-[var(--text-secondary)] border border-[var(--border)] font-mono shrink-0">
            QUEUE: {availableEvents.length} SCENARIOS LOADED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {availableEvents.map((ev) => {
            const isSelected = ev.event_id === eventData.event_id;
            return (
              <button
                key={ev.event_id}
                type="button"
                onClick={() => onSelectEvent(ev.event_id)}
                className={`cursor-pointer p-3.5 rounded-lg text-left border transition-all ${
                  isSelected
                    ? "bg-rose-950/40 border-rose-500 text-white shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/30"
                    : "panel-elevated border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-telemetry text-xs font-bold tracking-wider">{ev.event_id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono tracking-wider ${
                    ev.priority === "CRITICAL" ? "bg-rose-600/90 text-white border border-rose-400/40" : ev.priority === "HIGH" ? "bg-amber-600/90 text-white border border-amber-400/40" : "bg-slate-700 text-slate-200"
                  }`}>
                    {ev.priority}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)] mt-1.5 truncate">
                  {ev.zone_name || ev.zone_id}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-telemetry mt-2.5 pt-2 border-t border-[var(--border)]">
                  <span className="font-mono">ZONE: {ev.zone_id}</span>
                  <span className={isSelected ? "text-rose-400 font-semibold" : "text-slate-400"}>
                    {isSelected ? "● ACTIVE TARGET" : "SELECT FOCUS"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Time-to-Impact Clock & Routing Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Time-to-Impact Countdown Clock */}
        <div className="panel-technical corner-accents p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-rose-500/20"></span>
                <span className="label-tactical">TIME-TO-IMPACT HORIZON</span>
              </div>
              <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-semibold font-mono">
                SIMULATED HORIZON
              </span>
            </div>

            <div className="mt-4 text-center py-3 bg-[var(--canvas)] rounded-lg border border-rose-900/50 shadow-inner">
              <div className="text-[10px] text-rose-300 uppercase tracking-widest font-mono">
                ESTIMATED INUNDATION CHOKE
              </div>
              <div className="text-4xl font-black font-telemetry text-rose-500 tracking-widest mt-1">
                T - {timeFormatted}
              </div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400 mt-1">
                Until primary arterial cutoff
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="label-tactical text-[10px]">
                SEQUENCE OF IMPENDING MILESTONES:
              </div>
              <div className="space-y-1.5 font-telemetry text-xs">
                {(route.milestones || []).map((ms, idx) => (
                  <div key={idx} className="p-2 rounded panel-elevated flex items-center justify-between">
                    <span className="text-slate-300">{ms.label}</span>
                    <span className="text-rose-400 font-semibold font-mono shrink-0 ml-2">{ms.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[10px] text-[var(--text-secondary)] font-mono">
            CALIBRATION: 2D HYDRO-ACCUMULATION PROFILE (REPLAY BASELINE)
          </div>
        </div>

        {/* Evacuation & Safe Routing Box (Span 2) */}
        <div className="lg:col-span-2 panel-technical corner-accents p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20"></span>
                <span className="label-tactical">SIMULATED EVACUATION CORRIDOR & ROUTING</span>
              </div>
              <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold font-mono">
                PROTOTYPE CORRIDOR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/50">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase font-mono tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>Simulated Choke Point</span>
                </div>
                <div className="text-sm font-bold text-white mt-1.5">
                  {route.impassable_road}
                </div>
                <div className="text-xs text-rose-200/70 mt-1">
                  Water level projected &gt;0.6m. Impassable for light vehicular traffic.
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase font-mono tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Safe Recommended Route (Simulated)</span>
                </div>
                <div className="text-sm font-bold text-white mt-1.5">
                  {route.safe_route}
                </div>
                <div className="text-xs text-emerald-200/70 mt-1">
                  Elevated arterial bypass corridor clear of projected flood hazard envelope.
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-lg panel-elevated flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide font-mono">
                  CAP v1.2 / SACHET Emergency Alert Generator
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Generate OASIS-compliant XML emergency alert payload for validation and handoff
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenCapDrawer}
                className="cursor-pointer px-4 py-2 text-xs font-bold rounded-md bg-[var(--critical)] text-white hover:brightness-110 transition-all shrink-0 shadow-md shadow-rose-950/40 flex items-center gap-2 font-mono"
              >
                <span>🚨</span>
                <span>GENERATE CAP ALERT PAYLOAD</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[10px] text-[var(--text-secondary)] flex justify-between items-center font-mono">
            <span>TACTICAL ROUTING STATUS: REPLAY PROTOTYPE</span>
            <span className="font-telemetry text-emerald-400">✓ CORRIDOR AVAILABLE</span>
          </div>
        </div>

      </div>

      {/* 3. Action Dispatch Checklist */}
      <div className="panel-technical corner-accents p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400 ring-2 ring-sky-400/20"></span>
              <span className="label-tactical">TACTICAL ACTION PROTOCOLS & COMMAND DISPATCH</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Verify and authorize specific municipal protocols recommended by the decision engine
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDispatchAll}
              className="cursor-pointer px-3.5 py-1.5 text-xs font-bold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors font-mono tracking-wider"
            >
              ✓ AUTHORIZE ALL PROTOCOLS
            </button>
            {Object.keys(dispatchedActions).length > 0 && (
              <button
                type="button"
                onClick={() => setDispatchedActions({})}
                className="cursor-pointer px-3 py-1.5 text-xs rounded border border-[var(--border)] bg-[var(--card-elevated)] text-[var(--text-secondary)] hover:text-white transition-colors font-mono"
              >
                RESET
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {(eventData?.actions || []).map((act) => {
            const isDispatched = !!dispatchedActions[act];

            return (
              <button
                key={act}
                type="button"
                onClick={() => handleToggleAction(act)}
                className={`w-full text-left p-3.5 rounded-lg transition-all cursor-pointer flex items-center justify-between border ${
                  isDispatched
                    ? "bg-emerald-950/50 border-emerald-500/70 text-emerald-200 shadow-sm"
                    : "panel-elevated border-[var(--border)] text-slate-200 hover:border-slate-500 active:scale-[0.99]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ring-2 ${
                    isDispatched ? "bg-emerald-400 ring-emerald-400/30" : "bg-rose-500 ring-rose-500/30"
                  }`}></span>
                  <div>
                    <div className="text-xs font-bold tracking-wide">
                      {actionLabels[act] || act}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      PROTOCOL ID: <code className="font-telemetry text-slate-300">{act}</code>
                    </div>
                  </div>
                </div>

                <span className={`text-[11px] font-semibold px-3 py-1 rounded font-mono ${
                  isDispatched
                    ? "bg-emerald-900/80 text-emerald-300 border border-emerald-600/50"
                    : "bg-[var(--card)] text-slate-400 border border-[var(--border)] hover:text-white"
                }`}>
                  {isDispatched ? `✓ AUTHORIZED (${dispatchedActions[act]})` : "CLICK TO AUTHORIZE"}
                </span>
              </button>
            );
          })}
        </div>

        {Object.keys(dispatchedActions).length > 0 && (
          <div className="mt-4 p-2.5 rounded bg-emerald-950/40 border border-emerald-700/50 text-xs text-emerald-300 flex items-center justify-between font-mono">
            <span>{Object.keys(dispatchedActions).length} ACTION PROTOCOL(S) ACTIVE IN COMMAND QUEUE</span>
            <span className="font-telemetry text-[11px]">PROTOTYPE DISPATCH RECORDED</span>
          </div>
        )}
      </div>

    </div>
  );
}
