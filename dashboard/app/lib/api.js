/**
 * HydroSurge AI — Centralized Frontend API Client
 *
 * Enforces the core integration architectural invariant:
 * THE FRONTEND CONSUMES DOMAIN DATA EXCLUSIVELY VIA THE FASTAPI CONTRACT.
 * NO DIRECT FILE READS, NO LOCAL HARDCODED SCENARIO COPIES.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
  return res.json();
}

export async function fetchEvents() {
  const res = await fetch(`${API_BASE_URL}/events`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch events failed with status ${res.status}`);
  return res.json();
}

export async function fetchEvent(eventId, { simulateRadarOutage = false } = {}) {
  const url = `${API_BASE_URL}/event/${eventId}?simulate_radar_outage=${simulateRadarOutage}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Fetch event ${eventId} failed (${res.status}): ${errorBody}`);
  }
  return res.json();
}

export async function fetchRiskTiles(zoneId = null) {
  const url = zoneId
    ? `${API_BASE_URL}/risk?zone_id=${encodeURIComponent(zoneId)}`
    : `${API_BASE_URL}/risk`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch risk tiles failed with status ${res.status}`);
  return res.json();
}

export { API_BASE_URL };
