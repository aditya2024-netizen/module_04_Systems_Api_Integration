"use client";

import { useEffect, useRef } from "react";
import { ZONE_COORDINATES } from "../data/fallback";

export default function ZoneMap({ selectedZoneId, onSelectZone }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  const activeZone = ZONE_COORDINATES[selectedZoneId] || ZONE_COORDINATES.Z42;

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

      Object.entries(ZONE_COORDINATES).forEach(([zId, zData]) => {
        const isSelected = zId === selectedZoneId;
        const marker = L.circleMarker([zData.lat, zData.lng], {
          radius: isSelected ? 12 : 7,
          color: isSelected ? "#f43f5e" : "#38bdf8",
          fillColor: isSelected ? "#e11d48" : "#0284c7",
          fillOpacity: 0.85,
          weight: isSelected ? 3 : 1.5,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-size:12px; line-height:1.4;">
            <strong style="color:#f1f5f9;">${zData.name} (${zId})</strong><br/>
            <span style="color:#94a3b8;">Terrain: ${zData.floodArea}</span>
          </div>`
        );

        marker.on("click", () => {
          if (onSelectZone) onSelectZone(zId);
        });

        markersRef.current[zId] = marker;
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

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (activeZone) {
      map.flyTo([activeZone.lat, activeZone.lng], 13, { duration: 0.8 });
    }

    Object.entries(markersRef.current).forEach(([zId, marker]) => {
      const isSelected = zId === selectedZoneId;
      marker.setStyle({
        radius: isSelected ? 13 : 7,
        color: isSelected ? "#f43f5e" : "#38bdf8",
        fillColor: isSelected ? "#e11d48" : "#0284c7",
        weight: isSelected ? 3 : 1.5,
      });
      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [selectedZoneId, activeZone]);

  return (
    <div className="rounded-xl bg-[#0e1626] border border-[#1e2d4a]/70 p-5 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Spatial Inundation & Zone Map
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial overlay for Greater Chennai Corporation basin
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>{activeZone.lat.toFixed(4)}° N, {activeZone.lng.toFixed(4)}° E</span>
          <span className="inline-block px-2 py-0.5 rounded bg-[#141e33] text-slate-300 border border-[#1e2d4a]">
            {activeZone.floodArea}
          </span>
        </div>
      </div>

      <div className="relative h-80 sm:h-96 w-full rounded-lg overflow-hidden border border-[#1e2d4a]/50 my-2">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30"></span>
            <span className="text-slate-300">Active Alert Zone ({selectedZoneId})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400"></span>
            <span>Monitored Basins</span>
          </span>
        </div>
        <span>Click any zone pin on the map to switch telemetry</span>
      </div>
    </div>
  );
}