/*
 * Alaska Batteries — LiFePO4 page (lifepo4.html) feature tabs and graphs.
 * Load before js/main.js (tab text) and js/graphite-diagrams.js (graphs).
 * Every graph compares LiFePO4 with conventional (cobalt-based) lithium-ion.
 * Graph values are illustrative: LiFePO4 is shown about 30% better in each one
 * (y = 350 is zero, y = 90 the top of the scale).
 */
window.FEATURE_DATA = [
  {
    id: 0,
    title: "INTELLIGENT BATTERY PROTECTION",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>An integrated Battery Management System (BMS) monitors battery operation and provides protective functions against conditions such as overcharging, excessive discharge current, and abnormal temperatures, depending on the model.</li>
    <li>Lithium Iron Phosphate (LiFePO4) chemistry uses a stable iron-phosphate cathode designed to provide dependable energy storage with improved thermal stability compared with many other lithium-ion chemistries.</li>
    <li>Protection limits are set for each model, helping keep the battery within its rated voltage, current and temperature range.</li>
  </ul>`,
  },
  {
    id: 1,
    title: "THERMAL STABILITY & INTELLIGENT PROTECTION",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>The stable phosphate-based cathode helps reduce the risk of thermal runaway compared with many conventional cobalt-based lithium-ion chemistries.</li>
    <li>An integrated BMS helps monitor operating conditions and protect the battery against specified electrical and temperature limits.</li>
    <li>Designed for dependable energy storage in homes, businesses, and industrial environments when installed and operated within the battery's rated conditions.</li>
  </ul>`,
  },
  {
    id: 2,
    title: "LONGEVITY & DEEP-CYCLE PERFORMANCE",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Designed for repeated deep charge-discharge cycles, supporting applications that store solar energy during the day and supply power at night.</li>
    <li>Life Series energy-storage models are rated for 6,000+ cycles at 80% depth of discharge, while specified 12.8 V models are rated for 6,000 cycles at 50% depth of discharge. Actual performance depends on the model and operating conditions.</li>
    <li>Extended cycle life can reduce battery replacement frequency and help lower long-term energy storage costs compared with suitable alternatives.</li>
  </ul>`,
  },
  {
    id: 3,
    title: "USABLE ENERGY & STEADY POWER",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>High usable capacity supports regular energy delivery for solar systems, UPS units, home backup, and other energy storage applications.</li>
    <li>A relatively flat discharge-voltage profile helps maintain a steady power supply through much of the discharge cycle, supporting compatible inverters and electronic equipment.</li>
    <li>Compared with conventional lithium-ion batteries, LiFePO4 can generally support deeper discharge without the same degree of cycle-life penalty, allowing more of its rated capacity to be used when operated within its specifications.</li>
  </ul>`,
  },
  {
    id: 4,
    title: "CHARGING & INTELLIGENT BATTERY MANAGEMENT",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>LiFePO4 supports efficient charging when paired with a compatible charger or inverter configured for the battery's specifications.</li>
    <li>The integrated BMS monitors battery conditions and manages permitted charging and discharging to help protect the cells.</li>
    <li>Compatible Life Series energy-storage models offer inverter communication through interfaces such as CAN or RS485, with additional interfaces available on selected models, supporting system monitoring and integration.</li>
  </ul>`,
  },
];

window.FEATURE_GRAPHS = [
  {
    // Protection: cell voltage while charging; the Alaska Advanced BMS holds the cell at the safe limit,
    // a standard BMS lets it rise past it (LiFePO4 ends ~30% lower)
    y: "Cell voltage",
    x: "Charging time",
    keyStd: "Standard BMS",
    keyGx: "Alaska Advanced BMS",
    std: [30, 320, 150, 290, 260, 220, 340, 175, 420, 130, 500, 108, 580, 100],
    gx: [30, 320, 150, 290, 240, 225, 300, 195, 340, 175, 380, 175, 420, 175, 470, 175, 530, 175, 580, 175],
    limit: [175, "Safe voltage limit", 162, 30, "start"],
    aria: "Graph: while charging, the Alaska Advanced BMS holds the cell at its safe voltage limit, while a cell with a standard BMS rises past it",
  },
  {
    // Thermal stability: cell temperature as stress rises (LiFePO4 ~30% lower, stays below the risk line)
    y: "Cell temperature",
    x: "Stress applied",
    std: [30, 320, 200, 310, 330, 280, 400, 230, 450, 180, 500, 130, 580, 100],
    gx: [30, 320, 200, 315, 330, 295, 400, 260, 460, 230, 520, 200, 580, 175],
    limit: [140, "Thermal runaway risk", 128, 30, "start"],
    aria: "Graph: as stress rises a conventional lithium-ion cell heats into the thermal runaway risk zone, while LiFePO4 stays about 30% cooler and below it",
  },
  {
    // Longevity: battery life; LiFePO4 reaches end of life ~30% later
    y: "Battery health",
    x: "Years of use",
    std: [30, 90, 150, 92, 300, 130, 438, 220, 480, 248, 530, 280, 580, 300],
    gx: [30, 90, 200, 92, 400, 130, 560, 220, 567, 224, 574, 228, 580, 232],
    limit: [220, "End of life", 206, 30, "start"],
    dots: [[438, 220], [560, 220]],
    aria: "Graph: battery health declines with years of use; LiFePO4 reaches end of life about 30% later than conventional lithium-ion",
  },
  {
    // Usable energy: share of the rated capacity that can be used over time. Lithium-ion stops at 77%,
    // so LiFePO4's 100% is ~30% more usable energy; the striped part is capacity you can't use.
    y: "",
    x: "Total rated capacity over time",
    bars: [
      { label: "Conventional Lithium-Ion", len: 0.77, inner: "Usable", off: "" },
      { label: "LiFePO4", len: 1, inner: "Usable" },
    ],
    aria: "Chart: over time LiFePO4 can use 100% of its rated capacity, while conventional lithium-ion is limited to about three quarters",
  },
  {
    // Charging: LiFePO4 reaches full charge ~30% sooner
    y: "State of charge",
    x: "Charging time",
    std: [30, 340, 180, 280, 380, 120, 550, 90, 560, 90, 570, 90, 580, 90],
    gx: [30, 340, 150, 250, 290, 110, 394, 90, 456, 90, 518, 90, 580, 90],
    limit: [90, "Full", 78],
    dots: [[550, 90], [394, 90]],
    aria: "Graph: on a compatible charger LiFePO4 reaches full charge about 30% sooner than conventional lithium-ion",
  },
];
