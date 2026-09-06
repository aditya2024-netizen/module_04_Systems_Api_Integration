"use client";

import { useEffect, useRef } from "react";

export default function ZoneMap({
  activeLocation,
  zones = [],
  onSelectZone,
  activeTimelineStep,
  isRadarOutage,
  responseRoute,
  activeMode,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const zoneMarkersRef = useRef({});
  const depthCircleRef = useRef(null);
  const uncertaintyCircleRef = useRef(null);
  const routePolylineRef = useRef(null);
  const blockedMarkersRef = useRef([]);

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
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
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
          radius: isSelected ? 11 : 7,
          color: isSelected ? "oklch(62% 0.22 25)" : "oklch(72% 0.12 215)",
          fillColor: isSelected ? "oklch(62% 0.22 25)" : "oklch(22% 0.015 230)",
          fillOpacity: 0.9,
          weight: isSelected ? 3 : 1.5,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-size:12px; line-height:1.4;">
            <strong style="color:#f1f5f9;">${z.zone_name || zId} (${zId})</strong><br/>
            <span style="color:#94a3b8;">Terrain: ${z.flood_area_type || "Adyar Basin"}</span>
          </div>`
        );

        marker.on("click", () => {
          if (onSelectZone) onSelectZone(zId);
        });

        zoneMarkersRef.current[zId] = marker;
      });
    }

    initMap();

    return () => {
      isMounted = false;
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

      zones.forEach((z) => {
        if (typeof z.latitude !== "number" || typeof z.longitude !== "number") return;
        const zId = z.zone_id;
        const isSelected = zId === currentZoneId;

        const marker = L.circleMarker([z.latitude, z.longitude], {
          radius: isSelected ? 11 : 7,
          color: isSelected ? "oklch(62% 0.22 25)" : "oklch(72% 0.12 215)",
          fillColor: isSelected ? "oklch(62% 0.22 25)" : "oklch(22% 0.015 230)",
          fillOpacity: 0.9,
          weight: isSelected ? 3 : 1.5,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-size:12px; line-height:1.4;">
            <strong style="color:#f1f5f9;">${z.zone_name || zId} (${zId})</strong><br/>
            <span style="color:#94a3b8;">Terrain: ${z.flood_area_type || "Adyar Basin"}</span>
          </div>`
        );

        marker.on("click", () => {
          if (onSelectZone) onSelectZone(zId);
        });

        zoneMarkersRef.current[zId] = marker;
      });
    });
  }, [zones, hasValidCoordinates]);

  // Update Center & Active Zone Pin
  useEffect(() => {
    if (!mapInstanceRef.current || !hasValidCoordinates) return;
    const map = mapInstanceRef.current;
    map.flyTo([currentLat, currentLng], 13, { duration: 0.6 });

    Object.entries(zoneMarkersRef.current).forEach(([zId, marker]) => {
      const isSelected = zId === currentZoneId;
      marker.setStyle({
        radius: isSelected ? 12 : 7,
        color: isSelected ? "oklch(62% 0.22 25)" : "oklch(72% 0.12 215)",
        fillColor: isSelected ? "oklch(62% 0.22 25)" : "oklch(22% 0.015 230)",
        weight: isSelected ? 3 : 1.5,
      });
      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [currentLat, currentLng, currentZoneId, hasValidCoordinates]);

  // Update Inundation Depth Halo
  useEffect(() => {
    if (!mapInstanceRef.current || !hasValidCoordinates) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((leafletModule) => {
      const L_inst = leafletModule.default || leafletModule;
      if (depthCircleRef.current) {
        map.removeLayer(depthCircleRef.current);
        depthCircleRef.current = null;
      }

      const floodProb = activeTimelineStep ? activeTimelineStep.flood_probability : 0.5;
      let haloRadius = 400;
      let haloColor = "oklch(68% 0.16 142)";

      if (floodProb >= 0.75) {
        haloRadius = 1400;
        haloColor = "oklch(62% 0.22 25)";
      } else if (floodProb >= 0.45) {
        haloRadius = 900;
        haloColor = "oklch(69% 0.19 50)";
      }

      depthCircleRef.current = L_inst.circle([currentLat, currentLng], {
        radius: haloRadius,
        color: haloColor,
        fillColor: haloColor,
        fillOpacity: 0.25,
        weight: 1.5,
        dashArray: "4 4",
      }).addTo(map);
    });
  }, [currentLat, currentLng, activeTimelineStep, hasValidCoordinates]);

  // Update Radar Outage Uncertainty Visualization
  useEffect(() => {
    if (!mapInstanceRef.current || !hasValidCoordinates) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((leafletModule) => {
      const L_inst = leafletModule.default || leafletModule;
      if (uncertaintyCircleRef.current) {
        map.removeLayer(uncertaintyCircleRef.current);
        uncertaintyCircleRef.current = null;
      }

      if (isRadarOutage) {
        uncertaintyCircleRef.current = L_inst.circle([currentLat, currentLng], {
          radius: 2600,
          color: "oklch(69% 0.19 50)",
          fillColor: "oklch(69% 0.19 50)",
          fillOpacity: 0.12,
          weight: 2,
          dashArray: "8 8",
        }).addTo(map);
      }
    });
  }, [isRadarOutage, currentLat, currentLng, hasValidCoordinates]);

  // Update Response Routing in Response Mode
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

      if (activeMode === "response" && responseRoute) {
        if (responseRoute.route_coordinates && responseRoute.route_coordinates.length > 0) {
          routePolylineRef.current = L_inst.polyline(responseRoute.route_coordinates, {
            color: "oklch(68% 0.16 142)",
            weight: 4,
            opacity: 0.9,
            dashArray: "6 6",
          }).addTo(map);
        }

        if (responseRoute.blocked_coordinates) {
          responseRoute.blocked_coordinates.forEach((pt) => {
            const blockedIcon = L_inst.circleMarker(pt, {
              radius: 9,
              color: "oklch(62% 0.22 25)",
              fillColor: "oklch(62% 0.22 25)",
              fillOpacity: 0.9,
              weight: 2,
            }).addTo(map);
            blockedIcon.bindPopup(`<b>SIMULATED CHOKE POINT</b><br/>${responseRoute.impassable_road || "Road Inundated"}`);
            blockedMarkersRef.current.push(blockedIcon);
          });
        }
      }
    });
  }, [activeMode, responseRoute]);

  if (!hasValidCoordinates) {
    return (
      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-6 text-center space-y-2">
        <div className="text-2xl text-amber-400">🗺️</div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Spatial Geometry Unavailable
        </h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
          The active incident payload did not provide centroid coordinates. In accordance with data honesty standards, geometry is not fabricated.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--border)] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sky-400 font-telemetry text-sm">⌖</span>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase font-telemetry">
              Spatial Hydrodynamic &amp; Inundation GIS Grid
            </h2>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-telemetry mt-0.5">
            PROJECTION: WGS84 (EPSG:4326) · ADYAR CATCHMENT MESH (5m DEM) · CHENNAI PILOT
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-telemetry">
          <span className="px-2.5 py-1 rounded bg-[var(--canvas)] border border-[var(--border)] text-slate-300">
            LAT: <strong className="text-white">{currentLat.toFixed(4)}° N</strong> · LON: <strong className="text-white">{currentLng.toFixed(4)}° E</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-sky-950/70 text-sky-300 border border-sky-500/50 font-bold uppercase text-[10px]">
            {currentAreaType}
          </span>
        </div>
      </div>

      <div className="relative h-72 sm:h-84 md:h-96 w-full rounded-lg overflow-hidden border border-[var(--border)] my-3 corner-accents">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
        <div className="absolute top-2.5 right-2.5 z-1000 px-2.5 py-1 rounded bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--border)] text-[10px] font-telemetry text-slate-300 flex items-center gap-2 pointer-events-none shadow-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SPATIAL MESH ACTIVE · ZONE: {currentZoneId}</span>
        </div>
      </div>

      {/* Map Tactical Legend */}
      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-[var(--text-secondary)] gap-2 bg-[var(--canvas)] p-2.5 rounded-md border border-[var(--border)]/70">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--critical)] shadow-sm shadow-rose-500/50"></span>
            <span className="font-telemetry text-[11px] text-slate-200">0.5–1.0m+ Critical Inundation</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--warning)] shadow-sm shadow-amber-500/50"></span>
            <span className="font-telemetry text-[11px] text-slate-200">0.3–0.5m Moderate Ponding</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--safe)] shadow-sm shadow-emerald-500/50"></span>
            <span className="font-telemetry text-[11px] text-slate-200">&lt;0.1m Nominal Surface Runoff</span>
          </span>
          {activeMode === "response" && (
            <>
              <span className="flex items-center gap-1.5 font-semibold text-[var(--safe)]">
                <span className="h-1 w-3.5 bg-[var(--safe)] rounded inline-block"></span>
                <span className="font-telemetry text-[11px]">Safe Bypass Corridor</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[var(--critical)]">
                <span className="h-2 w-2 rounded-full bg-[var(--critical)]"></span>
                <span className="font-telemetry text-[11px]">Roadway Choke Point</span>
              </span>
            </>
          )}
          {isRadarOutage && (
            <span className="flex items-center gap-1.5 text-amber-300 font-telemetry text-[11px] border-l border-[var(--border)] pl-3">
              <span className="h-2 w-2 rounded-full border border-amber-400 bg-amber-400/20"></span>
              <span>Degraded Uncertainty Envelope (±35%)</span>
            </span>
          )}
        </div>
        <span className="font-telemetry text-[10px] text-slate-400 tracking-wider uppercase">
          Click zone marker to switch operational focus
        </span>
      </div>
    </div>
  );
}