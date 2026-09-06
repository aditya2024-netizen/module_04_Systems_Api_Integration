"use client";

import { useState, useEffect } from "react";
import { INCIDENTS } from "../data/fallback";

export default function ResponseMode({
  eventData,
  activeZone,
  selectedIncidentId,
  onSelectIncident,
  onOpenCapDrawer,
}) {
  const [dispatchedActions, setDispatchedActions] = useState({});
  const [countdownSeconds, setCountdownSeconds] = useState(1185); // ~19m 45s

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const activeIncident = INCIDENTS.find((i) => i.id === selectedIncidentId) || INCIDENTS[0];

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
      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Active Operational Incidents Queue
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select incident to view localized choke points, safe routing, and dispatch protocols
            </p>
          </div>
          <span className="text-xs font-telemetry px-2 py-0.5 rounded bg-[var(--card-elevated)] text-[var(--text-secondary)] border border-[var(--border)] shrink-0">
            {INCIDENTS.length} incidents in active queue
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {INCIDENTS.map((inc) => {
            const isSelected = inc.id === activeIncident.id;
            return (
              <button
                key={inc.id}
                type="button"
                onClick={() => onSelectIncident(inc.id)}
                className={`cursor-pointer p-3 rounded-lg text-left border transition-all ${
                  isSelected
                    ? "bg-rose-950/50 border-rose-500 text-white shadow-md shadow-rose-950/20"
                    : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-telemetry text-xs font-bold">{inc.id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    inc.priority === "CRITICAL" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                  }`}>
                    {inc.priority}
                  </span>
                </div>
                <div className="text-xs font-medium text-[var(--text-primary)] mt-1 truncate">
                  {inc.title}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-telemetry mt-2">
                  <span>Lead: {inc.leadTime}</span>
                  <span>Risk: {inc.riskScore}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Time-to-Impact Clock & Routing Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Time-to-Impact Countdown Clock */}
        <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Time-to-Impact Horizon
                </h4>
              </div>
              <span className="text-[11px] font-telemetry text-rose-400">
                Critical Window
              </span>
            </div>

            <div className="mt-4 text-center py-2 bg-[var(--canvas)] rounded border border-rose-900/40">
              <div className="text-[11px] text-rose-300 uppercase tracking-widest font-mono">
                Estimated Inundation Choke
              </div>
              <div className="text-4xl font-extrabold font-telemetry text-rose-500 tracking-wider mt-1">
                T - {timeFormatted}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Until primary arterial cutoff
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium text-[var(--text-primary)]">
                Sequence of Impending Milestones:
              </div>
              <div className="space-y-1.5 font-telemetry text-xs">
                {(activeIncident.milestones || []).map((ms, idx) => (
                  <div key={idx} className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)] flex items-center justify-between">
                    <span className="text-slate-300">{ms.label}</span>
                    <span className="text-rose-400 font-semibold shrink-0 ml-2">{ms.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
            Derived from 2D hydro-accumulation speed profile
          </div>
        </div>

        {/* Evacuation & Safe Routing Box (Span 2) */}
        <div className="lg:col-span-2 rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-base">🧭</span>
                <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Evacuation Routing & Corridor Advisory
                </h4>
              </div>
              <span className="text-[11px] font-telemetry text-emerald-400">
                GIS Corridor Plotted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded bg-rose-950/30 border border-rose-800/50">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>Blocked Choke Point</span>
                </div>
                <div className="text-sm font-semibold text-white mt-1.5">
                  {activeIncident.impassableRoad}
                </div>
                <div className="text-xs text-rose-200/70 mt-1">
                  Water level projected &gt;0.6m. Completely impassable for light vehicles and pedestrian traffic.
                </div>
              </div>

              <div className="p-3.5 rounded bg-emerald-950/30 border border-emerald-800/50">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Safe Recommended Route</span>
                </div>
                <div className="text-sm font-semibold text-white mt-1.5">
                  {activeIncident.safeRoute}
                </div>
                <div className="text-xs text-emerald-200/70 mt-1">
                  Elevated bypass corridor confirmed clear of flood hazard. Emergency transit priority assigned.
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded bg-[var(--card-elevated)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  Emergency Broadcast Dispatch (CAP v1.2 / SACHET)
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Transmit structured XML alert to state disaster portal and public cell broadcast gateways
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenCapDrawer}
                className="cursor-pointer px-4 py-2 text-xs font-bold rounded-md bg-[var(--critical)] text-white hover:brightness-110 transition-all shrink-0 shadow-md shadow-rose-950/30"
              >
                🚨 Generate CAP / SACHET XML Alert
              </button>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] flex justify-between items-center">
            <span>Dynamic routing engine synced to GCC traffic police feed</span>
            <span className="font-telemetry text-emerald-400">✓ Route open</span>
          </div>
        </div>

      </div>

      {/* 3. Action Dispatch Checklist */}
      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Disaster Response Action Protocols
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Verify and authorize specific municipal protocols recommended by the decision engine
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDispatchAll}
              className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
            >
              ✓ Authorize all recommendations
            </button>
            {Object.keys(dispatchedActions).length > 0 && (
              <button
                type="button"
                onClick={() => setDispatchedActions({})}
                className="cursor-pointer px-2.5 py-1.5 text-xs rounded border border-[var(--border)] bg-[var(--card-elevated)] text-[var(--text-secondary)] hover:text-white"
              >
                Reset
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
                    ? "bg-emerald-950/60 border-emerald-500/70 text-emerald-200"
                    : "bg-[var(--card-elevated)] border-[var(--border)] text-slate-200 hover:border-slate-500 hover:bg-[#141e33] active:scale-[0.99]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${isDispatched ? "bg-emerald-400" : "bg-rose-500"}`}></span>
                  <div>
                    <div className="text-xs font-bold tracking-wide">
                      {actionLabels[act] || act}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Protocol ID: <code className="font-telemetry text-slate-300">{act}</code>
                    </div>
                  </div>
                </div>

                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded ${
                  isDispatched
                    ? "bg-emerald-900/80 text-emerald-300 border border-emerald-600/50"
                    : "bg-[var(--card)] text-slate-400 border border-[var(--border)]"
                }`}>
                  {isDispatched ? `✓ Authorized (${dispatchedActions[act]})` : "Click to Authorize"}
                </span>
              </button>
            );
          })}
        </div>

        {Object.keys(dispatchedActions).length > 0 && (
          <div className="mt-4 p-2.5 rounded bg-emerald-950/40 border border-emerald-700/50 text-xs text-emerald-300 flex items-center justify-between">
            <span>{Object.keys(dispatchedActions).length} action protocol(s) active in command queue</span>
            <span className="font-telemetry text-[11px]">Command state logged</span>
          </div>
        )}
      </div>

    </div>
  );
}
