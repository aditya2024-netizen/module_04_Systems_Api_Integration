"use client";

import { useEffect, useRef, useState } from "react";

export default function ZoneMap({
  activeLocation,
  zones = [],
  onSelectZone,
  activeTimelineStep,
  isRadarOutage,
  responseRoute,
  activeMode,
  eventData,
  compact = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const zoneMarkersRef = useRef({});
  const riskCircleRef = useRef(null);
  const uncertaintyCircleRef = useRef(null);
  const routePolylineRef = useRef(null);
  const blockedMarkersRef = useRef([]);

  // Layer Controls State
  const [showRiskLayer, setShowRiskLayer] = useState(true);
  const [showCentroids, setShowCentroids] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  const hasValidCoordinates =
    activeLocation &&
    typeof activeLocation.latitude === "number" &&
    !isNaN(activeLocation.latitude) &&
    typeof activeLocation.longitude === "number" &&
    !isNaN(activeLocation.longitude);

  const currentLat = hasValidCoordinates ? activeLocation.latitude : 12.9815;
  const currentLng = hasValidCoordinates ? activeLocation.longitude : 80.2180;
  const currentZoneId = activeLocation?.zone_id || "Z42";
  const currentZoneName = activeLocation?.zone_name || currentZoneId;
  const currentAreaType = activeLocation?.flood_area_type || "Catchment Basin";

  // Telemetry values for HUD
  const forecastLead = activeTimelineStep?.lead_minutes ?? 0;
  const rainRate = activeTimelineStep?.rainfall_mm_hr ?? eventData?.rainfall?.rainfall_mm_hr ?? 0;
  const depthBand = activeTimelineStep?.depth_band ?? eventData?.inundation?.depth_band ?? "<0.1m";
  const floodProb = activeTimelineStep?.flood_probability ?? eventData?.inundation?.flood_probability ?? 0.5;
  const confidence = eventData?.inundation?.confidence ?? 0.88;

  const handleRecenter = () => {
    if (mapInstanceRef.current && hasValidCoordinates) {
      mapInstanceRef.current.flyTo([currentLat, currentLng], 13, { duration: 0.6 });
    }
  };

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      if (!hasValidCoordinates) return;

      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      mapInstanceRef.current = map;

      // Render zones from API
      const zoneList = zones.length > 0 ? zones : [{
        zone_id: currentZoneId,
        zone_name: currentZoneName,
        latitude: currentLat,
        longitude: currentLng,
        flood_area_type: currentAreaType,
      }];

      zoneList.forEach((z) => {
        if (typeof z.latitude !== "number" || typeof z.longitude !== "number") return;
        const zId = z.zone_id;
        const isSelected = zId === currentZoneId;

        const marker = L.circleMarker([z.latitude, z.longitude], {
          radius: isSelected ? 9 : 6,
          color: isSelected ? "#dc2626" : "#0284c7",
          fillColor: isSelected ? "#dc2626" : "#ffffff",
          fillOpacity: 0.95,
          weight: isSelected ? 2.5 : 2,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-size:12px; line-height:1.4;">
            <strong style="color:#0f172a;">${z.zone_name || zId} (${zId})</strong><br/>
            <span style="color:#475569;">Terrain: ${z.flood_area_type || "Adyar Basin"}</span><br/>
            <span style="color:#0284c7; font-family:monospace; font-size:10px; font-weight:600;">LAT: ${z.latitude.toFixed(4)}° | LON: ${z.longitude.toFixed(4)}°</span>
          </div>`
        );

        marker.on("click", () => {
          if (onSelectZone) onSelectZone(zId);
        });

        zoneMarkersRef.current[zId] = marker;
      });

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    initMap();

    let resizeObserver = null;
    if (typeof window !== "undefined" && window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hasValidCoordinates]);

  // Update Markers when zones array updates
  useEffect(() => {
    if (!mapInstanceRef.current || zones.length === 0 || !hasValidCoordinates) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      
      Object.values(zoneMarkersRef.current).forEach((m) => map.removeLayer(m));
      zoneMarkersRef.current = {};

      if (!showCentroids) return;

      zones.forEach((z) => {
        if (typeof z.latitude !== "number" || typeof z.longitude !== "number") return;
        const zId = z.zone_id;
        const isSelected = zId === currentZoneId;

        const marker = L.circleMarker([z.latitude, z.longitude], {
          radius: isSelected ? 9 : 6,
          color: isSelected ? "#dc2626" : "#0284c7",
          fillColor: isSelected ? "#dc2626" : "#ffffff",
          fillOpacity: 0.95,
          weight: isSelected ? 2.5 : 2,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-size:12px; line-height:1.4;">
            <strong style="color:#0f172a;">${z.zone_name || zId} (${zId})</strong><br/>
            <span style="color:#475569;">Terrain: ${z.flood_area_type || "Adyar Basin"}</span><br/>
            <span style="color:#0284c7; font-family:monospace; font-size:10px; font-weight:600;">Centroid: ${z.latitude.toFixed(4)}° N, ${z.longitude.toFixed(4)}° E</span>
          </div>`
        );

        marker.on("click", () => {
          if (onSelectZone) onSelectZone(zId);
        });

        zoneMarkersRef.current[zId] = marker;
      });
    });
  }, [zones, hasValidCoordinates, showCentroids]);

  // Update Center & Active Zone Pin
  useEffect(() => {
    if (!mapInstanceRef.current || !hasValidCoordinates) return;
    const map = mapInstanceRef.current;
    map.flyTo([currentLat, currentLng], 13, { duration: 0.6 });

    Object.entries(zoneMarkersRef.current).forEach(([zId, marker]) => {
      const isSelected = zId === currentZoneId;
      marker.setStyle({
        radius: isSelected ? 10 : 6,
        color: isSelected ? "#dc2626" : "#0284c7",
        fillColor: isSelected ? "#dc2626" : "#ffffff",
        weight: isSelected ? 3 : 2,
      });
      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [currentLat, currentLng, currentZoneId, hasValidCoordinates]);

  // Discrete Catchment Centroid Risk Proximity Indicator (Truthful, non-polygon)
  useEffect(() => {
    if (!mapInstanceRef.current || !hasValidCoordinates) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((leafletModule) => {
      const L_inst = leafletModule.default || leafletModule;
      if (riskCircleRef.current) {
        map.removeLayer(riskCircleRef.current);
        riskCircleRef.current = null;
      }

      if (!showRiskLayer) return;

      // Centroid influence radius (discrete proximity indicator: 300m - 450m)
      const radiusMeters = floodProb >= 0.75 ? 420 : floodProb >= 0.45 ? 320 : 250;
      const ringColor =
        floodProb >= 0.75
          ? "#dc2626"
          : floodProb >= 0.45
          ? "#d97706"
          : "#16a34a";

      riskCircleRef.current = L_inst.circle([currentLat, currentLng], {
        radius: radiusMeters,
        color: ringColor,
        fillColor: ringColor,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: "5 5",
      }).addTo(map);

      riskCircleRef.current.bindTooltip(
        `Centroid Risk Influence Radius (${radiusMeters}m) · Prob: ${(floodProb * 100).toFixed(0)}%`,
        { permanent: false, direction: "top", className: "tactical-tooltip" }
      );
    });
  }, [currentLat, currentLng, floodProb, hasValidCoordinates, showRiskLayer]);

  // Radar Outage Uncertainty Visualization
  useEffect(() => {
    if (!mapInstanceRef.current || !hasValidCoordinates) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((leafletModule) => {
      const L_inst = leafletModule.default || leafletModule;
      if (uncertaintyCircleRef.current) {
        map.removeLayer(uncertaintyCircleRef.current);
        uncertaintyCircleRef.current = null;
      }

      if (isRadarOutage && showRiskLayer) {
        uncertaintyCircleRef.current = L_inst.circle([currentLat, currentLng], {
          radius: 1200,
          color: "#d97706",
          fillColor: "#d97706",
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "6 6",
        }).addTo(map);
        uncertaintyCircleRef.current.bindTooltip("Degraded Uncertainty Envelope (±35%)", {
          direction: "bottom",
        });
      }
    });
  }, [isRadarOutage, currentLat, currentLng, hasValidCoordinates, showRiskLayer]);

  // Response Routing in Response Mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((leafletModule) => {
      const L_inst = leafletModule.default || leafletModule;

      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }
      blockedMarkersRef.current.forEach((m) => map.removeLayer(m));
      blockedMarkersRef.current = [];

      if (activeMode === "response" && responseRoute && showRoutes) {
        if (responseRoute.route_coordinates && responseRoute.route_coordinates.length > 0) {
          routePolylineRef.current = L_inst.polyline(responseRoute.route_coordinates, {
            color: "#16a34a",
            weight: 3.5,
            opacity: 0.95,
            dashArray: "6 6",
          }).addTo(map);
        }

        if (responseRoute.blocked_coordinates) {
          responseRoute.blocked_coordinates.forEach((pt) => {
            const blockedIcon = L_inst.circleMarker(pt, {
              radius: 8,
              color: "#dc2626",
              fillColor: "#dc2626",
              fillOpacity: 0.95,
              weight: 2,
            }).addTo(map);
            blockedIcon.bindPopup(`<b>SIMULATED CHOKE POINT</b><br/>${responseRoute.impassable_road || "Road Inundated"}`);
            blockedMarkersRef.current.push(blockedIcon);
          });
        }
      }
    });
  }, [activeMode, responseRoute, showRoutes]);

  if (!hasValidCoordinates) {
    return (
      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-6 text-center space-y-2">
        <div className="text-2xl text-amber-400">🗺️</div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Spatial Centroid Unavailable
        </h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
          Centroid coordinates are not available for this event. In accordance with data truthfulness principles, coordinates are not fabricated.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="relative h-full w-full min-h-[360px] rounded-xl overflow-hidden border border-border shadow-sm">
        <div ref={mapContainerRef} className="h-full w-full z-0 min-h-[360px]" />

        {/* Map Layer Controls (Top-Right) */}
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-lg border border-border shadow-sm">
          <button
            type="button"
            onClick={() => setShowRiskLayer((prev) => !prev)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
              showRiskLayer ? "bg-primary text-white" : "text-secondary-foreground hover:bg-secondary/60"
            }`}
          >
            Risk
          </button>
          <button
            type="button"
            onClick={() => setShowCentroids((prev) => !prev)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
              showCentroids ? "bg-primary text-white" : "text-secondary-foreground hover:bg-secondary/60"
            }`}
          >
            Centroids
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="px-2 py-1 text-secondary-foreground hover:text-card-foreground text-xs font-bold rounded transition-colors cursor-pointer"
            title={`Recenter on ${currentZoneName}`}
          >
            ⌖
          </button>
        </div>

        {/* Floating Legend (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-lg border border-border shadow-md text-xs font-medium z-[1000] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-critical opacity-90"></span>
            <span className="text-secondary-foreground text-[11px] font-semibold">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-warning opacity-90"></span>
            <span className="text-secondary-foreground text-[11px] font-semibold">Moderate Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-safe opacity-90"></span>
            <span className="text-secondary-foreground text-[11px] font-semibold">Low Risk</span>
          </div>
        </div>

        {/* Catchment identifier (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md border border-border text-[11px] font-semibold text-card-foreground z-[1000] shadow-sm">
          {currentZoneName} ({currentZoneId})
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between shadow-xs space-y-3">
      {/* 1. Header & Technical Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sky-600 font-telemetry text-sm">⌖</span>
            <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-wide uppercase font-telemetry">
              Spatial Risk &amp; Catchment Monitoring (Prototype GIS View)
            </h2>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-telemetry mt-0.5">
            PROJECTION: WGS84 (EPSG:4326) · ADYAR BASIN PILOT · PRECOMPUTED REPLAY
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-telemetry">
          <span className="px-2.5 py-1 rounded bg-[var(--canvas)] border border-[var(--border)] text-[var(--text-secondary)]">
            LAT: <strong className="text-[var(--text-primary)]">{currentLat.toFixed(4)}° N</strong> · LON: <strong className="text-[var(--text-primary)]">{currentLng.toFixed(4)}° E</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-300 font-bold uppercase text-[10px]">
            {currentAreaType}
          </span>
        </div>
      </div>

      {/* 2. Map Information HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 text-xs font-telemetry">
        <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Target Zone</div>
          <div className="font-bold text-[var(--text-primary)] truncate">{currentZoneId} · {currentZoneName}</div>
        </div>
        <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Forecast Lead</div>
          <div className="font-bold text-sky-700">T+{forecastLead}m</div>
        </div>
        <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Rain Intensity</div>
          <div className="font-bold text-amber-700">{rainRate.toFixed(1)} mm/h</div>
        </div>
        <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Depth Band</div>
          <div className="font-bold text-rose-600">{depthBand}</div>
        </div>
        <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Flood Probability</div>
          <div className="font-bold text-rose-600">{(floodProb * 100).toFixed(0)}%</div>
        </div>
        <div className="p-2 rounded bg-[var(--card-elevated)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase">Confidence</div>
          <div className="font-bold text-emerald-700">{(confidence * 100).toFixed(0)}%</div>
        </div>
        <div className="col-span-2 sm:col-span-1 p-2 rounded bg-sky-50 border border-sky-200 flex flex-col justify-center">
          <div className="text-[9px] text-sky-800 font-bold uppercase tracking-wider">Telemetry Source</div>
          <div className="text-[10px] text-sky-950 font-mono font-bold truncate">PRECOMPUTED REPLAY</div>
        </div>
      </div>

      {/* 3. Layer Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-[var(--canvas)] border border-[var(--border)] text-xs font-telemetry">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase pr-1">GIS Layers:</span>

          <button
            type="button"
            onClick={() => setShowRiskLayer((prev) => !prev)}
            className={`cursor-pointer px-2.5 py-1 rounded text-xs border transition-all ${
              showRiskLayer
                ? "bg-sky-50 border-sky-400 text-sky-800 font-semibold shadow-2xs"
                : "bg-white border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50"
            }`}
          >
            {showRiskLayer ? "✓" : "○"} Spatial Risk (API)
          </button>

          <button
            type="button"
            onClick={() => setShowCentroids((prev) => !prev)}
            className={`cursor-pointer px-2.5 py-1 rounded text-xs border transition-all ${
              showCentroids
                ? "bg-sky-50 border-sky-400 text-sky-800 font-semibold shadow-2xs"
                : "bg-white border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50"
            }`}
          >
            {showCentroids ? "✓" : "○"} Catchment Centroids
          </button>

          {activeMode === "response" && (
            <button
              type="button"
              onClick={() => setShowRoutes((prev) => !prev)}
              className={`cursor-pointer px-2.5 py-1 rounded text-xs border transition-all ${
                showRoutes
                  ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold shadow-2xs"
                  : "bg-white border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50"
              }`}
            >
              {showRoutes ? "✓" : "○"} Response Routes (Simulated)
            </button>
          )}

          <span
            className="px-2 py-1 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-slate-400 text-[10px] cursor-not-allowed"
            title="Awaiting hydrodynamic polygon integration from R&D-2 live solver"
          >
            Inundation Mesh (Standby ⏳)
          </span>

          <span
            className="px-2 py-1 rounded bg-[var(--card-elevated)] border border-[var(--border)] text-slate-400 text-[10px] cursor-not-allowed"
            title="Awaiting live Doppler radar grid feed from R&D-1"
          >
            Radar Raster (Standby ⏳)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRecenter}
            className="cursor-pointer px-2.5 py-1 rounded text-xs border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50 transition-all font-telemetry flex items-center gap-1 shadow-2xs"
            title={`Recenter map view on ${currentZoneName} (${currentZoneId})`}
          >
            <span>⌖</span>
            <span>Recenter Focus</span>
          </button>
          <span className="text-[10px] text-[var(--text-muted)] font-mono hidden md:inline">
            Active: {currentZoneId}
          </span>
        </div>
      </div>

      {/* 4. Leaflet Map Viewport */}
      <div className="relative h-72 sm:h-84 md:h-96 w-full rounded-lg overflow-hidden border border-[var(--border)] corner-accents">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
        <div className="absolute top-2.5 right-2.5 z-1000 px-2.5 py-1 rounded bg-white/95 backdrop-blur-sm border border-[var(--border)] text-[10px] font-telemetry text-[var(--text-secondary)] flex items-center gap-2 pointer-events-none shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SPATIAL MESH ACTIVE · {currentZoneId}</span>
        </div>
      </div>

      {/* 5. Map Tactical Legend */}
      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-[var(--text-secondary)] gap-2 bg-[var(--canvas)] p-2.5 rounded-md border border-[var(--border)]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--critical)] shadow-xs"></span>
            <span className="font-telemetry text-[11px] text-[var(--text-primary)]">Active High-Risk Centroid</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-600 shadow-xs"></span>
            <span className="font-telemetry text-[11px] text-[var(--text-primary)]">Regional Catchments</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 border border-dashed border-rose-500 rounded"></span>
            <span className="font-telemetry text-[11px] text-[var(--text-primary)]">Centroid Risk Radius (~350m)</span>
          </span>
          {activeMode === "response" && (
            <>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="h-1 w-3.5 bg-emerald-600 rounded inline-block"></span>
                <span className="font-telemetry text-[11px]">Safe Bypass Corridor</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-rose-600">
                <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                <span className="font-telemetry text-[11px]">Roadway Choke Point</span>
              </span>
            </>
          )}
          {isRadarOutage && (
            <span className="flex items-center gap-1.5 text-amber-800 font-telemetry text-[11px] border-l border-[var(--border)] pl-3">
              <span className="h-2 w-2 rounded-full border border-amber-500 bg-amber-200"></span>
              <span>Degraded Uncertainty Envelope (±35%)</span>
            </span>
          )}
        </div>
        <span className="font-telemetry text-[10px] text-[var(--text-muted)] tracking-wider uppercase">
          Click centroid marker to switch operational focus
        </span>
      </div>
    </div>
  );
}