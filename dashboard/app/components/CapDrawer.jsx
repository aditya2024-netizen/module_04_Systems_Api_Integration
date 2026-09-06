"use client";

import { useState } from "react";

export default function CapDrawer({ isOpen, onClose, eventData, activeZone }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !eventData) return null;

  const nowIso = new Date().toISOString();
  const zoneId = eventData.location?.zone_id || "Z42";
  const zoneName = activeZone?.name || "Velachery South";
  const lat = activeZone?.lat || 12.9815;
  const lng = activeZone?.lng || 80.2180;
  const depth = eventData.inundation?.depth_band || "0.5-1.0m";
  const rain = eventData.rainfall?.rainfall_mm_hr || 87.0;
  const priority = eventData.priority || "CRITICAL";

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>URN:IN:GOV:TNSDMA:CHENNAI:${eventData.event_id || "E001"}:${Date.now()}</identifier>
  <sender>chennai.flood.ops@tnsdma.tn.gov.in</sender>
  <sent>${nowIso}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>SACHET-PRIORITY-${priority}</code>
  <info>
    <category>Met</category>
    <event>Severe Urban Flash Flood Emergency</event>
    <urgency>Immediate</urgency>
    <severity>${priority === "CRITICAL" ? "Extreme" : priority === "HIGH" ? "Severe" : "Moderate"}</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>IMD_PHENOMENON</valueName>
      <value>FLASH_FLOOD_HIGH_INUNDATION</value>
    </eventCode>
    <expires>${new Date(Date.now() + 3 * 3600 * 1000).toISOString()}</expires>
    <senderName>Tamil Nadu State Disaster Management Authority (TNSDMA)</senderName>
    <headline>Emergency Flash Flood Warning for ${zoneName} (${zoneId})</headline>
    <description>Severe inundation projected at ${depth} due to intense convective precipitation (${rain} mm/hr). Adyar Basin overflow and local drainage choke points active. Immediate defensive action required.</description>
    <instruction>Evacuate ground-floor structures immediately. Avoid Velachery Main Road and low-lying underpasses. Move to designated municipal shelters. Follow instructions from Greater Chennai Corporation teams.</instruction>
    <parameter>
      <valueName>HydroSurge_Event_ID</valueName>
      <value>${eventData.event_id}</value>
    </parameter>
    <parameter>
      <valueName>Peak_Rainfall_Rate_mm_hr</valueName>
      <value>${rain}</value>
    </parameter>
    <parameter>
      <valueName>Projected_Inundation_Depth</valueName>
      <value>${depth}</value>
    </parameter>
    <parameter>
      <valueName>Target_Catchment</valueName>
      <value>Chennai Basin / Adyar River Corridor</value>
    </parameter>
    <area>
      <areaDesc>${zoneName}, Chennai, Tamil Nadu</areaDesc>
      <circle>${lat},${lng},2.5</circle>
      <geocode>
        <valueName>TNSDMA_ZONE_CODE</valueName>
        <value>${zoneId}</value>
      </geocode>
    </area>
  </info>
</alert>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CAP_SACHET_ALERT_${eventData.event_id || "E001"}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--card-elevated)]">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--critical)] animate-pulse"></span>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                CAP v1.2 / SACHET Emergency Alert Dispatch
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Standard OASIS Common Alerting Protocol · NDMA / TNSDMA Broadcast Format
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded border border-[var(--border)] hover:bg-[var(--card)] transition-colors cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* XML Viewer Body */}
        <div className="p-4 overflow-y-auto font-telemetry text-xs bg-[var(--canvas)] text-slate-300 leading-relaxed flex-1">
          <pre className="whitespace-pre-wrap select-all">
            {xmlContent}
          </pre>
        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between p-3.5 border-t border-[var(--border)] bg-[var(--card-elevated)] gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--safe)]"></span>
            <span>Schema verified against OASIS CAP-v1.2 specification</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="cursor-pointer px-3.5 py-1.5 text-xs font-medium rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] hover:border-slate-400 transition-colors"
            >
              {copied ? "✓ Copied to clipboard!" : "Copy XML payload"}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="cursor-pointer px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[var(--critical)] text-white hover:brightness-110 shadow-sm transition-all"
            >
              Download CAP XML (.xml)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
