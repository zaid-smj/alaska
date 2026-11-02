/*
 * Alaska Batteries — Calcium Silver page (CaAg.html) feature tabs and graphs.
 * Load before js/main.js (tab text) and js/graphite-diagrams.js (graphs).
 * Graph values are illustrative: Calcium-Silver is shown about 30% better than
 * normal calcium maintenance-free in each one (y = 350 is zero, y = 90 the top).
 */
window.FEATURE_DATA = [
  {
    id: 0,
    title: "SILVER-ENHANCED CALCIUM GRID TECHNOLOGY",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Silver-enhanced lead-calcium alloy grids are designed to improve corrosion resistance compared with conventional calcium maintenance-free grids, supporting long-term battery durability.</li>
    <li>Improved grid stability and electrical conductivity help maintain efficient current flow and dependable starting performance under demanding operating conditions.</li>
    <li>Enhanced resistance to grid deterioration at elevated temperatures supports reliable operation and helps preserve battery performance throughout its service life.</li>
  </ul>`,
  },
  {
    id: 1,
    title: "HIGH-TEMPERATURE DURABILITY",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Silver-enhanced grid technology is designed to improve structural stability at elevated temperatures, helping the battery withstand demanding automotive operating environments.</li>
    <li>Improved resistance to grid corrosion and growth helps maintain internal structural integrity, supporting dependable performance under hot-climate conditions.</li>
    <li>Helps the battery cope with high under-bonnet temperatures, which speed up grid wear in conventional calcium batteries.</li>
  </ul>`,
  },
  {
    id: 2,
    title: "EXTENDED BATTERY LIFE",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Greater durability may extend service life and reduce replacement frequency, offering improved long-term value when supported by real-world performance data.</li>
    <li>Slower grid corrosion helps the battery keep its capacity for longer as it ages.</li>
    <li>Maintenance-free construction with low water consumption means no topping up throughout the battery's service life.</li>
  </ul>`,
  },
  {
    id: 3,
    title: "CONSISTENT COLD CRANKING PERFORMANCE",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Stable grid construction supports reliable current delivery during engine starting, helping meet the high instantaneous power demands of automotive applications.</li>
    <li>Improved resistance to grid deterioration may help preserve cranking performance as the battery ages under suitable operating and charging conditions.</li>
    <li>Designed for dependable starting performance in demanding climates and vehicle applications, including environments where high temperatures place additional stress on battery components.</li>
  </ul>`,
  },
  {
    id: 4,
    title: "EFFICIENT CHARGE ACCEPTANCE & MAINTENANCE-FREE OPERATION",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Lead-calcium grid technology supports low water consumption, helping reduce routine maintenance requirements under normal operating conditions.</li>
    <li>Silver-enhanced grid composition may support efficient current flow and stable charging performance, depending on the specific alloy formulation and battery design.</li>
    <li>Designed to provide dependable charging and starting performance in modern automotive electrical systems when used with an appropriate charging system.</li>
  </ul>`,
  },
];

window.FEATURE_GRAPHS = [
  {
    // Composition: grid corrosion over operating time (Ca-Ag ~30% lower)
    y: "Grid corrosion",
    x: "Operating time",
    std: [30, 335, 120, 330, 200, 290, 260, 240, 320, 190, 420, 140, 580, 121],
    gx: [30, 335, 120, 333, 200, 305, 260, 280, 320, 255, 420, 215, 580, 189],
    aria: "Graph: grid corrosion rises over operating time for both batteries; Calcium-Silver ends about 30% lower",
  },
  {
    // Heat resistance: capacity retained after the same high-temperature exposure (Ca-Ag ~30% more)
    y: "",
    x: "Capacity retained after high-temperature exposure",
    bars: [
      { label: "Normal Calcium Maintenance-Free", len: 0.6, inner: "Capacity retained" },
      { label: "Calcium-Silver Maintenance-Free", len: 0.78, inner: "Capacity retained" },
    ],
    aria: "Chart: after the same high-temperature exposure Calcium-Silver retains about 30% more capacity than normal calcium maintenance-free",
  },
  {
    // Longevity: battery life; Ca-Ag reaches end of life ~30% later
    y: "Battery health",
    x: "Years of use",
    std: [30, 90, 150, 92, 300, 130, 438, 220, 480, 248, 530, 280, 580, 300],
    gx: [30, 90, 200, 92, 400, 130, 560, 220, 567, 224, 574, 228, 580, 232],
    limit: [220, "End of life", 206, 30, "start"],
    dots: [[438, 220], [560, 220]],
    aria: "Graph: battery health declines with years of use; Calcium-Silver reaches end of life about 30% later",
  },
  {
    // Starting power: cold cranking performance over battery life (Ca-Ag retains ~30% more)
    y: "Cold cranking performance",
    x: "Battery age",
    std: [30, 100, 160, 104, 260, 130, 340, 165, 420, 195, 500, 205, 580, 207],
    gx: [30, 100, 200, 101, 320, 112, 400, 130, 470, 148, 530, 160, 580, 164],
    aria: "Graph: cold cranking performance declines as the battery ages; Calcium-Silver retains about 30% more",
  },
  {
    // Charge: Ca-Ag reaches full charge ~30% sooner
    y: "State of charge",
    x: "Charging time",
    std: [30, 340, 180, 280, 380, 120, 550, 90, 560, 90, 570, 90, 580, 90],
    gx: [30, 340, 150, 250, 290, 110, 394, 90, 456, 90, 518, 90, 580, 90],
    limit: [90, "Full", 78],
    dots: [[550, 90], [394, 90]],
    aria: "Graph: on the same charger Calcium-Silver reaches full charge about 30% sooner than normal calcium maintenance-free",
  },
];
