/*
 * Alaska Batteries — Solar Calculator engine
 * ------------------------------------------------------------
 * Pure calculation and product-matching logic. No DOM access.
 * Used by js/solar-calculator.js in the browser and by
 * tests/js/solar-engine.test.mjs under Node.
 *
 * Product data is NOT duplicated here: the battery catalog is the
 * existing `batteryData` array from js/data.js, passed in at call time.
 * Inverter matching is implemented but runs against an inverter catalog
 * that the site does not publish yet (see INVERTER_CATALOG below).
 *
 * Every assumption lives in DEFAULTS and can be overridden by passing a
 * config object, or site-wide by defining window.SOLAR_CALC_CONFIG before
 * this file loads. See docs/solar-calculator.md for the formulas.
 */
(function (root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  else root.SolarEngine = engine;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------------------------------------------------------------
  // 1. Default assumptions (all configurable)
  // ---------------------------------------------------------------
  const DEFAULTS = {
    daysPerMonth: 30, // spec: monthly units use 30 days unless the customer says otherwise
    daysPerYear: 365,

    // Performance ratio = product of (1 - loss) for each loss below.
    losses: {
      temperature: 0.09, // hot-climate cell temperature loss
      soiling: 0.04, // dust between cleanings
      inverter: 0.03,
      wiringMismatch: 0.04, // DC/AC cabling + module mismatch
      other: 0.02, // availability, shading margin, degradation in year 1
    },

    panel: {
      defaultWatt: 585,
      options: [550, 585, 610, 650],
      efficiency: 0.225, // used only to estimate panel area
      layoutFactor: 1.25, // roof area per panel incl. gaps, walkways, edge set-backs
    },

    // Array sizing targets (share of annual consumption to generate)
    targetOffset: { "on-grid": 1.0, hybrid: 1.0, "off-grid": 1.0 },
    offGridDesignSeason: "winter", // off-grid arrays are sized for the weakest season
    offGridBatteryPathEfficiency: 0.88, // extra margin: night energy passes through the battery

    inverter: {
      efficiency: 0.9, // battery -> AC conversion
      dcAcRatio: { "on-grid": 1.2, hybrid: 1.25, "off-grid": 1.3 },
      standardSizesKw: [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100],
      offGridPeakFactor: 3, // household peak demand ≈ 3 × average demand
      backupSurgeFactor: 1.5, // headroom over backup load for motor starts
      threePhaseAboveKw: 10, // above this AC size, plan for a three-phase inverter
    },

    backup: {
      eveningFactor: 1.2, // outages often fall in higher-use hours
      offGridNightShare: 0.45, // share of daily use that falls outside solar hours
      levels: {
        essential: { pct: 25, label: "Essential", examples: "Lights, fans, Wi-Fi router, phone charging" },
        standard: { pct: 40, label: "Standard", examples: "Essentials + refrigerator, TV, small water pump" },
        extended: { pct: 60, label: "Extended", examples: "Standard + more fans, washing machine, an inverter AC on low" },
      },
      defaultHours: 4,
      extendedOptionFactor: 1.5, // the "Extended backup" product option targets 1.5 × the requirement
    },

    battery: {
      // Lead-acid design limits (the only chemistry in the current catalog)
      "lead-acid": {
        usableDoD: 0.5, // 50 % depth of discharge for acceptable cycle life
        maxDischargeC: 0.2, // continuous discharge ≤ C/5 per string
        chargeC: 0.1, // recommended charge current ≈ C/10
        chargeEfficiency: 0.85,
        unitVoltage: 12,
        maxParallelStrings: 4,
      },
      // LiFePO4 (Alaska Life Series brochure): cycle life is rated at 80 % DoD,
      // recommended charge/discharge 0.5C, BMS-managed
      lithium: {
        usableDoD: 0.8,
        maxDischargeC: 0.5,
        chargeC: 0.5,
        chargeEfficiency: 0.95,
        unitVoltage: 12.8,
        maxParallelStrings: 15,
      },
      bankVoltageBreakpointsKw: [
        { upToKw: 1.2, volts: 12 },
        { upToKw: 2.5, volts: 24 },
        { upToKw: Infinity, volts: 48 },
      ],
      // Which catalog items are suitable for cyclic solar/UPS duty
      eligibleCategories: ["Solar", "Deep-Cycle"],
      eligibleUseKeywords: ["solar inverter", "ups", "off-grid"],
      excludedSeries: ["mf"],
      purposeBuiltCategories: ["Solar", "Deep-Cycle"],
    },

    sqftPerM2: 10.7639,
  };

  // ---------------------------------------------------------------
  // 2. Solar resource (kWh per kWp per day, before system losses)
  // Seasonal averages per location from profilesolar.com/countries/PK,
  // which derives them from NASA POWER. Order: summer (Jun–Aug),
  // autumn (Sep–Nov), winter (Dec–Feb), spring (Mar–May).
  // These are estimates for preliminary sizing only.
  // ---------------------------------------------------------------
  const RESOURCE_SOURCE = "NASA POWER seasonal averages via profilesolar.com (estimate)";
  const LOCATIONS = [
    { id: "islamabad", name: "Islamabad", region: "ICT", s: [6.8, 4.99, 3.75, 6.39] },
    { id: "rawalpindi", name: "Rawalpindi", region: "Punjab", s: [6.8, 4.99, 3.75, 6.39] },
    { id: "lahore", name: "Lahore", region: "Punjab", s: [6.33, 4.82, 3.55, 6.51] },
    { id: "faisalabad", name: "Faisalabad", region: "Punjab", s: [6.36, 4.75, 3.4, 6.52] },
    { id: "gujranwala", name: "Gujranwala", region: "Punjab", s: [7.06, 5.22, 4.0, 6.71] },
    { id: "sialkot", name: "Sialkot", region: "Punjab", s: [6.82, 5.14, 3.78, 6.7] },
    { id: "gujrat", name: "Gujrat", region: "Punjab", s: [6.82, 5.14, 3.78, 6.7] },
    { id: "jhelum", name: "Jhelum", region: "Punjab", s: [6.85, 5.1, 3.78, 6.66] },
    { id: "sargodha", name: "Sargodha", region: "Punjab", s: [7.06, 5.22, 4.0, 6.71] },
    { id: "sheikhupura", name: "Sheikhupura", region: "Punjab", s: [6.33, 4.82, 3.55, 6.51] },
    { id: "kasur", name: "Kasur", region: "Punjab", s: [6.33, 4.77, 3.49, 6.5] },
    { id: "okara", name: "Okara", region: "Punjab", s: [6.43, 4.82, 3.51, 6.6] },
    { id: "sahiwal", name: "Sahiwal", region: "Punjab", s: [6.43, 4.82, 3.51, 6.6] },
    { id: "jhang", name: "Jhang", region: "Punjab", s: [6.5, 4.88, 3.5, 6.55] },
    { id: "multan", name: "Multan", region: "Punjab", s: [6.67, 5.04, 3.94, 6.74] },
    { id: "bahawalpur", name: "Bahawalpur", region: "Punjab", s: [6.43, 4.82, 3.51, 6.6] },
    { id: "dera-ghazi-khan", name: "Dera Ghazi Khan", region: "Punjab", s: [6.63, 5.08, 4.09, 6.54] },
    { id: "rahim-yar-khan", name: "Rahim Yar Khan", region: "Punjab", s: [7.2, 5.51, 4.48, 7.3] },
    { id: "mianwali", name: "Mianwali", region: "Punjab", s: [7.17, 5.23, 4.12, 6.68] },
    { id: "karachi", name: "Karachi", region: "Sindh", s: [6.02, 5.59, 5.18, 7.51] },
    { id: "hyderabad", name: "Hyderabad", region: "Sindh", s: [6.61, 5.46, 4.86, 7.21] },
    { id: "sukkur", name: "Sukkur", region: "Sindh", s: [6.89, 5.48, 4.61, 7.2] },
    { id: "nawabshah", name: "Nawabshah", region: "Sindh", s: [6.95, 5.54, 4.75, 7.24] },
    { id: "jacobabad", name: "Jacobabad", region: "Sindh", s: [7.19, 5.45, 4.55, 7.29] },
    { id: "thatta", name: "Thatta", region: "Sindh", s: [6.05, 5.55, 5.13, 7.52] },
    { id: "peshawar", name: "Peshawar", region: "Khyber Pakhtunkhwa", s: [7.8, 5.33, 3.98, 6.74] },
    { id: "mardan", name: "Mardan", region: "Khyber Pakhtunkhwa", s: [7.8, 5.33, 3.98, 6.74] },
    { id: "abbottabad", name: "Abbottabad", region: "Khyber Pakhtunkhwa", s: [7.3, 5.05, 3.49, 5.81] },
    { id: "swat", name: "Swat / Mingora", region: "Khyber Pakhtunkhwa", s: [7.66, 5.27, 3.86, 6.65] },
    { id: "kohat", name: "Kohat", region: "Khyber Pakhtunkhwa", s: [7.02, 5.08, 3.98, 6.42] },
    { id: "bannu", name: "Bannu", region: "Khyber Pakhtunkhwa", s: [7.02, 5.22, 4.17, 6.48] },
    { id: "dera-ismail-khan", name: "Dera Ismail Khan", region: "Khyber Pakhtunkhwa", s: [6.6, 4.9, 3.92, 6.4] },
    { id: "quetta", name: "Quetta", region: "Balochistan", s: [8.5, 6.19, 5.01, 7.5] },
    { id: "sibi", name: "Sibi", region: "Balochistan", s: [7.77, 5.85, 4.84, 7.36] },
    { id: "gilgit", name: "Gilgit", region: "Gilgit-Baltistan", s: [7.57, 5.02, 3.57, 5.93] },
    { id: "mirpur-ajk", name: "Mirpur (AJK)", region: "Azad Kashmir", s: [6.3, 4.92, 3.81, 6.43] },
  ];
  const OTHER_LOCATION = { id: "other", name: "Other / not listed", region: "", s: null };
  const PAKISTAN_FALLBACK_PSH = 5.5; // disclosed configurable estimate when no city data

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // month index -> season index in the s[] arrays (0 summer,1 autumn,2 winter,3 spring)
  const MONTH_SEASON = [2, 2, 3, 3, 3, 0, 0, 0, 1, 1, 1, 2];
  const SEASON_KEYS = ["summer", "autumn", "winter", "spring"];

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  function isPlainObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }
  function deepMerge(base, extra) {
    if (!isPlainObject(extra)) return base;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(extra).forEach((k) => {
      out[k] = isPlainObject(base[k]) && isPlainObject(extra[k]) ? deepMerge(base[k], extra[k]) : extra[k];
    });
    return out;
  }
  function getConfig(overrides) {
    const globalCfg = typeof self !== "undefined" && self.SOLAR_CALC_CONFIG ? self.SOLAR_CALC_CONFIG : null;
    return deepMerge(deepMerge(DEFAULTS, globalCfg), overrides);
  }
  const round = (n, d = 2) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : n);
  const toNum = (v) => {
    if (v === null || v === undefined || v === "") return NaN;
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };
  function parseWarrantyMonths(w) {
    if (!w) return 0;
    const m = String(w).match(/(\d+(?:\.\d+)?)\s*(month|year)/i);
    if (!m) return 0;
    return m[2].toLowerCase().startsWith("year") ? Number(m[1]) * 12 : Number(m[1]);
  }
  function usesText(uses) {
    return (Array.isArray(uses) ? uses.join(",") : String(uses || "")).toLowerCase();
  }

  // ---------------------------------------------------------------
  // 3. Consumption
  // ---------------------------------------------------------------
  function normalizeConsumption(c, cfgOverride) {
    const cfg = getConfig(cfgOverride);
    const errors = [];
    const mode = c && c.mode;
    const value = toNum(c && c.value);
    const periodDays = toNum(c && c.periodDays) || cfg.daysPerMonth;
    if (!["day", "month", "year"].includes(mode)) errors.push("Choose whether your units are per day, per month or per year.");
    if (!Number.isFinite(value)) errors.push("Enter your electricity consumption in units (kWh).");
    else if (value <= 0) errors.push("Consumption must be more than zero.");
    if (mode === "month" && (periodDays < 25 || periodDays > 35))
      errors.push("A billing period should be between 25 and 35 days.");
    if (errors.length) return { ok: false, errors };

    let daily;
    if (mode === "day") daily = value;
    else if (mode === "month") daily = value / periodDays;
    else daily = value / cfg.daysPerYear;

    const warnings = [];
    if (daily > 2000) warnings.push("Very high consumption — this looks like a large commercial or industrial load. Have the system designed by a qualified installer.");
    if (daily < 1) warnings.push("Very low consumption — please check the units entered.");

    return {
      ok: true,
      errors: [],
      warnings,
      daily,
      monthly: daily * cfg.daysPerMonth,
      annual: daily * cfg.daysPerYear,
      periodDays: mode === "month" ? periodDays : null,
    };
  }

  // ---------------------------------------------------------------
  // 4. Solar resource
  // ---------------------------------------------------------------
  function getSolarResource(locationId, customPsh) {
    const loc = LOCATIONS.find((l) => l.id === locationId);
    if (loc) {
      const seasonal = {};
      SEASON_KEYS.forEach((k, i) => (seasonal[k] = loc.s[i]));
      const monthly = MONTH_SEASON.map((si) => loc.s[si]);
      const annualPsh = monthly.reduce((a, v, i) => a + v * DAYS_IN_MONTH[i], 0) / 365;
      return { location: loc, annualPsh, seasonal, monthly, source: RESOURCE_SOURCE, isFallback: false };
    }
    const psh = Number.isFinite(toNum(customPsh)) && toNum(customPsh) > 2 && toNum(customPsh) < 8 ? toNum(customPsh) : PAKISTAN_FALLBACK_PSH;
    const seasonal = { summer: psh * 1.15, autumn: psh * 0.93, winter: psh * 0.72, spring: psh * 1.2 };
    // normalise the shape so the annual mean equals psh
    const shape = MONTH_SEASON.map((si) => seasonal[SEASON_KEYS[si]]);
    const mean = shape.reduce((a, v, i) => a + v * DAYS_IN_MONTH[i], 0) / 365;
    const monthly = shape.map((v) => (v * psh) / mean);
    SEASON_KEYS.forEach((k) => (seasonal[k] = (seasonal[k] * psh) / mean));
    return {
      location: OTHER_LOCATION,
      annualPsh: psh,
      seasonal,
      monthly,
      source: "Pakistan-wide estimate of " + psh + " kWh/kWp/day (configurable) with a typical seasonal shape",
      isFallback: true,
    };
  }

  function performanceRatio(cfg) {
    const l = cfg.losses;
    const pr = Object.keys(l).reduce((p, k) => p * (1 - l[k]), 1);
    return { pr, totalLossPct: (1 - pr) * 100, breakdown: l };
  }

  // ---------------------------------------------------------------
  // 5. Solar array sizing
  // ---------------------------------------------------------------
  function sizeArray(params, cfgOverride) {
    const cfg = getConfig(cfgOverride);
    const { dailyKwh, systemType, resource } = params;
    const panelW = toNum(params.panelW) || cfg.panel.defaultWatt;
    const existingKwp = Math.max(0, toNum(params.existingKwp) || 0);
    const { pr, totalLossPct, breakdown } = performanceRatio(cfg);
    const warnings = [];

    const offset = cfg.targetOffset[systemType] ?? 1;
    let designPsh = resource.annualPsh;
    let designEff = 1;
    if (systemType === "off-grid") {
      designPsh = resource.seasonal[cfg.offGridDesignSeason];
      designEff = cfg.offGridBatteryPathEfficiency;
    }
    const totalRequiredKwp = (dailyKwh * offset) / (designPsh * pr * designEff);
    const requiredKwp = Math.max(0, totalRequiredKwp - existingKwp);

    let panelCount = Math.max(0, Math.ceil((requiredKwp * 1000) / panelW - 1e-9));
    const areaPerPanelM2 = panelW / 1000 / cfg.panel.efficiency;
    const roofPerPanelM2 = areaPerPanelM2 * cfg.panel.layoutFactor;

    let roofLimited = false;
    let roofCapacityPanels = null;
    const roofM2 = params.roofArea ? toAreaM2(params.roofArea, params.roofUnit, cfg) : null;
    if (roofM2 && roofM2 > 0) {
      roofCapacityPanels = Math.floor(roofM2 / roofPerPanelM2);
      if (panelCount > roofCapacityPanels) {
        roofLimited = true;
        warnings.push(
          `Your roof area fits about ${roofCapacityPanels} panels, fewer than the ${panelCount} needed. The design below is limited to what fits, so solar will cover less of your consumption.`
        );
        panelCount = roofCapacityPanels;
      }
    }
    if (existingKwp > 0 && requiredKwp === 0) {
      warnings.push("Your existing solar capacity already meets the estimated demand. No additional panels are needed for this target.");
    }

    const newKwp = (panelCount * panelW) / 1000;
    const totalKwp = newKwp + existingKwp;
    const monthlyGen = resource.monthly.map((psh, i) => totalKwp * psh * pr * DAYS_IN_MONTH[i]);
    const annualGen = monthlyGen.reduce((a, b) => a + b, 0);

    return {
      panelW,
      pr,
      totalLossPct,
      lossBreakdown: breakdown,
      designPsh,
      totalRequiredKwp,
      requiredKwp,
      existingKwp,
      panelCount,
      newKwp,
      totalKwp,
      areaPerPanelM2,
      roofAreaM2: panelCount * roofPerPanelM2,
      roofAreaSqft: panelCount * roofPerPanelM2 * cfg.sqftPerM2,
      roofLimited,
      roofCapacityPanels,
      generation: {
        daily: annualGen / 365,
        monthly: annualGen / 12,
        annual: annualGen,
        byMonth: monthlyGen,
      },
      warnings,
    };
  }

  function toAreaM2(value, unit, cfg) {
    const v = toNum(value);
    if (!Number.isFinite(v) || v <= 0) return null;
    return unit === "m2" ? v : v / cfg.sqftPerM2;
  }

  // ---------------------------------------------------------------
  // 6. Inverter requirement + matching
  // ---------------------------------------------------------------
  function nextStandardSize(kw, cfg) {
    const s = cfg.inverter.standardSizesKw.find((x) => x >= kw - 1e-9);
    return s ?? Math.ceil(kw / 10) * 10;
  }

  function bankVoltageFor(acKw, cfg) {
    return cfg.battery.bankVoltageBreakpointsKw.find((b) => acKw <= b.upToKw).volts;
  }

  function inverterRequirement(p, cfgOverride) {
    const cfg = getConfig(cfgOverride);
    const { systemType, arrayKw, dailyKwh, backupLoadKw, phase } = p;
    const notes = [];
    const ratio = cfg.inverter.dcAcRatio[systemType] || 1.2;
    let minAcKw = arrayKw / ratio;
    let basis = `solar array ${round(arrayKw, 2)} kWp ÷ DC/AC ratio ${ratio}`;
    if (systemType === "off-grid") {
      const peak = (dailyKwh / 24) * cfg.inverter.offGridPeakFactor;
      if (peak > minAcKw) {
        minAcKw = peak;
        basis = `estimated peak household demand (${cfg.inverter.offGridPeakFactor} × average load)`;
      }
    } else if (systemType === "hybrid" && backupLoadKw) {
      const surge = backupLoadKw * cfg.inverter.backupSurgeFactor;
      if (surge > minAcKw) {
        minAcKw = surge;
        basis = `backup load with ${cfg.inverter.backupSurgeFactor}× start-up headroom`;
      }
    }
    const ratedKw = nextStandardSize(Math.max(minAcKw, 1), cfg);
    let phaseNeeded = phase === "three" ? "three" : phase === "single" ? "single" : null;
    if (ratedKw > cfg.inverter.threePhaseAboveKw) {
      if (phase === "single") {
        notes.push(`A ${ratedKw} kW system is large for a single-phase connection. Check with your electricity company (DISCO); a three-phase connection or several single-phase inverters may be needed.`);
      } else phaseNeeded = "three";
    }
    if (!phaseNeeded) phaseNeeded = ratedKw > cfg.inverter.threePhaseAboveKw ? "three" : "single";
    if (phase !== "single" && phase !== "three") notes.push("Supply phase not given — assumed from system size. Please confirm.");

    const needsBattery = systemType !== "on-grid";
    return {
      systemType,
      minAcKw,
      ratedKw,
      basis,
      phase: phaseNeeded,
      minPvKw: arrayKw,
      batteryVoltage: needsBattery ? bankVoltageFor(ratedKw, cfg) : null,
      gridTie: systemType !== "off-grid",
      backup: systemType !== "on-grid",
      notes,
    };
  }

  /*
   * Inverter catalog entries (when Alaska publishes them) should look like:
   * { id, model, image, url, type: ["on-grid"|"hybrid"|"off-grid"], phase: "single"|"three",
   *   ratedKw, maxPvKw, maxPvVoltage, mpptMinV, mpptMaxV, maxPvCurrentA,
   *   batteryVoltage (number|null), maxChargeA, maxDischargeA, price, warranty }
   */
  const INVERTER_CATALOG = [];
  const INVERTER_CHECK_FIELDS = ["maxPvKw", "maxPvVoltage", "mpptMinV", "mpptMaxV", "maxPvCurrentA"];

  function recommendInverters(req, catalog) {
    const list = Array.isArray(catalog) ? catalog : [];
    if (!list.length) {
      return {
        available: false,
        options: [],
        message:
          "Alaska Batteries has not published inverter specifications on the website yet, so we cannot match a specific inverter model. The requirement below is what a compatible inverter must meet — our technical team will confirm the model with your quotation.",
      };
    }
    const evaluated = list.map((inv) => {
      const reasons = [];
      const missing = [];
      let ok = true;
      const types = Array.isArray(inv.type) ? inv.type : [inv.type];
      if (!types.includes(req.systemType)) {
        ok = false;
        reasons.push(`does not support ${req.systemType} operation`);
      }
      if (inv.phase && inv.phase !== req.phase) {
        ok = false;
        reasons.push(`${inv.phase}-phase, ${req.phase}-phase required`);
      } else if (!inv.phase) missing.push("phase");
      if (!(toNum(inv.ratedKw) >= req.minAcKw - 1e-9)) {
        ok = false;
        reasons.push(`${inv.ratedKw} kW output is below the ${round(req.minAcKw, 1)} kW needed`);
      }
      if (Number.isFinite(toNum(inv.maxPvKw))) {
        if (toNum(inv.maxPvKw) < req.minPvKw) {
          ok = false;
          reasons.push(`accepts up to ${inv.maxPvKw} kWp of panels, ${round(req.minPvKw, 2)} kWp designed`);
        }
      }
      INVERTER_CHECK_FIELDS.forEach((f) => {
        if (!Number.isFinite(toNum(inv[f]))) missing.push(f);
      });
      if (req.batteryVoltage) {
        if (!Number.isFinite(toNum(inv.batteryVoltage))) missing.push("batteryVoltage");
        else if (toNum(inv.batteryVoltage) !== req.batteryVoltage) {
          ok = false;
          reasons.push(`${inv.batteryVoltage} V battery input, ${req.batteryVoltage} V bank planned`);
        }
      }
      return { product: inv, ok, reasons, missing: Array.from(new Set(missing)) };
    });
    const fits = evaluated.filter((e) => e.ok).sort((a, b) => a.product.ratedKw - b.product.ratedKw || (a.product.price || Infinity) - (b.product.price || Infinity));
    const options = [];
    if (fits.length) {
      options.push(Object.assign({ role: "best", label: "Best Match", why: "Smallest model that meets every checked requirement." }, fits[0]));
      const priced = fits.filter((f) => Number.isFinite(toNum(f.product.price))).sort((a, b) => a.product.price - b.product.price);
      if (priced.length && priced[0].product.id !== fits[0].product.id)
        options.push(Object.assign({ role: "budget", label: "Budget Option", why: "Lowest catalog price among compatible models." }, priced[0]));
      const bigger = fits.find((f) => f.product.ratedKw > fits[0].product.ratedKw);
      if (bigger) options.push(Object.assign({ role: "higher", label: "Higher-Capacity Option", why: "Extra output and room to add panels or load later." }, bigger));
    }
    return {
      available: true,
      options,
      rejected: evaluated.filter((e) => !e.ok),
      message: fits.length ? "" : "No inverter in the catalog meets these requirements. Please request a technical consultation.",
    };
  }

  // ---------------------------------------------------------------
  // 7. Battery sizing + matching
  // ---------------------------------------------------------------
  function backupDemand(p, cfgOverride) {
    const cfg = getConfig(cfgOverride);
    const { dailyKwh, systemType } = p;
    const hours = toNum(p.hours);
    const levelKey = p.level;
    const presetPct = cfg.backup.levels[levelKey] ? cfg.backup.levels[levelKey].pct : null;
    const pct = levelKey === "custom" ? toNum(p.criticalPct) : presetPct;
    const errors = [];
    const fixedKw = toNum(p.loadKw); // optional: backup load from a list of appliances
    if (!Number.isFinite(hours) || hours <= 0) errors.push("Enter how many hours of backup you need.");
    else if (hours > 72) errors.push("Backup longer than 72 hours needs a custom design — please request a consultation.");
    if (!(fixedKw > 0) && (!Number.isFinite(pct) || pct <= 0 || pct > 100)) errors.push("Critical load must be between 1 % and 100 %.");
    if (errors.length) return { ok: false, errors };

    const avgLoadKw = dailyKwh / 24;
    const effInv = cfg.inverter.efficiency;
    let loadKw;
    let usableKwh;
    let basis;
    if (fixedKw > 0) {
      // Appliance list: the load is known, so size directly from it
      loadKw = fixedKw;
      const byHours = (loadKw * hours) / effInv;
      const night = systemType === "off-grid" ? (dailyKwh * cfg.backup.offGridNightShare) / effInv : 0;
      usableKwh = Math.max(night, byHours);
      basis = night > byHours ? "night-time consumption (no grid to fall back on)" : `${hours} h of your selected appliances`;
      return { ok: true, errors: [], avgLoadKw, loadKw, pct: Math.round((loadKw / avgLoadKw) * 100), hours, usableKwh, basis, fromAppliances: true };
    }
    if (systemType === "off-grid") {
      // Off-grid: no grid to fall back on. The battery must carry the night-time
      // share of daily use, or the requested hours at the chosen load share,
      // whichever is larger. Discharge current is checked at full evening load.
      loadKw = avgLoadKw * cfg.backup.eveningFactor;
      const night = (dailyKwh * cfg.backup.offGridNightShare) / effInv;
      const byHours = (loadKw * (pct / 100) * hours) / effInv;
      usableKwh = Math.max(night, byHours);
      basis = night >= byHours ? "night-time consumption (no grid to fall back on)" : `${hours} h at ${pct}% of average load`;
    } else {
      loadKw = avgLoadKw * (pct / 100) * cfg.backup.eveningFactor;
      usableKwh = (loadKw * hours) / effInv;
      basis = `${hours} h at ${pct}% of average load`;
    }
    return { ok: true, errors: [], avgLoadKw, loadKw, pct, hours, usableKwh, basis };
  }

  function eligibleBatteries(catalog, cfgOverride) {
    const cfg = getConfig(cfgOverride);
    const b = cfg.battery;
    return (Array.isArray(catalog) ? catalog : []).filter((item) => {
      if (!item || !Number.isFinite(toNum(item.ah)) || toNum(item.ah) <= 0) return false;
      if (b.excludedSeries.includes(item.series)) return false;
      const cats = item.categories || [];
      const catOk = cats.some((c) => b.eligibleCategories.includes(c));
      const u = usesText(item.uses);
      const useOk = b.eligibleUseKeywords.some((k) => u.includes(k));
      return catOk || useOk;
    });
  }

  function chemistryOf(item) {
    const t = String(item.tech || "").toLowerCase();
    if (t.includes("lithium") || t.includes("lifepo")) return "lithium";
    return "lead-acid";
  }

  function configureBank(item, need, cfg) {
    const chem = cfg.battery[chemistryOf(item)] || cfg.battery["lead-acid"];
    const unitV = toNum(item.p) || chem.unitVoltage;
    const ah = toNum(item.ah);
    const bankV = need.bankVoltage;
    const notes = [];
    // LiFePO4 packs are 12.8 / 25.6 / 51.2 V nominal and serve 12 / 24 / 48 V systems
    const sysV = toNum(item.systemV) || unitV;
    if (bankV % sysV !== 0) return null;
    const series = bankV / sysV;
    const stringKwh = (unitV * series * ah) / 1000;
    const nominalNeeded = need.usableKwh / chem.usableDoD;
    const stringsForEnergy = Math.ceil(nominalNeeded / stringKwh - 1e-9);
    const dischargeA = (need.loadKw * 1000) / (bankV * cfg.inverter.efficiency);
    const stringsForCurrent = Math.ceil(dischargeA / (chem.maxDischargeC * ah) - 1e-9);
    const strings = Math.max(1, stringsForEnergy, stringsForCurrent);
    if (stringsForCurrent > stringsForEnergy) notes.push("Extra strings added so the discharge current stays within the battery's safe rate.");
    const units = strings * series;
    const nominalKwh = strings * stringKwh;
    const usableKwh = nominalKwh * chem.usableDoD;
    const backupHours = need.loadKw > 0 ? (usableKwh * cfg.inverter.efficiency) / need.loadKw : null;
    const chargeKw = (chem.chargeC * ah * strings * bankV) / 1000;
    const pvChargeKw = need.arrayKw ? need.arrayKw * 0.7 : chargeKw;
    const effChargeKw = Math.min(chargeKw, pvChargeKw);
    const rechargeHours = effChargeKw > 0 ? usableKwh / chem.chargeEfficiency / effChargeKw : null;
    const weight = toNum(item.weightKg) > 0 ? toNum(item.weightKg) * units : null;
    return {
      product: item,
      chemistry: chemistryOf(item),
      unitVoltage: unitV,
      unitAh: ah,
      unitKwh: (unitV * ah) / 1000,
      bankVoltage: bankV,
      series,
      strings,
      units,
      bankAh: ah * strings,
      nominalKwh,
      usableKwh,
      dod: chem.usableDoD,
      backupHours,
      rechargeHours,
      chargeCurrentA: chem.chargeC * ah * strings,
      dischargeCurrentA: dischargeA,
      totalWeightKg: weight,
      warranty: item.warranty || "Not stated",
      warrantyMonths: parseWarrantyMonths(item.warranty),
      suitable: strings <= chem.maxParallelStrings,
      oversize: usableKwh / need.usableKwh,
      purposeBuilt: (item.categories || []).some((c) => cfg.battery.purposeBuiltCategories.includes(c)),
      // 2 = dedicated deep-cycle, 1 = solar range (some share an automotive case), 0 = general/UPS use
      dutyScore: (item.categories || []).includes("Deep-Cycle") ? 2 : (item.categories || []).includes("Solar") ? 1 : 0,
      notes,
    };
  }

  function recommendBatteries(need, catalog, cfgOverride) {
    const cfg = getConfig(cfgOverride);
    const eligible = eligibleBatteries(catalog, cfg);
    const notes = [];
    if (need.chemistry && need.chemistry !== "any" && need.chemistry !== "lead-acid") {
      const has = eligible.some((i) => chemistryOf(i) === need.chemistry);
      if (!has)
        notes.push("The Alaska catalog does not list lithium batteries with published specifications yet, so lead-acid options are shown. Ask our team about lithium availability.");
    }
    let pool = eligible;
    if (need.chemistry && need.chemistry !== "any") {
      const match = eligible.filter((i) => chemistryOf(i) === need.chemistry);
      if (match.length) pool = match;
    }
    const configs = pool.map((i) => configureBank(i, need, cfg)).filter(Boolean);
    const suitable = configs.filter((c) => c.suitable);
    if (!suitable.length) {
      return {
        options: [],
        all: configs,
        notes: notes.concat(
          "This backup requirement needs more than " +
            cfg.battery["lead-acid"].maxParallelStrings +
            " parallel battery strings with the current catalog. That is outside a safe standard design — please request a technical consultation."
        ),
      };
    }
    const byBest = suitable.slice().sort((a, b) => b.dutyScore - a.dutyScore || a.units - b.units || a.oversize - b.oversize || b.warrantyMonths - a.warrantyMonths);
    const best = byBest[0];
    const byBudget = suitable.slice().sort((a, b) => a.nominalKwh - b.nominalKwh || a.units - b.units);
    const budget = byBudget.find((c) => c.product.id !== best.product.id) || null;

    // Extended: size against a larger target and pick the best of those
    const extNeed = Object.assign({}, need, { usableKwh: need.usableKwh * cfg.backup.extendedOptionFactor });
    const extConfigs = pool
      .map((i) => configureBank(i, extNeed, cfg))
      .filter((c) => c && c.suitable)
      .map((c) => Object.assign(c, { oversize: c.usableKwh / need.usableKwh }))
      .sort((a, b) => b.dutyScore - a.dutyScore || a.units - b.units || b.usableKwh - a.usableKwh);
    const extended = extConfigs.find((c) => c.usableKwh > best.usableKwh * 1.2) || null;

    const options = [Object.assign({ role: "best", label: "Best Match", why: whyBest(best) }, best)];
    if (budget && budget.nominalKwh <= best.nominalKwh)
      options.push(Object.assign({ role: "budget", label: "Budget Option", why: "Smallest battery bank that still meets your requirement. Prices are not published online — the quotation will confirm cost." }, budget));
    if (extended)
      options.push(
        Object.assign(
          { role: "extended", label: "Extended Backup Option", why: `About ${round(extended.usableKwh / need.usableKwh, 1)}× the required storage for longer outages or future load growth.` },
          extended
        )
      );
    notes.push("Ah ratings are as listed in the Alaska catalog; the discharge rate they refer to (C10/C20) is not stated, so real capacity at high loads may be lower.");
    return { options, all: configs, notes };
  }

  function whyBest(c) {
    const parts = [];
    if (c.dutyScore === 2) parts.push("dedicated deep-cycle battery for daily solar cycling");
    else if (c.purposeBuilt) parts.push("from the Alaska solar range");
    parts.push(`${c.units} unit${c.units > 1 ? "s" : ""} (${c.series} in series × ${c.strings} string${c.strings > 1 ? "s" : ""}) for a ${c.bankVoltage} V bank`);
    if (c.oversize < 1.35) parts.push("little wasted capacity");
    return parts.join(", ") + ".";
  }

  // ---------------------------------------------------------------
  // 8. Full calculation
  // ---------------------------------------------------------------
  function calculate(input, catalogs, cfgOverride) {
    const cfg = getConfig(cfgOverride);
    const errors = [];
    const warnings = [];
    const batteryCatalog = (catalogs && catalogs.batteries) || [];
    const inverterCatalog = (catalogs && catalogs.inverters) || INVERTER_CATALOG;

    const consumption = normalizeConsumption(input.consumption || {}, cfg);
    if (!consumption.ok) return { ok: false, errors: consumption.errors };
    warnings.push(...consumption.warnings.map((m) => ({ level: "warn", text: m })));

    const systemType = ["on-grid", "hybrid", "off-grid"].includes(input.systemType) ? input.systemType : "hybrid";
    const loc = input.location || {};
    const resource = getSolarResource(loc.id, loc.customPsh);
    if (resource.isFallback) warnings.push({ level: "info", text: "Your city is not in our list, so a Pakistan-wide average solar estimate is used. Results may differ by ±10–15 %." });

    const array = sizeArray(
      {
        dailyKwh: consumption.daily,
        systemType,
        resource,
        panelW: input.panelW,
        existingKwp: loc.existingKwp,
        roofArea: loc.roofArea,
        roofUnit: loc.roofUnit,
      },
      cfg
    );
    warnings.push(...array.warnings.map((m) => ({ level: "warn", text: m })));

    // Backup
    const b = input.backup || {};
    const wantsBackup = systemType === "off-grid" ? true : !!b.required;
    let backup = null;
    let batteries = null;
    if (wantsBackup && systemType === "on-grid") {
      warnings.push({ level: "warn", text: "On-grid inverters switch off during load-shedding for safety, so they cannot provide backup. Choose Hybrid if you need power during outages." });
    } else if (wantsBackup) {
      const level = b.level || (systemType === "off-grid" ? "standard" : "essential");
      backup = backupDemand(
        {
          dailyKwh: consumption.daily,
          systemType,
          hours: b.hours ?? cfg.backup.defaultHours,
          level,
          criticalPct: b.criticalPct,
          loadKw: b.loadKw,
        },
        cfg
      );
      if (!backup.ok) errors.push(...backup.errors);
    }

    const inverterReq = inverterRequirement(
      {
        systemType,
        arrayKw: array.totalKwp,
        dailyKwh: consumption.daily,
        backupLoadKw: backup && backup.ok ? backup.loadKw : 0,
        phase: loc.phase,
      },
      cfg
    );
    warnings.push(...inverterReq.notes.map((m) => ({ level: "info", text: m })));
    const inverters = recommendInverters(inverterReq, inverterCatalog);

    if (backup && backup.ok) {
      batteries = recommendBatteries(
        {
          usableKwh: backup.usableKwh,
          loadKw: backup.loadKw,
          bankVoltage: inverterReq.batteryVoltage,
          arrayKw: array.totalKwp,
          chemistry: b.chemistry || "any",
        },
        batteryCatalog,
        cfg
      );
      if (b.hasBattery) warnings.push({ level: "info", text: "You already own batteries. Mixing old and new lead-acid batteries in one bank shortens their life — our team will check whether your existing batteries can be reused." });
    }
    if (b.hasInverter && systemType !== "on-grid") {
      warnings.push({ level: "info", text: "You already own an inverter. Its battery voltage, PV input limits and charger rating must be checked before reusing it with this design." });
    }

    if (input.prefs && input.prefs.expansion) {
      warnings.push({ level: "info", text: "For future expansion, choose an inverter with spare PV input capacity (the Higher-Capacity option) and keep roof space free." });
    }

    const coveragePct = (array.generation.annual / consumption.annual) * 100;
    const winterMonths = [11, 0, 1];
    const winterGen = winterMonths.reduce((a, m) => a + array.generation.byMonth[m], 0);
    const winterUse = winterMonths.reduce((a, m) => a + consumption.daily * DAYS_IN_MONTH[m], 0);
    if (systemType !== "off-grid" && winterGen < winterUse * 0.85 && coveragePct > 90)
      warnings.push({ level: "info", text: "Winter generation is noticeably lower than summer — expect to draw more from the grid in December–February." });

    warnings.push({ level: "engineer", text: "These are preliminary estimates, not guaranteed output. Real output depends on shading, roof orientation and tilt, cable runs, string voltage design and your DISCO's net-metering rules." });

    return {
      ok: errors.length === 0,
      errors,
      warnings,
      input,
      systemType,
      consumption,
      resource,
      array,
      coveragePct,
      backup,
      inverterReq,
      inverters,
      batteries,
      assumptions: describeAssumptions(cfg, resource, array),
    };
  }

  function describeAssumptions(cfg, resource, array) {
    return [
      `Solar resource: ${round(resource.annualPsh, 2)} kWh per kWp per day on average at ${resource.location.name} — ${resource.source}.`,
      `System losses: ${round(array.totalLossPct, 1)}% total (heat ${cfg.losses.temperature * 100}%, dust ${cfg.losses.soiling * 100}%, inverter ${cfg.losses.inverter * 100}%, wiring/mismatch ${cfg.losses.wiringMismatch * 100}%, other ${cfg.losses.other * 100}%).`,
      `Panels: ${array.panelW} W each, ~${round(array.areaPerPanelM2, 2)} m² per panel, roof area includes ${round((cfg.panel.layoutFactor - 1) * 100)}% for spacing and walkways.`,
      `Month = ${cfg.daysPerMonth} days, year = ${cfg.daysPerYear} days.`,
      `Lead-acid batteries: ${cfg.battery["lead-acid"].usableDoD * 100}% usable depth of discharge, discharge ≤ C/${round(1 / cfg.battery["lead-acid"].maxDischargeC)}, charging at C/${round(1 / cfg.battery["lead-acid"].chargeC)}, inverter efficiency ${cfg.inverter.efficiency * 100}%.`,
      `Backup load = average hourly use × critical-load share × ${cfg.backup.eveningFactor} (outages often fall in busier hours).`,
    ];
  }

  // ---------------------------------------------------------------
  // 9. Configuration comparison (solar only / standard / extended)
  // ---------------------------------------------------------------
  function compareScenarios(input, catalogs, cfgOverride) {
    const cfg = getConfig(cfgOverride);
    const base = JSON.parse(JSON.stringify(input));
    const hours = toNum(base.backup && base.backup.hours) || cfg.backup.defaultHours;
    const scenarios = [];
    if (base.systemType !== "off-grid") {
      const s = calculate(Object.assign({}, base, { backup: Object.assign({}, base.backup, { required: false }) }), catalogs, cfg);
      if (s.ok) scenarios.push({ key: "solar-only", label: "Solar without battery", result: s });
    }
    if (base.systemType !== "on-grid") {
      const std = calculate(
        Object.assign({}, base, { backup: Object.assign({}, base.backup, { required: true, level: "standard", hours }) }),
        catalogs,
        cfg
      );
      if (std.ok) scenarios.push({ key: "standard", label: "Solar with standard backup", result: std });
      const ext = calculate(
        Object.assign({}, base, {
          backup: Object.assign({}, base.backup, { required: true, level: "extended", hours: Math.ceil(hours * cfg.backup.extendedOptionFactor) }),
        }),
        catalogs,
        cfg
      );
      if (ext.ok) scenarios.push({ key: "extended", label: "Solar with extended backup", result: ext });
    }
    return scenarios;
  }

  // ---------------------------------------------------------------
  // 10. Plain-text summary (quotation email / WhatsApp)
  // ---------------------------------------------------------------
  function buildSummary(r, selection) {
    if (!r || !r.ok) return "";
    const sel = selection || {};
    const L = [];
    L.push("SOLAR CALCULATOR RESULT — Alaska Batteries");
    L.push("");
    L.push(`Location: ${r.resource.location.name}${r.input.location && r.input.location.propertyType ? " (" + r.input.location.propertyType + ")" : ""}`);
    L.push(`System type: ${r.systemType}`);
    L.push(`Consumption: ${round(r.consumption.daily, 1)} kWh/day | ${Math.round(r.consumption.monthly)} kWh/month | ${Math.round(r.consumption.annual)} kWh/year`);
    L.push(`Solar array: ${r.array.panelCount} × ${r.array.panelW} W = ${round(r.array.newKwp, 2)} kWp new${r.array.existingKwp ? " + " + r.array.existingKwp + " kWp existing" : ""}`);
    L.push(`Estimated generation: ${Math.round(r.array.generation.monthly)} kWh/month (${Math.round(r.coveragePct)}% of consumption)`);
    L.push(`Roof area needed: ~${Math.round(r.array.roofAreaSqft)} sq ft`);
    L.push(`Inverter requirement: ≥ ${r.inverterReq.ratedKw} kW ${r.inverterReq.phase}-phase ${r.systemType}${r.inverterReq.batteryVoltage ? ", " + r.inverterReq.batteryVoltage + " V battery" : ""}`);
    const inv = sel.inverter || (r.inverters.options && r.inverters.options[0]);
    if (inv) L.push(`Selected inverter: ${inv.product.model}`);
    if (r.backup && r.backup.ok) {
      L.push(`Backup: ${r.backup.hours} h at ${r.backup.pct}% load (~${round(r.backup.loadKw, 2)} kW), needs ${round(r.backup.usableKwh, 1)} kWh usable`);
      const bat = sel.battery || (r.batteries && r.batteries.options[0]);
      if (bat)
        L.push(
          `Selected battery: ${bat.units} × ${bat.product.model} (${bat.unitAh} Ah ${bat.unitVoltage} V) — ${bat.bankVoltage} V bank, ${round(bat.nominalKwh, 1)} kWh nominal / ${round(bat.usableKwh, 1)} kWh usable, ~${round(bat.backupHours, 1)} h backup`
        );
    }
    if (r.input.prefs) {
      const p = r.input.prefs;
      if (p.budget) L.push(`Budget: ${p.budget}`);
      if (p.priority) L.push(`Priority: ${p.priority}`);
      if (p.expansion) L.push("Wants room for future expansion");
    }
    return L.join("\n");
  }

  return {
    DEFAULTS,
    LOCATIONS,
    OTHER_LOCATION,
    MONTH_NAMES,
    DAYS_IN_MONTH,
    INVERTER_CATALOG,
    getConfig,
    normalizeConsumption,
    getSolarResource,
    performanceRatio,
    sizeArray,
    inverterRequirement,
    recommendInverters,
    backupDemand,
    eligibleBatteries,
    configureBank,
    recommendBatteries,
    calculate,
    compareScenarios,
    buildSummary,
    round,
  };
});
