// Run with: npm run test:js
// Tests the battery finder engine against the real catalog (public/js/tools-catalog-data.js)
// and the vehicle list (public/js/vehicle-data.js).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const sandbox = { self: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "public/js/battery-finder-engine.js"), "utf8"), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(root, "public/js/vehicle-data.js"), "utf8"), sandbox);
const F = sandbox.self.BatteryFinder;
const VEHICLES = sandbox.self.ALASKA_VEHICLES;
const catalog = new Function(fs.readFileSync(path.join(root, "public/js/tools-catalog-data.js"), "utf8") + ";return batteryData;")();
const eng = (make, model, label) => F.findEngine(VEHICLES, make, model, label);
const rec = (make, model, label) => F.recommendForVehicle(eng(make, model, label), catalog);
const arr = (x) => Array.from(x);

test("vehicle list is well-formed", () => {
  const seen = new Set();
  VEHICLES.forEach((v) => {
    assert.ok(v.make && v.model, "make/model");
    assert.ok(v.engines.length > 0, `${v.model} has engines`);
    const key = v.make + "|" + v.model;
    assert.ok(!seen.has(key), `duplicate ${key}`);
    seen.add(key);
    v.engines.forEach((e) => {
      const chart = Array.isArray(e.fit) && e.fit.length > 0;
      assert.ok(e.label && (chart || e.cc > 0), `${v.model} engine`);
      assert.ok(["petrol", "diesel"].concat(chart ? ["electric"] : []).includes(e.fuel), `${v.model} ${e.label} fuel`);
      assert.ok(F.CLASSES[F.classify(e)], `${v.model} ${e.label} class`);
    });
  });
});

test("dropdown helpers cascade make → model → engine", () => {
  assert.ok(arr(F.makes(VEHICLES)).includes("Suzuki"));
  assert.ok(arr(F.models(VEHICLES, "Toyota")).includes("Corolla"));
  assert.ok(arr(F.engines(VEHICLES, "Toyota", "Corolla")).some((e) => e.label === "GLi · 1.3L 2NZ Petrol"));
  assert.equal(F.engines(VEHICLES, "Nope", "Nope").length, 0);
});

test("classification by cc and fuel", () => {
  assert.equal(F.classify({ cc: 660, fuel: "petrol" }), "micro");
  assert.equal(F.classify({ cc: 1000, fuel: "petrol" }), "small");
  assert.equal(F.classify({ cc: 1300, fuel: "petrol" }), "compact");
  assert.equal(F.classify({ cc: 1800, fuel: "petrol" }), "mid");
  assert.equal(F.classify({ cc: 2000, fuel: "petrol" }), "large");
  assert.equal(F.classify({ cc: 2700, fuel: "petrol" }), "xl");
  assert.equal(F.classify({ cc: 2400, fuel: "diesel" }), "diesel-mid");
  assert.equal(F.classify({ cc: 2800, fuel: "diesel" }), "diesel-large");
  assert.equal(F.classify({ cc: 1500, fuel: "petrol", flags: ["hybrid"] }), "hybrid");
  assert.equal(F.classify({ cc: 2500, fuel: "diesel", cls: "tractor" }), "tractor");
});

test("every non-hybrid vehicle gets a recommendation within its class band and case sizes", () => {
  VEHICLES.forEach((v) =>
    v.engines.forEach((e) => {
      const r = F.recommendForVehicle(e, catalog);
      if (r.classKey === "hybrid" || r.verified) return;
      const main = r.picks.find((p) => p.role === "recommended");
      assert.ok(main, `${v.make} ${v.model} ${e.label} has a recommendation`);
      const [lo, hi] = r.cls.ah;
      r.picks.forEach((p) => {
        assert.ok(p.ah >= lo && p.ah <= hi, `${v.model} ${p.model} ${p.ah}Ah within ${lo}-${hi}`);
        if (!p.mf) assert.ok(r.cls.boxes.includes(p.box), `${v.model} ${p.model} box ${p.box}`);
      });
    })
  );
});

test("small cars get NS-40 batteries; diesel pickups get N-70", () => {
  const alto = rec("Suzuki", "Mehran", "800cc");
  assert.equal(alto.picks[0].box, "NS-40");
  const hilux = rec("Toyota", "Hilux", "3.0L Diesel");
  assert.equal(hilux.picks[0].box, "N-70");
  assert.ok(hilux.picks[0].ah >= 80);
});

test("maintenance-free option follows Alaska's own cc ranges", () => {
  const alto = rec("Suzuki", "Mehran", "800cc").picks.find((p) => p.role === "mf");
  assert.equal(alto.model, "MF 55"); // 660–1000 cc
  const corolla = rec("Honda", "City", "1.5L").picks.find((p) => p.role === "mf");
  assert.equal(corolla.model, "MF 70L"); // 1300–1800 cc
  const cultus = rec("Suzuki", "Alto", "1000cc (2000 to 2012)").picks.find((p) => p.role === "mf");
  assert.deepEqual(arr(cultus.twins).sort(), ["MF 60L", "MF 60R"]);
  assert.deepEqual(arr(cultus.polarity).sort(), ["L", "R"]);
  // diesel vehicles never get an MF pick (Alaska MF range is rated by petrol cc)
  assert.ok(!rec("Toyota", "Hilux", "2.4L Diesel").picks.some((p) => p.role === "mf"));
});

test("upgrade option has more capacity than the recommendation", () => {
  const r = rec("Suzuki", "Mehran", "800cc");
  const main = r.picks.find((p) => p.role === "recommended");
  const up = r.picks.find((p) => p.role === "upgrade");
  assert.ok(up.ah > main.ah);
});

test("no upgrade when the recommendation is already the top plate option in its case", () => {
  const r = rec("Honda", "City", "1.2L");
  const main = r.picks.find((p) => p.role === "recommended");
  const sameCaseMore = catalog.filter((b) => b.boxSize === main.box && Number(b.plates) > Number(main.plates) && !b.series);
  if (!sameCaseMore.length) assert.ok(!r.picks.some((p) => p.role === "upgrade"));
});

test("hybrids are not matched and say why", () => {
  const r = rec("Toyota", "Aqua", "1.5L Hybrid");
  assert.equal(r.supported, false);
  assert.equal(r.picks.length, 0);
  assert.ok(r.notes.some((n) => /hybrid/i.test(n.text)));
});

test("DIN-flagged vehicles carry a case-style warning", () => {
  const r = rec("Proton", "X70", "1.8L Turbo");
  assert.ok(r.notes.some((n) => /DIN/.test(n.text)));
});

test("24 V trucks need two batteries", () => {
  const r = rec("Truck & Bus", "Heavy truck / bus (24 V)", "Diesel, 24 V system");
  assert.equal(r.qty, 2);
  assert.ok(r.notes.some((n) => /24 V/.test(n.text)));
});

test("exact fitment entries override the rules", () => {
  const e = Object.assign({}, eng("Suzuki", "Mehran", "800cc"), { fit: ["A 60L/R"] });
  const r = F.recommendForVehicle(e, catalog);
  assert.equal(r.verified, true);
  assert.equal(r.picks[0].model, "A 60L/R");
});

test("dimension conversion and polarity parsing", () => {
  const a55 = catalog.find((b) => b.model === "A 55L");
  assert.deepEqual({ ...F.dimsMm(a55) }, { l: 197, w: 129, h: 202 }); // mm, from the company profile
  assert.deepEqual(arr(F.polarityOf({ model: "A 60L/R" })), ["L", "R"]);
  assert.deepEqual(arr(F.polarityOf({ model: "A 115Z/ZL" })), ["L", "R"]);
  assert.deepEqual(arr(F.polarityOf({ model: "MF 60R" })), ["R"]);
  assert.deepEqual(arr(F.polarityOf({ model: "A 55L" })), ["L"]);
  assert.deepEqual(arr(F.polarityOf({ model: "A 90" })), []);
  assert.deepEqual(arr(F.mfCcRange({ uses: "800cc - 1300cc Vehicles" })), [800, 1300]);
});

test("size code parsing: JIS, shop names, DIN and junk", () => {
  const j = F.parseSizeCode("55b24l");
  assert.equal(j.kind, "jis");
  assert.equal(j.polarity, "L");
  assert.deepEqual({ ...j.dims }, { l: 238, w: 129, h: 203 });
  const s = F.parseSizeCode("ns 40 zl");
  assert.equal(s.kind, "shop");
  assert.equal(s.polarity, "L");
  assert.equal(F.parseSizeCode("N-70").label, "N70");
  assert.equal(F.parseSizeCode("LN3").kind, "din");
  assert.equal(F.parseSizeCode("hello").ok, false);
  assert.equal(F.parseSizeCode("").ok, false);
});

test("find by size returns only physically compatible batteries", () => {
  const ns40 = F.findBySize("NS40", catalog);
  assert.ok(ns40.matches.length > 0);
  ns40.matches.forEach((m) => assert.equal(m.box, "NS-40"));
  const d26 = F.findBySize("80D26L", catalog).matches.map((m) => m.box);
  assert.ok(d26.length && d26.every((b) => b === "N-50"));
  const n150 = F.findBySize("N150", catalog).matches.map((m) => m.box);
  assert.ok(n150.every((b) => b === "N-150"));
  const din = F.findBySize("LN3", catalog);
  assert.equal(din.matches.length, 0);
  assert.ok(din.notes.some((n) => /DIN/.test(n.text)));
  // solar/deep-cycle batteries are never offered as car replacements
  F.findBySize("N70", catalog).matches.forEach((m) => assert.ok(!(m.product.categories || []).every((c) => c === "Solar" || c === "Deep-Cycle")));
});

test("polarity preference sorts matching terminal layouts first", () => {
  const r = F.findBySize("38B20R", catalog);
  assert.equal(r.matches[0].polarityOk, true);
  const lOnly = r.matches.find((m) => m.model === "A 55L");
  assert.equal(lOnly.polarityOk, false);
});

test("upgrade is the higher plate option in the same case size, never a bigger case", () => {
  let checked = 0;
  VEHICLES.forEach((v) =>
    v.engines.forEach((e) => {
      const r = F.recommendForVehicle(e, catalog);
      const a = r.picks.find((p) => p.role === "recommended");
      const u = r.picks.find((p) => p.role === "upgrade");
      if (!a || !u) return;
      checked++;
      assert.equal(u.box, a.box, `${v.model} ${e.label}: upgrade must keep the ${a.box} case`);
      assert.ok(Number(u.plates) > Number(a.plates), `${v.model} ${e.label}: upgrade must have more plates`);
      assert.equal(u.fitNote, null);
    })
  );
  assert.ok(checked > 10);
});

test("Alaska fitment chart entries give the chart's batteries, in its order", () => {
  let n = 0;
  VEHICLES.forEach((v) =>
    v.engines.forEach((e) => {
      if (!e.fit) return;
      n++;
      const r = F.recommendForVehicle(e, catalog);
      assert.equal(r.verified, true, `${v.model} ${e.label} verified`);
      assert.ok(r.picks.length >= 1, `${v.model} ${e.label} has picks`);
      assert.equal(r.picks[0].role, "recommended");
      e.fit.forEach((f) => f.split("|").forEach((m) => assert.ok(catalog.some((b) => b.model === m), `${m} is in the catalog`)));
    })
  );
  assert.ok(n >= 160);
  const corolla = rec("Toyota", "Corolla", "GLi · 1.3L 2NZ Petrol");
  assert.deepEqual(arr(corolla.picks.map((p) => p.model)), ["MF 75L/R", "A 75L/R"]);
  assert.equal(corolla.picks[1].label, "Dry-Charge Option");
  const truck = rec("Hino", "500 Series FM Heavy Truck", "10.5L E13C Diesel");
  assert.equal(truck.qty, 2);
  assert.equal(truck.picks[0].model, "A 200");
  const alto = rec("Suzuki", "Alto", "VXL AGS · 0.66L R06A Petrol");
  assert.deepEqual(arr(alto.picks[0].twins), ["MF 60L", "MF 60R"]);
  const ev = rec("BYD", "Seal EV", "Electric EV");
  assert.equal(ev.picks[0].model, "MF 75L/R");
  assert.ok(ev.notes.some((n) => /auxiliary/.test(n.text)));
  const missing = rec("Toyota", "Hilux", "Revo Rocco · 2.8L 1GD Diesel");
  assert.deepEqual(arr(missing.picks.map((p) => p.model)), ["MF 125"]);
  assert.ok(missing.notes.some((n) => /A 125 Z\/ZL/.test(n.text)));
});
