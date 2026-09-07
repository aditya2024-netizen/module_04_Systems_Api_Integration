"use client";

import React from "react";
import ImpactMode from "../ImpactMode";

export default function ImpactView({ eventData }) {
  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="p-4 rounded-xl panel-technical flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-400/20"></span>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Socioeconomic Impact Intelligence &amp; Operational What-If Simulation
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Exposure quantification across vulnerable demographic sectors, hospital infrastructure, and dynamic canal mitigation thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-telemetry shrink-0">
          <span className="px-2.5 py-1 rounded bg-[var(--canvas)] border border-[var(--border)] text-[var(--text-secondary)]">
            Exposed Census: <strong className="text-rose-600">{(eventData?.impact?.population_exposed || 21400).toLocaleString()}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300 font-bold">
            {eventData?.impact?.critical_assets || 3} Priority Assets
          </span>
        </div>
      </div>

      {/* Embedded Core Impact & What-If Mode */}
      <ImpactMode eventData={eventData} />
    </div>
  );
}
