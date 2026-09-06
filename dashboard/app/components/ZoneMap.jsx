"use client";

import { useEffect, useRef } from "react";
import { ZONE_COORDINATES } from "../data/fallback";

export default function ZoneMap({
  selectedZoneId,
  onSelectZone,
  activeTimelineStep,
  isRadarOutage,
  activeIncident,
  activeMode,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const zoneMarkersRef = useRef({});
  const depthCircleRef = useRef(null);
  const uncertaintyCircleRef = useRef(null);
  const routePolylineRef = useRef(null);
  const blockedMarkersRef = useRef([]);

  const activeZone = ZONE_COORDINATES[selectedZoneId] || ZONE_COORDINATES.Z42;

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [activeZone.lat, activeZone.lng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Base Zone Markers
      Object.entries(ZONE_COORDINATES).forEach(([zId, zData]) => {
        const marker = L.circleMarker([zData.lat, zData.lng], {
          radius: zId === selectedZoneId ? 11 : 7,
          color: zId === selectedZoneId ? "oklch(62% 0.22 25)" : "oklch(72% 0.12 215)",
          fillColor: zId === selectedZoneId ? "oklch(62% 0.22 25)" : "oklch(22% 0.015 230)",
          fillOpacity: 0.9,
          weight: zId === selectedZoneId ? 3 : 1.5,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-size:12px; line-height:1.4;">
            <strong style="color:#f1f5f9;">${zData.name} (${zId})</strong><br/>
            <span style="color:#94a3b8;">Terrain: ${zData.floodArea}</span><br/>
            <span style="color:#94a3b8;">Population: ${zData.population.toLocaleString()}</span>
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
  }, []);

  // Update Center & Active Zone Pin
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (activeZone) {
      map.flyTo([activeZone.lat, activeZone.lng], 13, { duration: 0.6 });
    }

    Object.entries(zoneMarkersRef.current).forEach(([zId, marker]) => {
      const isSelected = zId === selectedZoneId;
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
  }, [selectedZoneId, activeZone]);

  // Update Inundation Depth Halo according to Timeline Step
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const L = window.L || (mapInstanceRef.current && mapInstanceRef.current._leaflet_id ? window.L : null);

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

      depthCircleRef.current = L_inst.circle([activeZone.lat, activeZone.lng], {
        radius: haloRadius,
        color: haloColor,
        fillColor: haloColor,
        fillOpacity: 0.25,
        weight: 1.5,
        dashArray: "4 4",
      }).addTo(map);
    });
  }, [selectedZoneId, activeTimelineStep, activeZone]);

  // Update Radar Outage Uncertainty Visualization
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((leafletModule) => {
      const L_inst = leafletModule.default || leafletModule;
      if (uncertaintyCircleRef.current) {
        map.removeLayer(uncertaintyCircleRef.current);
        uncertaintyCircleRef.current = null;
      }

      if (isRadarOutage) {
        uncertaintyCircleRef.current = L_inst.circle([activeZone.lat, activeZone.lng], {
          radius: 2600,
          color: "oklch(69% 0.19 50)",
          fillColor: "oklch(69% 0.19 50)",
          fillOpacity: 0.12,
          weight: 2,
          dashArray: "8 8",
        }).addTo(map);
      }
    });
  }, [isRadarOutage, activeZone]);

  // Update Response Routing & Blocked Segments in Response Mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    import("leaflet").then((leafletModule) => {
      const L_inst = leafletModule.default || leafletModule;

      // Clean up previous route
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }
      blockedMarkersRef.current.forEach((m) => map.removeLayer(m));
      blockedMarkersRef.current = [];

      if (activeMode === "response" && activeIncident) {
        // Draw Safe Evacuation Route
        if (activeIncident.routeCoordinates && activeIncident.routeCoordinates.length > 0) {
          routePolylineRef.current = L_inst.polyline(activeIncident.routeCoordinates, {
            color: "oklch(68% 0.16 142)",
            weight: 4,
            opacity: 0.9,
            dashArray: "6 6",
          }).addTo(map);
        }

        // Draw Blocked Road Points
        if (activeIncident.blockedCoordinates) {
          activeIncident.blockedCoordinates.forEach((pt) => {
            const blockedIcon = L_inst.circleMarker(pt, {
              radius: 9,
              color: "oklch(62% 0.22 25)",
              fillColor: "oklch(62% 0.22 25)",
              fillOpacity: 0.9,
              weight: 2,
            }).addTo(map);
            blockedIcon.bindPopup(`<b>IMPASSABLE ROAD CHOKE</b><br/>${activeIncident.impassableRoad}`);
            blockedMarkersRef.current.push(blockedIcon);
          });
        }
      }
    });
  }, [activeMode, activeIncident]);

  return (
    <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Spatial nowcast and inundation map
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Chennai pilot catchment · Adyar Basin ward grid
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-telemetry">
          <span>{activeZone.lat.toFixed(4)}° N, {activeZone.lng.toFixed(4)}° E</span>
          <span className="px-2 py-0.5 rounded bg-[var(--card-elevated)] text-[var(--text-primary)] border border-[var(--border)]">
            {activeZone.floodArea}
          </span>
        </div>
      </div>

      <div className="relative h-80 sm:h-96 w-full rounded-md overflow-hidden border border-[var(--border)] my-2">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>

      {/* Map Legend */}
      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-[var(--text-secondary)] gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--critical)]"></span>
            <span>0.5–1.0m+ depth</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]"></span>
            <span>0.3–0.5m depth</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--safe)]"></span>
            <span>&lt;0.1m depth</span>
          </span>
          {activeMode === "response" && (
            <>
              <span className="flex items-center gap-1.5 font-semibold text-[var(--safe)]">
                <span className="h-0.5 w-3 bg-[var(--safe)] inline-block"></span>
                <span>Safe route</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[var(--critical)]">
                <span className="h-2 w-2 rounded-full bg-[var(--critical)]"></span>
                <span>Blocked road</span>
              </span>
            </>
          )}
          {isRadarOutage && (
            <span className="flex items-center gap-1.5 text-[var(--warning)] font-telemetry">
              <span className="h-2 w-2 rounded-full border border-[var(--warning)]"></span>
              <span>Degraded uncertainty envelope</span>
            </span>
          )}
        </div>
        <span className="font-telemetry text-[11px]">Click zone marker to switch</span>
      </div>
    </div>
  );
}