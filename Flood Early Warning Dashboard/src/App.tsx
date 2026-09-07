import React, { useState } from "react"
import {
  CloudRain,
  Map as MapIcon,
  Activity,
  AlertTriangle,
  Users,
  Building,
  Car,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldAlert,
  Menu,
  ChevronDown,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { MapContainer, TileLayer, Circle, Popup, Polygon } from "react-leaflet"

// Forecast data based on the brief
const forecastData = [
  { time: "NOW", intensity: 25, threshold: 50 },
  { time: "+30 MIN", intensity: 45, threshold: 50 },
  { time: "+60 MIN", intensity: 87, threshold: 50 },
  { time: "+90 MIN", intensity: 75, threshold: 50 },
  { time: "+120 MIN", intensity: 40, threshold: 50 },
]

export default function App() {
  const [activeTab, setActiveTab] = useState("Command Center")

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
              <CloudRain size={20} />
            </div>
            <div>
              <h1 className="font-poppins font-semibold text-lg text-card-foreground leading-tight">
                HydroSurge AI
              </h1>
              <p className="text-xs text-muted-foreground">
                Urban Flood Warning
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {[
              { name: "Command Center", icon: Activity, active: true },
              { name: "Rainfall Forecast", icon: CloudRain },
              { name: "Inundation Risk", icon: MapIcon },
              { name: "Impact & What-If", icon: Users },
              { name: "Action & Alerts", icon: AlertTriangle },
              { name: "Historical Replay", icon: Clock },
            ].map((item) => (
              <li key={item.name}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-secondary-foreground hover:bg-secondary/50"
                  }`}
                  onClick={() => setActiveTab(item.name)}
                >
                  <item.icon
                    size={18}
                    className={
                      item.active ? "text-primary" : "text-muted-foreground"
                    }
                  />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              System Health
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className="text-secondary-foreground">API / Gateway</span>
                <span className="flex items-center gap-1 text-safe">
                  <CheckCircle2 size={12} /> Operational
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-secondary-foreground">
                  Data Freshness
                </span>
                <span className="text-safe">Current</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-secondary-foreground">
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Focus
              </span>
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium text-card-foreground">
                  Adyar River Basin
                </span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-secondary-foreground">
              <Clock size={16} className="text-muted-foreground" />
              <span>
                Last Updated:{" "}
                <strong className="text-card-foreground">09:42</strong>
              </span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <div className="flex items-center gap-2 text-sm text-secondary-foreground">
              <span className="flex h-2 w-2 rounded-full bg-safe"></span>
              Valid Through:{" "}
              <strong className="text-card-foreground">11:42</strong>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* HEAVY RAINFALL WARNING BANNER */}
          <div className="bg-critical-light border border-critical/20 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-critical text-white rounded-md shrink-0">
                <AlertOctagon size={24} />
              </div>
              <div>
                <h2 className="text-critical font-bold text-lg leading-tight uppercase tracking-wide">
                  Heavy Rainfall Warning
                </h2>
                <p className="text-critical/80 text-sm mt-1 max-w-2xl">
                  Forecast conditions indicate a significant increase in
                  rainfall intensity over the selected catchment.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 bg-white/60 p-3 rounded-md shrink-0">
              <div className="text-center">
                <div className="text-xs text-critical/70 font-semibold uppercase">
                  Lead Time
                </div>
                <div className="text-xl font-bold text-critical">60 min</div>
              </div>
              <div className="w-px h-8 bg-critical/20"></div>
              <div className="text-center">
                <div className="text-xs text-critical/70 font-semibold uppercase">
                  Peak Intensity
                </div>
                <div className="text-xl font-bold text-critical">87 mm/hr</div>
              </div>
              <div className="w-px h-8 bg-critical/20"></div>
              <div className="text-center">
                <div className="text-xs text-critical/70 font-semibold uppercase">
                  Confidence
                </div>
                <div className="text-xl font-bold text-critical">84%</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* LEFT COLUMN: RAINFALL FORECAST */}
            <div className="xl:col-span-2 space-y-6">
              <section>
                <div className="mb-4">
                  <h3 className="text-xl font-poppins font-semibold text-card-foreground">
                    Rainfall Forecast
                  </h3>
                  <p className="text-sm text-secondary-foreground mt-1">
                    Rainfall intensity is expected to increase over the selected
                    catchment.
                  </p>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                  <div className="flex justify-between items-end mb-6">
                    <div className="flex gap-8">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Current Rainfall
                        </div>
                        <div className="text-3xl font-bold text-rainfall">
                          25{" "}
                          <span className="text-lg text-rainfall/70 font-medium">
                            mm/hr
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Forecast Peak
                        </div>
                        <div className="text-3xl font-bold text-critical">
                          87{" "}
                          <span className="text-lg text-critical/70 font-medium">
                            mm/hr
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Peak Expected In
                        </div>
                        <div className="text-3xl font-bold text-card-foreground">
                          60{" "}
                          <span className="text-lg text-secondary-foreground font-medium">
                            min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-secondary-foreground text-right">
                      <div>
                        Confidence:{" "}
                        <strong className="text-card-foreground">84%</strong>
                      </div>
                      <div>
                        Horizon:{" "}
                        <strong className="text-card-foreground">
                          0–120 min
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="h-64 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={forecastData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorIntensity"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--color-rainfall)"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--color-rainfall)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="var(--color-border)"
                        />
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 12,
                            fill: "var(--color-muted-foreground)",
                          }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 12,
                            fill: "var(--color-muted-foreground)",
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid var(--color-border)",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <ReferenceLine
                          y={50}
                          label={{
                            position: "top",
                            value: "Warning Threshold",
                            fill: "var(--color-warning)",
                            fontSize: 12,
                          }}
                          stroke="var(--color-warning)"
                          strokeDasharray="4 4"
                        />
                        <Area
                          type="monotone"
                          dataKey="intensity"
                          stroke="var(--color-rainfall)"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorIntensity)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* INUNDATION RISK & IMPACT SUMMARY (Side by side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <div className="mb-4">
                    <h3 className="text-lg font-poppins font-semibold text-card-foreground">
                      Inundation Risk
                    </h3>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-[calc(100%-2rem)]">
                    <p className="text-sm text-secondary-foreground mb-6">
                      Forecast rainfall is translated into spatial flood-risk
                      estimates.
                    </p>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="text-sm font-medium text-secondary-foreground">
                          Flood Probability
                        </span>
                        <span className="text-lg font-bold text-card-foreground">
                          87%
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="text-sm font-medium text-secondary-foreground">
                          Projected Depth
                        </span>
                        <span className="text-lg font-bold text-critical">
                          0.5–1.0 m
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="text-sm font-medium text-secondary-foreground">
                          Risk Level
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-critical-light text-critical uppercase">
                          High Risk
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary-foreground">
                          Affected Area
                        </span>
                        <span className="text-sm font-bold text-card-foreground">
                          Adyar Basin
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-4">
                    <h3 className="text-lg font-poppins font-semibold text-card-foreground">
                      Expected Impact
                    </h3>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-[calc(100%-2rem)] flex flex-col justify-between">
                    <p className="text-sm text-secondary-foreground mb-6">
                      Estimated exposure within forecast high-risk areas.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg border border-border">
                        <Users size={20} className="text-primary mb-2" />
                        <div className="text-2xl font-bold text-card-foreground">
                          21,400
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase mt-1">
                          Population Exposed
                        </div>
                      </div>
                      <div className="p-4 bg-critical-light/50 rounded-lg border border-critical/20">
                        <Building size={20} className="text-critical mb-2" />
                        <div className="text-2xl font-bold text-critical">
                          3
                        </div>
                        <div className="text-xs font-semibold text-critical/70 uppercase mt-1">
                          Critical Assets
                        </div>
                      </div>
                      <div className="p-4 bg-warning-light/50 rounded-lg border border-warning/20 col-span-2">
                        <Car size={20} className="text-warning mb-2" />
                        <div className="text-2xl font-bold text-warning">2</div>
                        <div className="text-xs font-semibold text-warning/70 uppercase mt-1">
                          Roads at Risk
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* RIGHT COLUMN: MAP & ACTIONS */}
            <div className="space-y-6">
              <section className="h-[400px] flex flex-col">
                <div className="mb-4 flex justify-between items-end">
                  <div>
                    <h3 className="text-lg font-poppins font-semibold text-card-foreground">
                      Spatial Flood Risk
                    </h3>
                    <p className="text-xs text-secondary-foreground mt-1">
                      Forecast Risk Across the Selected Catchment
                    </p>
                  </div>
                  {/* Map Controls */}
                  <div className="flex gap-2">
                    <button className="px-2 py-1 text-[10px] font-semibold bg-primary text-white rounded">
                      Risk
                    </button>
                    <button className="px-2 py-1 text-[10px] font-semibold bg-secondary text-secondary-foreground rounded">
                      Radar
                    </button>
                  </div>
                </div>

                <div className="flex-1 rounded-xl overflow-hidden border border-border shadow-sm relative z-0">
                  <MapContainer
                    center={[13.01, 80.2]}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {/* Simulated High Risk Zone */}
                    <Polygon
                      positions={[
                        [13.02, 80.19],
                        [13.015, 80.21],
                        [13.0, 80.205],
                        [13.005, 80.185],
                      ]}
                      pathOptions={{
                        color: "var(--color-critical)",
                        fillColor: "var(--color-critical)",
                        fillOpacity: 0.4,
                      }}
                    />
                  </MapContainer>

                  {/* Map Legend */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-border shadow-sm text-xs font-medium z-[1000]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-3 h-3 rounded-full bg-critical opacity-80"></span>{" "}
                      High Risk
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-3 h-3 rounded-full bg-warning opacity-80"></span>{" "}
                      Moderate Risk
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-safe opacity-80"></span>{" "}
                      Low Risk
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <h3 className="text-lg font-poppins font-semibold text-card-foreground">
                    Recommended Response
                  </h3>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-border flex items-start gap-4 hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-critical-light rounded-lg text-critical mt-0.5">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-card-foreground uppercase">
                        Alert
                      </h4>
                      <p className="text-sm text-secondary-foreground mt-1">
                        Issue an early warning for the affected area.
                      </p>
                      <button className="mt-3 px-4 py-2 bg-critical text-white text-xs font-semibold rounded-md shadow-sm">
                        Issue CAP Alert
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border-b border-border flex items-start gap-4 hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-warning-light rounded-lg text-warning mt-0.5">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-card-foreground uppercase">
                        Close Road
                      </h4>
                      <p className="text-sm text-secondary-foreground mt-1">
                        Assess closure of roads within the projected risk zone.
                      </p>
                      <button className="mt-3 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold rounded-md transition-colors">
                        View Routing Guidance
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-primary-light bg-primary/10 rounded-lg text-primary mt-0.5">
                      <Navigation size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-card-foreground uppercase">
                        Deploy Team
                      </h4>
                      <p className="text-sm text-secondary-foreground mt-1">
                        Position response resources ahead of expected impact.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="pt-8 pb-4 border-t border-border mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex flex-wrap items-center gap-2">
              <span className="uppercase tracking-wider">
                Forecast Sources:
              </span>
              <span className="px-2 py-1 bg-muted rounded">Radar</span>
              <span className="px-2 py-1 bg-muted rounded">Satellite</span>
              <span className="px-2 py-1 bg-muted rounded">NWP</span>
              <span className="px-2 py-1 bg-muted rounded">
                Ground Observations
              </span>
            </div>
            <div>
              HydroSurge AI — Operational Meteorological Decision-Support System
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
