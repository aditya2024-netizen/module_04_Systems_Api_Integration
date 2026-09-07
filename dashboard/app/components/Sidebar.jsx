"use client";

import React from "react";
import {
  CloudRain,
  Map as MapIcon,
  Activity,
  AlertTriangle,
  Users,
  Clock,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

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
      name: "Command Center",
      icon: Activity,
      description: "Live spatial command & situational intelligence",
    },
    {
      id: "rainfall",
      name: "Rainfall Forecast",
      icon: CloudRain,
      description: "Precipitation intensity & accumulation timelines",
    },
    {
      id: "inundation",
      name: "Inundation Risk",
      icon: MapIcon,
      description: "2D hydrodynamic depth bands & flood probabilities",
    },
    {
      id: "impact",
      name: "Impact & What-If",
      icon: Users,
      description: "Demographic exposure & operational scenario simulator",
    },
    {
      id: "alerts",
      name: "Action & Alerts",
      icon: AlertTriangle,
      badge: alertCount > 0 ? String(alertCount) : null,
      badgeColor: "bg-critical text-white",
      description: "Emergency protocols, evacuation corridor & CAP v1.2",
    },
    {
      id: "datasources",
      name: "Data Sources",
      icon: Layers,
      description: "Radar, satellite, AWS & NWP telemetry provenance",
    },
    {
      id: "health",
      name: "System Health",
      icon: ShieldCheck,
      badge: apiConnected ? "OK" : "ERR",
      badgeColor: apiConnected ? "bg-safe-light text-emerald-800 border border-emerald-300" : "bg-critical-light text-critical border border-rose-300",
      description: "API gateway health, provider state & latency benchmarks",
    },
    {
      id: "replay",
      name: "Historical Replay",
      icon: Clock,
      description: "Deterministic flood scenario temporal playback",
    },
  ];

  return (
    <aside
      className={`bg-card border-r border-border flex flex-col justify-between transition-all duration-300 select-none z-30 shrink-0 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      aria-label="Main Navigation"
    >
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
              <CloudRain size={20} />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-poppins font-semibold text-base text-card-foreground leading-tight truncate">
                  HydroSurge AI
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  Urban Flood Warning
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
            aria-label={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer relative group ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-secondary-foreground hover:bg-secondary/50"
                }`}
                title={isCollapsed ? item.name : item.description}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 truncate text-left">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                          item.badgeColor || "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-[10px] text-slate-300">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Health Section at bottom */}
      <div className="p-4 border-t border-border bg-card">
        {!isCollapsed ? (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Health
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className="text-secondary-foreground">API / Gateway</span>
                <span className={`flex items-center gap-1 font-semibold ${apiConnected ? "text-safe" : "text-critical"}`}>
                  {apiConnected ? (
                    <>
                      <CheckCircle2 size={13} className="text-safe" /> Operational
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} className="text-critical" /> Offline
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-secondary-foreground">Data Freshness</span>
                <span className="text-safe font-semibold">Current</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex justify-center">
            <span
              className={`h-2.5 w-2.5 rounded-full ${apiConnected ? "bg-safe" : "bg-critical animate-pulse"}`}
              title={apiConnected ? "API / Gateway: Operational" : "API / Gateway: Offline"}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
