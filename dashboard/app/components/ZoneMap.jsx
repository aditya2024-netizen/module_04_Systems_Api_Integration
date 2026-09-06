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
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      Object.entries(ZONE_COORDINATES).forEach(([zId, zData]) => {
        const marker = L.circleMarker([zData.lat, zData.lng], {
          radius: zId === selectedZoneId ? 14 : 8,
          color: zId === selectedZoneId ? "#f43f5e" : "#0284c7",
          fillColor: zId === selectedZoneId ? "#e11d48" : "#38bdf8",
          fillOpacity: 0.85,
          weight: 2,
        }).addTo(map);

        marker.bindPopup(`<b>${zId} - ${zData.name}</b><br/>Area: ${zData.floodArea}`);
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
      map.flyTo([activeZone.lat, activeZone.lng], 13, { duration: 1.2 });
    }

    Object.entries(markersRef.current).forEach(([zId, marker]) => {
      const isSelected = zId === selectedZoneId;
      marker.setStyle({
        radius: isSelected ? 14 : 8,
        color: isSelected ? "#f43f5e" : "#0284c7",
        fillColor: isSelected ? "#e11d48" : "#38bdf8",
      });
      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [selectedZoneId, activeZone]);

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🗺️</span> Real-time Interactive Leaflet GIS Map
          </h2>
          <p className="text-xs text-slate-400">
            Chennai Metropolitan Urban Basin (OpenStreetMap + Leaflet Engine)
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
          {activeZone.lat}° N, {activeZone.lng}° E
        </span>
      </div>

      <div className="relative h-72 w-full rounded-xl overflow-hidden border border-slate-800">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Active Focus: <strong className="text-white">{activeZone.name}</strong></span>
        <span>Topography: <strong className="text-cyan-400">{activeZone.floodArea}</strong></span>
      </div>
    </div>
  );
}