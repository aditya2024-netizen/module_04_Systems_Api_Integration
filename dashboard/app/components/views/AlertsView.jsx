"use client";

import React from "react";
import ResponseMode from "../ResponseMode";

export default function AlertsView({
  eventData,
  availableEvents = [],
  onSelectEvent,
  onOpenCapDrawer,
}) {
  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="p-4 rounded-xl panel-technical flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-600 ring-2 ring-rose-500/20"></span>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Action &amp; Emergency Alert Operations Center
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Authorization of civil defense protocols, evacuation arterial routing, and OASIS CAP v1.2 / SACHET broadcast payloads.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCapDrawer}
          className="cursor-pointer px-4 py-2 text-xs font-bold rounded-lg bg-[var(--critical)] text-white hover:brightness-110 transition-all shrink-0 shadow-xs flex items-center gap-2 font-telemetry tracking-wide"
        >
          <span>🚨</span>
          <span>GENERATE OASIS CAP XML</span>
        </button>
      </div>

      {/* Embedded Core Response Mode */}
      <ResponseMode
        eventData={eventData}
        availableEvents={availableEvents}
        onSelectEvent={onSelectEvent}
        onOpenCapDrawer={onOpenCapDrawer}
      />
    </div>
  );
}
