// js/inverter-data.js
// Alaska Inverters — Hybrid Solar Inverters (Dual Output | Grid Feeding optional).
// Source: Alaska Batteries Company Profile (tabular), pp. 19–20. Only the values printed
// in the profile are listed; "null" means the profile shows "-" (not yet published).

const inverterRange = {
  name: "Hybrid Solar Inverters",
  tagline: "Dual Output | Grid Feeding (optional)",
  image: "/assets/inverters/inverter-hybrid.webp",
  highlights: [
    {
      title: "High Reliability",
      points: [
        "Enhanced safety with Built-in Transformer Isolation, provides added protection for users.",
        "Built-in Powerful Optimizer effectively drives heavy home loads, ensuring reliable performance for demanding appliances.",
      ],
    },
    { title: "More Convenient", points: ["Maximum Charging Current, Faster Charging."] },
    {
      title: "High Compatibility",
      points: [
        "More surge-power has better protection function for special application scenarios such as refrigerator, air conditioner and water pump.",
        "Wider range, more power generation.",
      ],
    },
    {
      title: "Cost-Effective",
      points: ["Additional energy for battery charging at 100% capacity.", "Ensures maximum energy conversion and enhances overall system performance."],
    },
  ],
};

const inverterData = [
  { id: "inv-aoh-2", model: "AOH-2kW-12V", ratedKw: 2, batteryV: 12, phase: "1P", pvW: 3000, weightKg: 5.0, dims: { d: 102, w: 281.5, h: 339 }, ip: "IP21", mppt: "30–400 VDC", comms: "RS485 (BMS)" },
  { id: "inv-aoh-3.6", model: "AOH-3.6kW-24V", ratedKw: 3.6, batteryV: 24, phase: "1P", pvW: 5000, weightKg: 7.0, dims: { d: 117, w: 283, h: 423 }, ip: "IP21", mppt: "40~450 VDC", comms: "RS485 / RS232 / USB / Dry Contact" },
  { id: "inv-aoh-6.5", model: "AOH-6.5kW-48V", ratedKw: 6.5, batteryV: 48, phase: "1P", pvW: 9000, weightKg: 12, dims: { d: 124, w: 338, h: 513 }, ip: "IP21", mppt: "60~450 VDC", comms: "RS485 / RS232 / USB / Dry Contact" },
  // Listed in the profile with phase only — other specifications not yet published
  { id: "inv-aoh-8", model: "AOH-8kW-48V", ratedKw: 8, batteryV: null, phase: "1P", pvW: null, weightKg: null, dims: null, ip: null, mppt: null, comms: null, pending: true },
  { id: "inv-aoh-10", model: "AOH-10kW-48V", ratedKw: 10, batteryV: null, phase: "1P", pvW: null, weightKg: null, dims: null, ip: null, mppt: null, comms: null, pending: true },
  { id: "inv-aoh-12", model: "AOH-12kW-48V", ratedKw: 12, batteryV: null, phase: "1P", pvW: null, weightKg: null, dims: null, ip: null, mppt: null, comms: null, pending: true },
  { id: "inv-aoh-15", model: "AOH-15kW-48V", ratedKw: 15, batteryV: null, phase: "3P", pvW: null, weightKg: null, dims: null, ip: null, mppt: null, comms: null, pending: true },
];
