/*
 * Alaska Batteries — Battery Finder engine
 * ------------------------------------------------------------
 * Pure matching logic (no DOM). Works on:
 *   - the existing product catalog `batteryData` (js/data.js)
 *   - the vehicle list `ALASKA_VEHICLES` (js/vehicle-data.js)
 * Two ways to search:
 *   1. By vehicle: make → model → engine → battery class → Alaska models
 *   2. By current battery size: a code printed on the old battery
 *      (NS40, N70, 55B24L, 80D26R …) → physical size → Alaska models that fit
 * Defaults are in CLASSES / SIZES and can be changed without touching the UI.
 */
(function (root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  else root.BatteryFinder = engine;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const IN_TO_MM = 25.4;

  // ---------------------------------------------------------------
  // Battery classes. Ah bands follow the engine-size guidance commonly
  // published in Pakistan (≈35–45 Ah up to 1000 cc, 45–65 Ah to 1300 cc,
  // 70–90 Ah for larger cars and SUVs), tightened per class. `boxes` lists
  // the Alaska case sizes that physically suit each class.
  // ---------------------------------------------------------------
  const CLASSES = {
    micro: { label: "Small car up to 850 cc", ah: [30, 45], target: 32, boxes: ["NS-40"], pool: "car" },
    small: { label: "Car 851 to 1100 cc", ah: [32, 50], target: 40, boxes: ["NS-40"], pool: "car" },
    compact: { label: "Car 1101 to 1400 cc", ah: [40, 60], target: 45, boxes: ["NS-40", "N-40"], pool: "car" },
    mid: { label: "Car 1401 to 1800 cc", ah: [45, 65], target: 55, boxes: ["N-40", "N-50"], pool: "car" },
    large: { label: "Car / SUV 1801 to 2500 cc petrol", ah: [55, 85], target: 60, boxes: ["N-50", "N-70"], pool: "car" },
    xl: { label: "Large petrol SUV / van over 2500 cc", ah: [65, 90], target: 72, boxes: ["N-70"], pool: "car" },
    "diesel-mid": { label: "Diesel up to 2500 cc", ah: [60, 90], target: 65, boxes: ["N-50", "N-70"], pool: "car" },
    "diesel-large": { label: "Diesel over 2500 cc", ah: [70, 90], target: 80, boxes: ["N-70"], pool: "car" },
    tractor: { label: "Tractor", ah: [100, 140], target: 110, boxes: ["N-100", "N-120"], pool: "heavy" },
    "truck-light": { label: "Light truck / mini-bus (24 V)", ah: [100, 140], target: 120, boxes: ["N-100", "N-120"], pool: "heavy", qty: 2 },
    "truck-heavy": { label: "Heavy truck / bus (24 V)", ah: [150, 220], target: 160, boxes: ["N-150", "N-200"], pool: "heavy", qty: 2 },
    hybrid: { label: "Hybrid vehicle", ah: null, boxes: [], pool: null },
    // used only with exact chart fitments
    aux: { label: "12 V auxiliary battery (hybrid / EV)", ah: null, boxes: [], pool: null },
    "three-wheeler": { label: "Rickshaw / loader", ah: null, boxes: [], pool: null },
  };

  // ---------------------------------------------------------------
  // Battery size codes. JIS codes (e.g. 55B24L) are decoded from the
  // standard: letter = width × height group, digits after it = length in cm.
  // Common Pakistani shop names map to their usual JIS equivalent.
  // ---------------------------------------------------------------
  const JIS_GROUP = {
    A: { w: 127, h: 162 },
    B: { w: 129, h: 203 },
    C: { w: 135, h: 207 },
    D: { w: 173, h: 204 },
    E: { w: 175, h: 213 },
    F: { w: 182, h: 213 },
    G: { w: 222, h: 213 },
    H: { w: 278, h: 220 },
  };
  // Typical real case lengths for common JIS lengths (mm)
  const JIS_LENGTH = { 17: 167, 19: 187, 20: 197, 23: 230, 24: 238, 26: 260, 31: 306, 41: 410, 51: 505, 52: 521 };
  const SHOP_SIZES = {
    NS40: { jis: "B20", note: "NS40 ≈ JIS B20" },
    NS60: { jis: "B24", note: "NS60 ≈ JIS B24" },
    N40: { jis: "B24", note: "N40 ≈ JIS B24 length" },
    NS70: { jis: "D26", note: "NS70 ≈ JIS D26" },
    N50: { jis: "D26", note: "N50 ≈ JIS D26" },
    N70: { jis: "D31", note: "N70 ≈ JIS D31" },
    N100: { jis: "E41", note: "N100 ≈ JIS E41" },
    N120: { jis: "F51", note: "N120 ≈ JIS F51" },
    N150: { jis: "G51", note: "N150 ≈ JIS G51" },
    N200: { jis: "H52", note: "N200 ≈ JIS H52" },
  };
  const FIT = { longerMaxMm: 8, shorterMaxMm: 30, widthTolMm: 10 };

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };
  const usesText = (u) => (Array.isArray(u) ? u.join(",") : String(u || "")).toLowerCase();
  const normBox = (b) => String(b || "").toUpperCase().replace(/\s+/g, "");

  function dimsMm(item) {
    const d = item && item.dimensions;
    if (!d) return null;
    const l = num(d.l ?? d.length);
    const w = num(d.w ?? d.width);
    const h = num(d.h ?? d.height);
    if (l === null || w === null || h === null) return null;
    const f = String(d.unit || "in").toLowerCase().startsWith("in") ? IN_TO_MM : String(d.unit).toLowerCase() === "cm" ? 10 : 1;
    return { l: Math.round(l * f), w: Math.round(w * f), h: Math.round(h * f) };
  }

  // Which terminal layouts a catalog model is sold in, from its name
  function polarityOf(item) {
    const m = String(item.model || "").toUpperCase().replace(/\s+/g, " ").trim();
    if (/L\/R$/.test(m) || /Z\/ZL$/.test(m)) return ["L", "R"];
    if (/\dL$/.test(m) || /ZL$/.test(m)) return ["L"];
    if (/\dR$/.test(m)) return ["R"];
    return [];
  }

  function isMF(item) {
    return item.series === "mf" || /maintenance free/i.test(item.tech || "");
  }
  function mfCcRange(item) {
    const m = usesText(item.uses).match(/(\d{3,4})\s*cc\s*-\s*(\d{3,4})\s*cc/);
    return m ? [Number(m[1]), Number(m[2])] : null;
  }

  function inPool(item, pool) {
    const cats = item.categories || [];
    if (cats.includes("Deep-Cycle") || item.series === "deep-cycle") return false;
    if (pool === "car") return cats.includes("Automotive");
    if (pool === "heavy") {
      const u = usesText(item.uses);
      return cats.includes("Industrial") || /agricultural|heavy vehicle|heavy machinery/.test(u);
    }
    return false;
  }

  function describe(item) {
    return {
      product: item,
      model: item.model,
      ah: num(item.ah),
      box: item.boxSize || null,
      dims: dimsMm(item),
      polarity: polarityOf(item),
      mf: isMF(item),
      warranty: item.warranty || "Not stated",
      weightKg: num(item.weightKg) > 0 ? num(item.weightKg) : null,
      plates: item.plates || null,
      tech: item.tech || "",
    };
  }

  // ---------------------------------------------------------------
  // Vehicle helpers
  // ---------------------------------------------------------------
  function makes(vehicles) {
    return Array.from(new Set(vehicles.map((v) => v.make)));
  }
  function models(vehicles, make) {
    return vehicles.filter((v) => v.make === make).map((v) => v.model);
  }
  function engines(vehicles, make, model) {
    const v = vehicles.find((x) => x.make === make && x.model === model);
    return v ? v.engines : [];
  }
  function findEngine(vehicles, make, model, label) {
    return engines(vehicles, make, model).find((e) => e.label === label) || null;
  }

  function classify(engine) {
    if (!engine) return null;
    const flags = engine.flags || [];
    if (engine.cls) return engine.cls;
    if (flags.includes("hybrid")) return "hybrid";
    const cc = Number(engine.cc) || 0;
    if (engine.fuel === "diesel") return cc <= 2500 ? "diesel-mid" : "diesel-large";
    if (cc <= 850) return "micro";
    if (cc <= 1100) return "small";
    if (cc <= 1400) return "compact";
    if (cc <= 1800) return "mid";
    if (cc <= 2500) return "large";
    return "xl";
  }

  // ---------------------------------------------------------------
  // 1. Recommend for a vehicle
  // ---------------------------------------------------------------
  function recommendForVehicle(engine, catalog, opts) {
    const o = opts || {};
    const clsKey = classify(engine);
    const cls = CLASSES[clsKey];
    const flags = (engine && engine.flags) || [];
    const notes = [];
    const result = { classKey: clsKey, cls, engine, qty: (cls && cls.qty) || 1, picks: [], others: [], notes, supported: true };
    if (!engine || !cls) {
      result.supported = false;
      notes.push({ level: "warn", text: "Please choose your vehicle and engine." });
      return result;
    }
    // Exact fitment from Alaska's chart, when available, overrides the rules
    if (Array.isArray(engine.fit) && engine.fit.length) {
      const items = (Array.isArray(catalog) ? catalog : []).filter((i) => num(i.ah));
      engine.fit.forEach((entry) => {
        const twins = String(entry).split("|").map((m) => items.find((i) => i.model === m.trim())).filter(Boolean);
        if (!twins.length) return;
        const d = describe(twins[0]);
        if (twins.length > 1) {
          d.polarity = Array.from(new Set(twins.flatMap((t) => polarityOf(t))));
          d.twins = twins.map((t) => t.model);
        }
        const first = !result.picks.length;
        d.role = first ? "recommended" : d.mf ? "mf" : "alternative";
        d.label = first ? "Recommended" : d.mf ? "Maintenance-Free" : "Dry-Charge Option";
        d.why = "Listed for this vehicle in Alaska's fitment chart.";
        result.picks.push(d);
      });
      if (result.picks.length) {
        result.verified = true;
        if (engine.note) notes.push({ level: "info", text: engine.note });
        if (flags.includes("24v") || result.qty > 1)
          notes.push({ level: "info", text: `This vehicle runs on 24 V, so it needs ${result.qty} identical 12 V batteries connected in series. Always replace both together.` });
        return result;
      }
    }
    if (clsKey === "hybrid" || !cls.ah) {
      result.supported = false;
      notes.push({
        level: "warn",
        text: "Hybrid vehicles use a special 12 V auxiliary battery (often AGM, sometimes inside the cabin or boot). Alaska does not list a hybrid auxiliary battery yet, so please ask an Alaska dealer.",
      });
      return result;
    }
    const items = (Array.isArray(catalog) ? catalog : []).filter((i) => num(i.ah));


    const [lo, hi] = cls.ah;
    const pool = items.filter((i) => inPool(i, cls.pool));
    const sizedOk = (i) => {
      const a = num(i.ah);
      if (a < lo || a > hi) return false;
      if (isMF(i) && !i.boxSize) return true; // MF without a listed case size: matched by Alaska's cc range below
      return cls.boxes.map(normBox).includes(normBox(i.boxSize));
    };
    const fits = pool.filter(sizedOk);
    const dry = fits.filter((i) => !isMF(i)).sort((a, b) => num(a.ah) - num(b.ah));

    if (!result.verified) {
      // Recommended: smallest dry-charge model at or above the class target
      const rec = dry.find((i) => num(i.ah) >= cls.target) || dry[dry.length - 1];
      if (rec)
        result.picks.push(
          Object.assign(describe(rec), {
            role: "recommended",
            label: "Recommended",
            why: `${num(rec.ah)} Ah is right for a ${cls.label.toLowerCase()}: enough starting power without paying for capacity you won't use.`,
          })
        );
      // Maintenance-free: Alaska lists the engine sizes each MF model suits
      if (cls.pool === "car" && engine.fuel !== "diesel") {
        const cc = Number(engine.cc);
        const mf = pool
          .filter((i) => isMF(i))
          .filter((i) => {
            const r = mfCcRange(i);
            return r && cc >= r[0] && cc <= r[1];
          })
          .sort((a, b) => num(a.ah) - num(b.ah) || String(a.model).localeCompare(b.model));
        if (mf.length) {
          // Smallest MF at or above the class target (else the largest), then
          // group L/R twins (e.g. MF 60L + MF 60R) into one pick
          const top = mf.find((i) => num(i.ah) >= cls.target) || mf[mf.length - 1];
          const twins = mf.filter((i) => num(i.ah) === num(top.ah) && i.model.replace(/[LR]$/, "") === top.model.replace(/[LR]$/, ""));
          const d = describe(top);
          d.polarity = Array.from(new Set(twins.flatMap((t) => polarityOf(t))));
          d.twins = twins.map((t) => t.model);
          d.role = "mf";
          d.label = "Maintenance-Free";
          d.why = `Sealed, no topping-up. Alaska rates it for ${usesText(top.uses).replace(" vehicles", "").replace(/\s*-\s*/g, " to ")} engines.`;
          result.picks.push(d);
        }
      }
      // Upgrade: the higher plate option in the SAME case size (never a bigger case),
      // so it drops into the same tray
      const recPick = result.picks.find((p) => p.role === "recommended");
      if (recPick) {
        const up = dry
          .filter((i) => i.boxSize === recPick.box && num(i.plates) > num(recPick.plates) && i.model !== recPick.model)
          .sort((a, b) => num(a.plates) - num(b.plates) || num(a.ah) - num(b.ah))[0];
        if (up) {
          result.picks.push(
            Object.assign(describe(up), {
              role: "upgrade",
              label: "Higher Plate Option",
              why: `${num(up.plates)} plates instead of ${num(recPick.plates)} in the same ${up.boxSize} case: ${num(up.ah)} Ah for extra reserve with heavy AC use, a sound system, a CNG/LPG kit or frequent short trips.`,
              fitNote: null,
            })
          );
        }
      }
      if (!result.picks.length) {
        result.supported = false;
        notes.push({ level: "warn", text: "We couldn't match an Alaska battery to this vehicle from the current catalog. An Alaska dealer can confirm the right size." });
      }
    }

    const chosen = new Set(result.picks.map((p) => p.model).concat(result.picks.flatMap((p) => p.twins || [])));
    result.others = fits.filter((i) => !chosen.has(i.model)).sort((a, b) => num(a.ah) - num(b.ah)).map(describe);

    if (flags.includes("din"))
      notes.push({
        level: "warn",
        text: "Many recent units of this model use a European (EN/DIN) battery with terminals sunk into the lid. Alaska's current range uses Japanese-style (JIS) cases. Check your existing battery: if it is DIN-style, ask an Alaska dealer before buying.",
      });
    if (flags.includes("24v") || result.qty > 1)
      notes.push({ level: "info", text: `This vehicle runs on 24 V, so it needs ${result.qty} identical 12 V batteries connected in series. Always replace both together.` });
    if (!result.verified)
      notes.push({ level: "info", text: "Recommendation based on engine size and fuel type. Before buying, match the case size and terminal side (left or right) with your current battery." });
    return result;
  }

  // ---------------------------------------------------------------
  // 2. Find by current battery size code
  // ---------------------------------------------------------------
  function parseSizeCode(input) {
    const raw = String(input || "").trim();
    const s = raw.toUpperCase().replace(/[\s_-]+/g, "");
    if (!s) return { ok: false, error: "Type the size code printed on your battery, e.g. NS40, N70 or 55B24L." };

    // DIN / EN codes
    if (/^(LN\d|L\d|DIN\d*|EN\d*|H\d{1,2}|T\d)$/.test(s) || /^DIN/.test(s)) {
      return { ok: true, kind: "din", raw, label: raw.toUpperCase(), dims: null, polarity: null };
    }
    // JIS: e.g. 55B24L, 80D26R, 38B20LS
    let m = s.match(/^(\d{2,3})([A-H])(\d{2})(L|R)?(S)?$/);
    if (m) {
      const g = JIS_GROUP[m[2]];
      const len = JIS_LENGTH[Number(m[3])] || Number(m[3]) * 10;
      return {
        ok: true,
        kind: "jis",
        raw,
        label: `${m[1]}${m[2]}${m[3]}${m[4] || ""}`,
        rank: Number(m[1]),
        dims: { l: len, w: g.w, h: g.h },
        polarity: m[4] || null,
        note: `JIS ${m[2]}${m[3]}: about ${len} × ${g.w} mm footprint.`,
      };
    }
    // Shop names: NS40, NS40ZL, N70Z, N-150 …
    m = s.match(/^(NS|N)(\d{2,3})(ZL|Z|L|R|S)?$/);
    if (m) {
      const key = m[1] + m[2];
      const map = SHOP_SIZES[key];
      if (map) {
        const jm = map.jis.match(/^([A-H])(\d{2})$/);
        const g = JIS_GROUP[jm[1]];
        const len = JIS_LENGTH[Number(jm[2])];
        const suf = m[3] || "";
        return {
          ok: true,
          kind: "shop",
          raw,
          label: key + suf,
          dims: { l: len, w: g.w, h: g.h },
          polarity: suf === "ZL" || suf === "L" ? "L" : suf === "R" ? "R" : null,
          note: map.note,
          box: key,
        };
      }
    }
    return { ok: false, error: `We don't recognise "${raw}". Try the code on the battery label, e.g. NS40, N50, N70 or 46B24L.` };
  }

  function findBySize(input, catalog) {
    const code = parseSizeCode(input);
    const out = { code, matches: [], notes: [] };
    if (!code.ok) return out;
    const items = (Array.isArray(catalog) ? catalog : []).filter((i) => num(i.ah));

    if (code.kind === "din") {
      out.notes.push({ level: "warn", text: "This is a European (EN/DIN) size. Alaska's current range uses Japanese-style (JIS) cases, so there's no direct replacement listed. An Alaska dealer can advise." });
      return out;
    }
    const scored = items
      .map((i) => ({ i, d: dimsMm(i) }))
      .filter(({ i, d }) => d && ((i.categories || []).includes("Automotive") || (i.categories || []).includes("Industrial")))
      .map(({ i, d }) => {
        const dl = d.l - code.dims.l;
        const dw = d.w - code.dims.w;
        const fits = dl <= FIT.longerMaxMm && dl >= -FIT.shorterMaxMm && Math.abs(dw) <= FIT.widthTolMm;
        return { i, d, dl, dw, fits };
      })
      .filter((x) => x.fits);
    scored.sort((a, b) => Math.abs(a.dl) - Math.abs(b.dl) || num(a.i.ah) - num(b.i.ah));
    out.matches = scored.map(({ i, dl, dw }) => {
      const d = describe(i);
      d.fitNote =
        Math.abs(dl) <= 8 ? "Same footprint" : dl < 0 ? `${Math.abs(dl)} mm shorter: fits the tray; check the hold-down clamp` : `${dl} mm longer: check tray space`;
      d.polarityOk = !code.polarity || !d.polarity.length || d.polarity.includes(code.polarity);
      return d;
    });
    // prefer automotive, then matching polarity
    out.matches.sort((a, b) => b.polarityOk - a.polarityOk || autoRank(b) - autoRank(a));
    if (code.polarity) out.notes.push({ level: "info", text: `Your code ends in "${code.polarity}", so choose the ${code.polarity} terminal version so the cables reach.` });
    if (!out.matches.length) out.notes.push({ level: "warn", text: "No Alaska battery in the current catalog matches this case size. An Alaska dealer can suggest the closest option." });
    return out;
  }
  const autoRank = (d) => ((d.product.categories || []).includes("Automotive") ? 1 : 0);

  return {
    CLASSES,
    JIS_GROUP,
    SHOP_SIZES,
    FIT,
    dimsMm,
    polarityOf,
    mfCcRange,
    makes,
    models,
    engines,
    findEngine,
    classify,
    recommendForVehicle,
    parseSizeCode,
    findBySize,
  };
});
