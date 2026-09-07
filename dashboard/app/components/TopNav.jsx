"use client";

import React, { useState } from "react";
import { IconAlert, IconRefresh, IconTarget } from "./Icons";

export default function TopNav({
  eventsList = [],
  selectedEventId,
  onSelectEvent,
  eventData,
  isRadarOutage,
  onToggleRadarOutage,
  onOpenCapDrawer,
  apiConnected,
  onRefresh,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeEvent = eventsList.find((e) => e.event_id === selectedEventId) || {
    event_id: selectedEventId || "E001",
    zone_name: eventData?.location?.zone_name || "Velachery South",
    zone_id: eventData?.location?.zone_id || "Z42",
    priority: eventData?.priority || "CRITICAL",
  };

  const priorityColors = {
    CRITICAL: "bg-rose-50 border-rose-300 text-rose-700",
    HIGH: "bg-amber-50 border-amber-300 text-amber-800",
    MEDIUM: "bg-yellow-50 border-yellow-300 text-yellow-800",
    LOW: "bg-emerald-50 border-emerald-300 text-emerald-800",
  };

  return (
    <header className="bg-[var(--card)] border-b border-[var(--border)] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 shadow-2xs">
      {/* Left: Sector & Active Event Switcher */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sector Tag */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--canvas)] border border-[var(--border)] text-xs font-telemetry">
          <span className="h-2 w-2 rounded-full bg-sky-600"></span>
          <span className="font-bold text-[var(--text-primary)]">CHENNAI SECTOR</span>
          <span className="text-[var(--text-muted)]">|</span>
          <span className="text-[var(--text-secondary)]">ADYAR BASIN (PILOT)</span>
        </div>

        {/* Active Event Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-elevated)] hover:bg-slate-100 hover:border-slate-300 text-xs transition-all cursor-pointer shadow-2xs"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
          >
            <span className="text-[var(--text-muted)] font-telemetry uppercase text-[10px] font-bold">Focus:</span>
            <span className="font-telemetry font-bold text-sky-800">{activeEvent.event_id}</span>
            <span className="font-semibold text-[var(--text-primary)] max-w-[140px] sm:max-w-[200px] truncate">
              {activeEvent.zone_name || activeEvent.zone_id}
            </span>
            <span className={`text-[9px] font-telemetry font-bold px-1.5 py-0.5 rounded border ${priorityColors[activeEvent.priority] || priorityColors.MEDIUM}`}>
              {activeEvent.priority}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">▼</span>
          </button>

          {/* Event Picker Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute left-0 mt-1.5 w-72 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold font-telemetry uppercase text-[var(--text-muted)] border-b border-[var(--border)]">
                  Select Catchment Incident ({eventsList.length} Available)
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {eventsList.map((ev) => {
                    const isSelected = ev.event_id === selectedEventId;
                    return (
                      <button
                        key={ev.event_id}
                        type="button"
                        onClick={() => {
                          onSelectEvent(ev.event_id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-sky-50 text-sky-950 font-bold border-l-2 border-sky-600"
                            : "hover:bg-[var(--card-elevated)] text-[var(--text-secondary)]"
                        }`}
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-telemetry text-sky-700 font-bold">{ev.event_id}</span>
                            <span className="text-[var(--text-primary)] truncate">{ev.zone_name || ev.zone_id}</span>
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] font-telemetry">Zone ID: {ev.zone_id}</div>
                        </div>
                        <span className={`text-[9px] font-telemetry font-bold px-1.5 py-0.5 rounded border shrink-0 ${priorityColors[ev.priority] || priorityColors.MEDIUM}`}>
                          {ev.priority}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Operational Controls & Badges */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Radar Outage Toggle */}
        <button
          type="button"
          onClick={onToggleRadarOutage}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isRadarOutage
              ? "bg-amber-500 text-slate-950 border-amber-400 font-bold hover:bg-amber-400 shadow-xs"
              : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-300"
          }`}
          title={isRadarOutage ? "Restore Doppler Radar Nowcast stream" : "Simulate Doppler Radar Outage & fallback to Satellite"}
        >
          <span>{isRadarOutage ? "⚠️" : "⚡"}</span>
          <span className="font-telemetry text-[11px]">
            {isRadarOutage ? "RADAR OUTAGE ACTIVE" : "Simulate Radar Outage"}
          </span>
        </button>

        {/* Refresh button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-300 transition-colors cursor-pointer"
            title="Refresh API Data"
            aria-label="Refresh API Data"
          >
            <IconRefresh className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Generate CAP / SACHET Payload CTA */}
        <button
          type="button"
          onClick={onOpenCapDrawer}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--critical)] text-white hover:brightness-110 text-xs font-bold font-telemetry transition-all cursor-pointer shadow-xs border border-rose-500/40 tracking-wide"
        >
          <span>🚨</span>
          <span className="hidden sm:inline">GENERATE CAP / SACHET</span>
          <span className="sm:hidden">CAP ALERT</span>
        </button>
      </div>
    </header>
  );
}
