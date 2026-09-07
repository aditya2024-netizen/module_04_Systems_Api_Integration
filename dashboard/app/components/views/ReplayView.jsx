"use client";

import React, { useState } from "react";
import TimelineBar from "../TimelineBar";
import { IconReplay, IconTarget } from "../Icons";

export default function ReplayView({
  eventData,
  eventsList = [],
  selectedEventId,
  onSelectEvent,
  timelineStepIndex,
  onTimelineStepChange,
}) {
  const timeline = eventData?.timeline || [];
  const currentStep = timeline[timelineStepIndex] || timeline[0] || {};
  const location = eventData?.location || {};

  const scenarioMeta = {
    id: "SCN-CHENNAI-2026",
    name: "Chennai Urban Flood Historical Event Replay",
    region: "Greater Chennai Corporation (GCC) · Adyar Basin",
    date: "2026-09-06",
    status: "PROTOTYPE",
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Information */}
      <div className="p-4 rounded-xl panel-technical flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-600"></span>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Historical Scenario Replay &amp; Deterministic Playback
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            High-fidelity playback of validated historical storm sequences for training, post-incident review, and algorithm verification.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-telemetry shrink-0">
          <span className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-300 font-bold">
            HISTORICAL REPLAY MODE
          </span>
          <span className="px-2 py-1 rounded bg-[var(--canvas)] border border-[var(--border)] text-[var(--text-muted)]">
            {scenarioMeta.date}
          </span>
        </div>
      </div>

      {/* 2. Scenario Metadata Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-telemetry">
        <div className="panel-technical p-3 rounded-lg">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Scenario ID</div>
          <div className="font-bold text-[var(--text-primary)] mt-0.5">{scenarioMeta.id}</div>
        </div>
        <div className="panel-technical p-3 rounded-lg">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Target Catchment</div>
          <div className="font-bold text-[var(--text-primary)] mt-0.5">{location.zone_name || "Adyar Pilot"}</div>
        </div>
        <div className="panel-technical p-3 rounded-lg">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Temporal Steps</div>
          <div className="font-bold text-sky-800 mt-0.5">{timeline.length} Time Horizons</div>
        </div>
        <div className="panel-technical p-3 rounded-lg">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Active Step</div>
          <div className="font-bold text-rose-600 mt-0.5">+{currentStep.lead_minutes || 0} min ({currentStep.depth_band || "nominal"})</div>
        </div>
      </div>

      {/* 3. Replay Timeline Scrubber */}
      <TimelineBar
        timeline={timeline}
        activeStepIndex={timelineStepIndex}
        onStepChange={onTimelineStepChange}
      />

      {/* 4. Event Selector Catalog */}
      <div className="panel-technical p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-telemetry">
            Replay Event Catalog ({eventsList.length} Historical Incidents)
          </h3>
          <span className="text-[10px] font-telemetry text-[var(--text-muted)]">
            Click to switch replay dataset
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {eventsList.map((ev) => {
            const isSelected = ev.event_id === selectedEventId;
            return (
              <button
                key={ev.event_id}
                type="button"
                onClick={() => onSelectEvent(ev.event_id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-sky-50 border-sky-400 text-sky-950 shadow-xs ring-1 ring-sky-500/30 font-semibold"
                    : "bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-telemetry font-bold text-xs">{ev.event_id}</span>
                  <span className={`text-[9px] font-telemetry px-1.5 py-0.5 rounded font-bold ${
                    ev.priority === "CRITICAL" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"
                  }`}>
                    {ev.priority}
                  </span>
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)] mt-1 truncate">
                  {ev.zone_name || ev.zone_id}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-telemetry mt-1">
                  Catchment Zone: {ev.zone_id}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
