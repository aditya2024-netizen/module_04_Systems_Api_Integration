export const SAMPLE_EVENTS = [
  { id: "E001", zone: "Z42", name: "Velachery South", priority: "CRITICAL" },
  { id: "E002", zone: "Z18", name: "Saidapet Adyar Corridor", priority: "HIGH" },
  { id: "E003", zone: "Z07", name: "T. Nagar Commercial Core", priority: "HIGH" },
  { id: "E004", zone: "Z29", name: "Tambaram Lowlands", priority: "MEDIUM" },
  { id: "E005", zone: "Z12", name: "Marina Coastal", priority: "LOW" },
];

export const ZONE_COORDINATES = {
  Z42: { lat: 12.9815, lng: 80.2180, name: "Velachery South", floodArea: "High Bowl" },
  Z18: { lat: 13.0210, lng: 80.2230, name: "Saidapet Adyar", floodArea: "River Bank" },
  Z07: { lat: 13.0418, lng: 80.2341, name: "T. Nagar Core", floodArea: "Drain Choke" },
  Z29: { lat: 12.9249, lng: 80.1000, name: "Tambaram Basin", floodArea: "Lowlands" },
  Z12: { lat: 13.0500, lng: 80.2824, name: "Marina Coastal", floodArea: "Sand Shelf" },
};