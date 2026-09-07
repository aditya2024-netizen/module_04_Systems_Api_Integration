"use client";

import React, { useState } from "react";
import {
  Clock,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  Zap,
  Radio,
} from "lucide-react";

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
    zone_name: eventData?.location?.zone_name || "Adyar River Basin",
    zone_id: eventData?.location?.zone_id || "Z42",
    priority: eventData?.priority || "CRITICAL",
  };

  // Format valid times deterministically for SSR/Hydration safety
  let updatedTime = "09:42 UTC";
  let validThroughTime = "11:42 UTC";

  try {
    if (eventData?.rainfall?.valid_time) {
      const d = new Date(eventData.rainfall.valid_time);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getUTCHours()).padStart(2, "0");
        const mm = String(d.getUTCMinutes()).padStart(2, "0");
        updatedTime = `${hh}:${mm} UTC`;
        const lead = eventData?.rainfall?.lead_minutes || 120;
        const dEnd = new Date(d.getTime() + lead * 60000);
        const hhEnd = String(dEnd.getUTCHours()).padStart(2, "0");
        const mmEnd = String(dEnd.getUTCMinutes()).padStart(2, "0");
        validThroughTime = `${hhEnd}:${mmEnd} UTC`;
      }
    }
  } catch (err) {
    // fallback to default
  }

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20 shadow-xs">
      {/* Left: Monitoring Area / Active Focus */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Monitoring Area
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-card-foreground hover:text-primary transition-colors cursor-pointer"
              aria-expanded={dropdownOpen}
            >
              <span>{activeEvent.zone_name || "Adyar River Basin"}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-critical-light text-critical font-bold uppercase">
                {activeEvent.event_id}
              </span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                    Select Monitoring Basin ({eventsList.length} Available)
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
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
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 text-primary font-bold"
                              : "hover:bg-muted text-secondary-foreground"
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-card-foreground">
                              {ev.zone_name || ev.zone_id}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Incident ID: {ev.event_id} • {ev.zone_id}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              ev.priority === "CRITICAL"
                                ? "bg-critical-light text-critical"
                                : "bg-warning-light text-warning"
                            }`}
                          >
                            {ev.priority || "NORMAL"}
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
      </div>

      {/* Right: Telemetry Time, Radar Toggle & CAP CTA */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Last Updated */}
        <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm text-secondary-foreground">
          <Clock size={15} className="text-muted-foreground" />
          <span>
            Last Updated:{" "}
            <strong className="text-card-foreground" suppressHydrationWarning>{updatedTime}</strong>
          </span>
        </div>

        <div className="hidden sm:block h-6 w-px bg-border"></div>

        {/* Valid Through */}
        <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm text-secondary-foreground">
          <span className="flex h-2 w-2 rounded-full bg-safe"></span>
          <span>
            Valid Through:{" "}
            <strong className="text-card-foreground" suppressHydrationWarning>{validThroughTime}</strong>
          </span>
        </div>

        {/* Radar Outage Toggle */}
        <button
          type="button"
          onClick={onToggleRadarOutage}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isRadarOutage
              ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm"
              : "bg-muted border-border text-secondary-foreground hover:bg-secondary/60 hover:text-card-foreground"
          }`}
          title={isRadarOutage ? "Restore Doppler Radar Stream" : "Simulate Radar Outage & Fallback to Satellite"}
        >
          <Radio size={14} className={isRadarOutage ? "animate-pulse" : ""} />
          <span className="hidden md:inline">
            {isRadarOutage ? "RADAR OUTAGE ACTIVE" : "Simulate Radar Outage"}
          </span>
          <span className="md:hidden">
            {isRadarOutage ? "OUTAGE" : "RADAR"}
          </span>
        </button>

        {/* Refresh button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Refresh API Data"
            aria-label="Refresh API Data"
          >
            <RefreshCw size={14} />
          </button>
        )}

        {/* Issue CAP Alert CTA */}
        <button
          type="button"
          onClick={onOpenCapDrawer}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-critical hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <AlertTriangle size={14} />
          <span className="hidden sm:inline">Issue CAP Alert</span>
          <span className="sm:hidden">Alert</span>
        </button>
      </div>
    </header>
  );
}
