"use client";

import React, { useState } from "react";
import {
  IconOverview,
  IconRainfall,
  IconInundation,
  IconImpact,
  IconAlert,
  IconDataSources,
  IconHealth,
  IconReplay,
  IconChevronLeft,
  IconChevronRight,
  IconShield,
} from "./Icons";

export default function Sidebar({
  activeNav,
  onNavChange,
  isCollapsed,
  onToggleCollapse,
  alertCount = 3,
  apiConnected = true,
  dataSource = "PRECOMPUTED_REPLAY",
}) {
  const navItems = [
    {
      id: "overview",
      label: "Command Center",
      shortLabel: "Overview",
      icon: IconOverview,
      badge: null,
      description: "Live spatial command & situational intelligence",
    },
    {
      id: "rainfall",
      label: "Rainfall Forecast",
      shortLabel: "Rainfall",
      icon: IconRainfall,
      badge: "Nowcast",
      description: "Precipitation intensity & accumulation timelines",
    },
    {
      id: "inundation",
      label: "Inundation Risk",
      shortLabel: "Inundation",
      icon: IconInundation,
      badge: null,
      description: "2D hydrodynamic depth bands & flood probabilities",
    },
    {
      id: "impact",
      label: "Impact & What-If",
      shortLabel: "Impact",
      icon: IconImpact,
      badge: null,
      description: "Demographic exposure & operational scenario simulator",
    },
    {
      id: "alerts",
      label: "Action & Alert Center",
      shortLabel: "Alerts",
      icon: IconAlert,
      badge: alertCount > 0 ? String(alertCount) : null,
      badgeColor: "bg-rose-600 text-white",
      description: "Emergency protocols, evacuation corridor & CAP v1.2",
    },
    {
      id: "datasources",
      label: "Data Sources",
      shortLabel: "Sensors",
      icon: IconDataSources,
      badge: null,
      description: "Radar, satellite, AWS & NWP telemetry provenance",
    },
    {
      id: "health",
      label: "System Health",
      shortLabel: "Health",
      icon: IconHealth,
      badge: apiConnected ? "OK" : "ERR",
      badgeColor: apiConnected ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-rose-100 text-rose-800 border border-rose-300",
      description: "API gateway health, provider state & latency benchmarks",
    },
    {
      id: "replay",
      label: "Historical Replay",
      shortLabel: "Replay",
      icon: IconReplay,
      badge: "Replay",
      description: "Deterministic flood scenario temporal playback",
    },
  ];

  return (
    <aside
      className={`bg-[var(--card)] border-r border-[var(--border)] flex flex-col justify-between transition-all duration-300 select-none z-30 shrink-0 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      aria-label="Main Operational Navigation"
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-lg bg-sky-700 text-white flex items-center justify-center font-black font-telemetry shrink-0 shadow-xs">
              HS
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-tight text-[var(--text-primary)]">
                    HydroSurge AI
                  </span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-telemetry tracking-wide uppercase truncate">
                  Disaster Intelligence
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-[var(--card-elevated)] border border-transparent hover:border-[var(--border)] text-[var(--text-secondary)] transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
            aria-label={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          >
            {isCollapsed ? <IconChevronRight className="w-4 h-4" /> : <IconChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative group ${
                  isActive
                    ? "bg-sky-50 text-sky-900 border border-sky-300/80 shadow-2xs font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-elevated)] border border-transparent"
                }`}
                title={isCollapsed ? `${item.label} — ${item.description}` : item.description}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-sky-600 rounded-r"></span>
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-sky-700" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 truncate text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-telemetry px-1.5 py-0.5 rounded font-bold shrink-0 ml-1.5 ${
                          item.badgeColor || "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed Tooltip Flyout */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-[11px] font-medium shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-300">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operational Sector & Status Footer */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--canvas)] text-[11px] font-telemetry">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-semibold uppercase">
              <span>Operational Grid</span>
              <span className="text-sky-700">EPSG:4326</span>
            </div>
            <div className="p-2 rounded bg-[var(--card)] border border-[var(--border)]">
              <div className="font-bold text-[var(--text-primary)] truncate">Greater Chennai</div>
              <div className="text-[10px] text-[var(--text-secondary)] truncate">Adyar Basin Pilot Sector</div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5 text-[10px]">
                <span className={`h-2 w-2 rounded-full ${apiConnected ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`}></span>
                <span className="text-[var(--text-secondary)]">{apiConnected ? "Gateway Online" : "Gateway Offline"}</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--card-elevated)] border border-[var(--border)] font-bold text-[var(--text-muted)]">
                v1.0
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <span
              className={`h-2.5 w-2.5 rounded-full ${apiConnected ? "bg-emerald-500" : "bg-rose-500"}`}
              title={apiConnected ? "FastAPI Gateway Online" : "FastAPI Gateway Offline"}
            ></span>
          </div>
        )}
      </div>
    </aside>
  );
}
