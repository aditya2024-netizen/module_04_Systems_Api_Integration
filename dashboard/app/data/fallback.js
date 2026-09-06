export const SAMPLE_EVENTS = [
  { id: "E001", zone: "Z42", name: "Velachery South", priority: "CRITICAL" },
  { id: "E002", zone: "Z18", name: "Saidapet Adyar Corridor", priority: "HIGH" },
  { id: "E003", zone: "Z07", name: "T. Nagar Commercial Core", priority: "HIGH" },
  { id: "E004", zone: "Z29", name: "Tambaram Lowlands", priority: "MEDIUM" },
  { id: "E005", zone: "Z12", name: "Marina Coastal", priority: "LOW" },
];

export const ZONE_COORDINATES = {
  Z42: { lat: 12.9815, lng: 80.2180, name: "Velachery South", floodArea: "Depression Bowl", population: 21400, hospitals: 2, shelters: 4 },
  Z18: { lat: 13.0210, lng: 80.2230, name: "Saidapet Adyar", floodArea: "River Floodplain", population: 14200, hospitals: 3, shelters: 5 },
  Z07: { lat: 13.0418, lng: 80.2341, name: "T. Nagar Core", floodArea: "Drainage Choke", population: 35000, hospitals: 4, shelters: 3 },
  Z29: { lat: 12.9249, lng: 80.1000, name: "Tambaram Basin", floodArea: "Lowland Outflow", population: 8500, hospitals: 1, shelters: 2 },
  Z12: { lat: 13.0500, lng: 80.2824, name: "Marina Coastal", floodArea: "Coastal Sand Shelf", population: 3200, hospitals: 1, shelters: 2 },
};

export const INCIDENTS = [
  {
    id: "INC-01",
    title: "Critical Ward 42 Rescue & Evacuation",
    zoneId: "Z42",
    priority: "CRITICAL",
    riskScore: "0.92",
    leadTime: "T-20 min",
    impassableRoad: "Velachery Main Road (Near Lake)",
    safeRoute: "Inner Ring Road -> OMR Elevated Bypass",
    milestones: [
      { time: "T-20 min", label: "Velachery low-lying segments become impassable" },
      { time: "T-35 min", label: "Overland flood surge reaches residential culverts" },
      { time: "T-70 min", label: "Projected peak inundation depth (0.85m)" }
    ],
    routeCoordinates: [
      [12.9815, 80.2180],
      [12.9900, 80.2300],
      [13.0050, 80.2450],
      [13.0150, 80.2550]
    ],
    blockedCoordinates: [
      [12.9780, 80.2150],
      [12.9830, 80.2210]
    ]
  },
  {
    id: "INC-02",
    title: "Saidapet Adyar Causeway Silt Surge Response",
    zoneId: "Z18",
    priority: "HIGH",
    riskScore: "0.78",
    leadTime: "T-40 min",
    impassableRoad: "Saidapet Causeway Submerged",
    safeRoute: "Anna Salai Flyover Arterial",
    milestones: [
      { time: "T-25 min", label: "Adyar causeway water level approaches red mark" },
      { time: "T-45 min", label: "Sub-arterial feeder road inundation" },
      { time: "T-80 min", label: "Peak river corridor surge" }
    ],
    routeCoordinates: [
      [13.0210, 80.2230],
      [13.0280, 80.2350],
      [13.0380, 80.2450]
    ],
    blockedCoordinates: [
      [13.0180, 80.2200]
    ]
  },
  {
    id: "INC-03",
    title: "T. Nagar Commercial Core Traffic Diversion",
    zoneId: "Z07",
    priority: "HIGH",
    riskScore: "0.68",
    leadTime: "T-50 min",
    impassableRoad: "Usman Road Underpass Choke",
    safeRoute: "GN Chetty Road Elevated Corridor",
    milestones: [
      { time: "T-30 min", label: "Underpass pump overload warning" },
      { time: "T-50 min", label: "Commercial core storm drain choke" },
      { time: "T-90 min", label: "Drainage runoff stabilization" }
    ],
    routeCoordinates: [
      [13.0418, 80.2341],
      [13.0480, 80.2420],
      [13.0550, 80.2500]
    ],
    blockedCoordinates: [
      [13.0390, 80.2310]
    ]
  }
];