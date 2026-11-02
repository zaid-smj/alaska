// Run with: node --test tests/js/
// Tests the solar calculator engine against the real battery catalog in public/js/tools-catalog-data.js.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
// Load the browser script exactly as the page does (works whatever "type" package.json sets).
const sandbox = { self: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "public/js/solar-engine.js"), "utf8"), sandbox);
const E = sandbox.self.SolarEngine;
const batteryData = new Function(fs.readFileSync(path.join(root, "public/js/tools-catalog-data.js"), "utf8") + ";return batteryData;")();
const catalogs = { batteries: batteryData };
const close = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

const baseInput = (over = {}) =>
  Object.assign(
    {
      consumption: { mode: "month", value: 600 },
      location: { id: "lahore", propertyType: "residential", phase: "single" },
      systemType: "hybrid",
      backup: { required: true, hours: 4, level: "standard" },
      panelW: 585,
    },
    over
  );

test("consumption conversions use 30-day months and 365-day years", () => {
  const m = E.normalizeConsumption({ mode: "month", value: 600 });
  close(m.daily, 20);
  close(m.monthly, 600);
  close(m.annual, 7300);
  const d = E.normalizeConsumption({ mode: "day", value: 12 });
  close(d.monthly, 360);
  close(d.annual, 4380);
  const y = E.normalizeConsumption({ mode: "year", value: 3650 });
  close(y.daily, 10);
  const custom = E.normalizeConsumption({ mode: "month", value: 620, periodDays: 31 });
  close(custom.daily, 20);
});

test("consumption validation rejects bad input", () => {
  assert.equal(E.normalizeConsumption({ mode: "month", value: "" }).ok, false);
  assert.equal(E.normalizeConsumption({ mode: "month", value: -5 }).ok, false);
  assert.equal(E.normalizeConsumption({ mode: "week", value: 5 }).ok, false);
  assert.equal(E.normalizeConsumption({ mode: "month", value: 500, periodDays: 50 }).ok, false);
  assert.equal(E.normalizeConsumption({ mode: "month", value: "1,200" }).daily, 40);
});

test("solar resource: city annual mean is the day-weighted mean of seasons", () => {
  const r = E.getSolarResource("lahore");
  const s = [6.33, 4.82, 3.55, 6.51];
  const expected = (s[2] * 90 + s[3] * 92 + s[0] * 92 + s[1] * 91) / 365;
  close(r.annualPsh, expected, 1e-9);
  assert.equal(r.monthly.length, 12);
  const other = E.getSolarResource("other");
  assert.ok(other.isFallback);
  const mean = other.monthly.reduce((a, v, i) => a + v * E.DAYS_IN_MONTH[i], 0) / 365;
  close(mean, 5.5, 1e-9);
});

test("performance ratio is the product of individual losses", () => {
  const { pr } = E.performanceRatio(E.getConfig());
  close(pr, 0.91 * 0.96 * 0.97 * 0.96 * 0.98, 1e-12);
});

test("array sizing rounds panels up and recalculates installed capacity", () => {
  const res = E.getSolarResource("lahore");
  const a = E.sizeArray({ dailyKwh: 20, systemType: "on-grid", resource: res, panelW: 585 });
  const { pr } = E.performanceRatio(E.getConfig());
  const req = 20 / (res.annualPsh * pr);
  close(a.requiredKwp, req, 1e-9);
  assert.equal(a.panelCount, Math.ceil((req * 1000) / 585));
  close(a.newKwp, (a.panelCount * 585) / 1000);
  assert.ok(a.newKwp >= req);
  // generation of installed array must cover ≥100 % for on-grid target
  assert.ok(a.generation.annual >= 20 * 365 - 1e-6);
});

test("existing solar capacity is subtracted", () => {
  const res = E.getSolarResource("karachi");
  const a = E.sizeArray({ dailyKwh: 20, systemType: "on-grid", resource: res, existingKwp: 2 });
  close(a.requiredKwp, a.totalRequiredKwp - 2, 1e-9);
  const big = E.sizeArray({ dailyKwh: 5, systemType: "on-grid", resource: res, existingKwp: 10 });
  assert.equal(big.panelCount, 0);
  assert.ok(big.warnings.length > 0);
});

test("roof area limits the panel count", () => {
  const res = E.getSolarResource("lahore");
  const a = E.sizeArray({ dailyKwh: 40, systemType: "on-grid", resource: res, roofArea: 300, roofUnit: "sqft" });
  assert.ok(a.roofLimited);
  assert.ok(a.roofAreaSqft <= 300 + 1e-6);
});

test("off-grid arrays are sized for winter and are larger than on-grid", () => {
  const res = E.getSolarResource("islamabad");
  const on = E.sizeArray({ dailyKwh: 15, systemType: "on-grid", resource: res });
  const off = E.sizeArray({ dailyKwh: 15, systemType: "off-grid", resource: res });
  assert.ok(off.totalRequiredKwp > on.totalRequiredKwp);
  close(off.designPsh, 3.75);
});

test("inverter requirement: standard sizes, phase and battery voltage", () => {
  const r = E.inverterRequirement({ systemType: "on-grid", arrayKw: 5.85, dailyKwh: 20, phase: "single" });
  assert.equal(r.ratedKw, 5); // 5.85 / 1.2 = 4.875 → 5 kW
  assert.equal(r.batteryVoltage, null);
  const h = E.inverterRequirement({ systemType: "hybrid", arrayKw: 3, dailyKwh: 10, backupLoadKw: 0.5 });
  assert.equal(h.ratedKw, 3);
  assert.equal(h.batteryVoltage, 48);
  const small = E.inverterRequirement({ systemType: "hybrid", arrayKw: 1, dailyKwh: 3, backupLoadKw: 0.2 });
  assert.equal(small.batteryVoltage, 12);
  const big = E.inverterRequirement({ systemType: "on-grid", arrayKw: 20, dailyKwh: 80, phase: "unknown" });
  assert.equal(big.phase, "three");
});

test("inverter matching: empty catalog is reported, not invented", () => {
  const req = E.inverterRequirement({ systemType: "hybrid", arrayKw: 6, dailyKwh: 20, backupLoadKw: 1 });
  const out = E.recommendInverters(req, []);
  assert.equal(out.available, false);
  assert.equal(out.options.length, 0);
});

test("inverter matching rules (test fixture only, not real products)", () => {
  const req = E.inverterRequirement({ systemType: "hybrid", arrayKw: 6, dailyKwh: 20, backupLoadKw: 1, phase: "single" });
  const fixture = [
    { id: "a", model: "T-4", type: ["hybrid"], phase: "single", ratedKw: 4, maxPvKw: 5, batteryVoltage: 48 },
    { id: "b", model: "T-6", type: ["hybrid"], phase: "single", ratedKw: 6, maxPvKw: 8, batteryVoltage: 48, price: 300 },
    { id: "c", model: "T-8", type: ["hybrid"], phase: "single", ratedKw: 8, maxPvKw: 10, batteryVoltage: 48, price: 250 },
    { id: "d", model: "T-6-24", type: ["hybrid"], phase: "single", ratedKw: 6, maxPvKw: 8, batteryVoltage: 24 },
    { id: "e", model: "G-6", type: ["on-grid"], phase: "single", ratedKw: 6, maxPvKw: 8 },
  ];
  const out = E.recommendInverters(req, fixture);
  assert.equal(out.options[0].product.id, "b");
  assert.ok(out.options.some((o) => o.role === "budget" && o.product.id === "c"));
  assert.ok(out.options.some((o) => o.role === "higher" && o.product.id === "c"));
  const rejectedIds = out.rejected.map((r) => r.product.id).sort();
  assert.deepEqual(rejectedIds, ["a", "d", "e"]);
  assert.ok(out.options[0].missing.includes("maxPvVoltage"));
});

test("battery eligibility uses the real catalog and excludes MF / automotive-only", () => {
  const el = E.eligibleBatteries(batteryData).map((b) => b.model);
  assert.ok(el.includes("Solar-100"));
  assert.ok(el.includes("DC 2000"));
  assert.ok(el.includes("A 99")); // listed for "UPS Backup, Solar Inverters"
  assert.ok(!el.includes("A 55L"));
  assert.ok(!el.some((m) => m.startsWith("MF")));
});

test("battery bank configuration math", () => {
  const solar100 = batteryData.find((b) => b.model === "Solar-100"); // 60 Ah 12 V
  const need = { usableKwh: 2.4, loadKw: 0.5, bankVoltage: 24, arrayKw: 3 };
  const c = E.configureBank(solar100, need, E.getConfig());
  assert.equal(c.series, 2);
  // nominal needed 4.8 kWh; string = 24 V × 60 Ah = 1.44 kWh → 4 strings
  assert.equal(c.strings, 4);
  assert.equal(c.units, 8);
  close(c.nominalKwh, 5.76);
  close(c.usableKwh, 2.88);
  close(c.backupHours, (2.88 * 0.9) / 0.5);
});

test("discharge current can force extra strings", () => {
  const s50 = batteryData.find((b) => b.model === "Solar-50"); // 22 Ah
  const need = { usableKwh: 0.1, loadKw: 1.0, bankVoltage: 12, arrayKw: 1 };
  const c = E.configureBank(s50, need, E.getConfig());
  // current = 1000 / (12 × 0.9) = 92.6 A; per-string limit 0.2 × 22 = 4.4 A → 22 strings
  assert.equal(c.strings, Math.ceil(1000 / (12 * 0.9) / 4.4));
  assert.equal(c.suitable, false);
});

test("battery recommendations: best, budget, extended all meet the requirement", () => {
  const need = { usableKwh: 3, loadKw: 0.6, bankVoltage: 48, arrayKw: 5 };
  const rec = E.recommendBatteries(need, batteryData);
  assert.ok(rec.options.length >= 2);
  rec.options.forEach((o) => {
    assert.ok(o.usableKwh >= need.usableKwh - 1e-9, `${o.product.model} under-sized`);
    assert.ok(o.suitable);
    assert.equal(o.units % 4, 0); // 48 V = 4 × 12 V in series
  });
  const ext = rec.options.find((o) => o.role === "extended");
  if (ext) assert.ok(ext.usableKwh >= need.usableKwh * 1.5 - 1e-9);
  assert.equal(rec.options[0].role, "best");
  assert.ok(rec.options[0].purposeBuilt);
});

test("battery size depends on backup load and hours, not daily kWh alone", () => {
  const a = E.calculate(baseInput({ backup: { required: true, hours: 2, level: "essential" } }), catalogs);
  const b = E.calculate(baseInput({ backup: { required: true, hours: 8, level: "extended" } }), catalogs);
  assert.ok(b.backup.usableKwh > a.backup.usableKwh * 5);
  close(a.consumption.daily, b.consumption.daily);
});

test("full calculation: hybrid", () => {
  const r = E.calculate(baseInput(), catalogs);
  assert.ok(r.ok, r.errors.join());
  assert.ok(r.coveragePct >= 100);
  assert.equal(r.inverters.available, false);
  assert.ok(r.batteries.options.length > 0);
  assert.equal(r.inverterReq.batteryVoltage, 48);
  const text = E.buildSummary(r);
  assert.match(text, /kWh\/month/);
  assert.match(text, /Selected battery/);
});

test("on-grid with backup request warns instead of sizing a battery", () => {
  const r = E.calculate(baseInput({ systemType: "on-grid" }), catalogs);
  assert.equal(r.batteries, null);
  assert.ok(r.warnings.some((w) => /On-grid inverters switch off/.test(w.text)));
});

test("off-grid always sizes storage for the night", () => {
  const r = E.calculate(baseInput({ systemType: "off-grid", backup: { required: false, hours: 1, level: "essential" } }), catalogs);
  assert.ok(r.backup && r.backup.ok);
  close(r.backup.usableKwh, (20 * 0.45) / 0.9, 1e-9);
});

test("invalid backup input returns errors", () => {
  const r = E.calculate(baseInput({ backup: { required: true, hours: 0, level: "standard" } }), catalogs);
  assert.equal(r.ok, false);
  const c = E.calculate(baseInput({ backup: { required: true, hours: 3, level: "custom", criticalPct: 150 } }), catalogs);
  assert.equal(c.ok, false);
});

test("lithium preference falls back to catalog with a disclosed note", () => {
  const r = E.calculate(baseInput({ backup: { required: true, hours: 4, level: "standard", chemistry: "lithium" } }), catalogs);
  assert.ok(r.batteries.notes.some((n) => /lithium/i.test(n)));
});

test("scenario comparison respects system type", () => {
  const hy = [...E.compareScenarios(baseInput(), catalogs).map((s) => s.key)];
  assert.deepEqual(hy, ["solar-only", "standard", "extended"]);
  const og = [...E.compareScenarios(baseInput({ systemType: "on-grid" }), catalogs).map((s) => s.key)];
  assert.deepEqual(og, ["solar-only"]);
  const off = [...E.compareScenarios(baseInput({ systemType: "off-grid" }), catalogs).map((s) => s.key)];
  assert.deepEqual(off, ["standard", "extended"]);
});

test("changing inputs changes dependent results consistently", () => {
  const a = E.calculate(baseInput({ consumption: { mode: "month", value: 300 } }), catalogs);
  const b = E.calculate(baseInput({ consumption: { mode: "month", value: 900 } }), catalogs);
  assert.ok(b.array.panelCount > a.array.panelCount);
  assert.ok(b.inverterReq.ratedKw >= a.inverterReq.ratedKw);
  const k = E.calculate(baseInput({ location: { id: "karachi" } }), catalogs);
  const l = E.calculate(baseInput({ location: { id: "lahore" } }), catalogs);
  assert.ok(k.array.requiredKwp < l.array.requiredKwp); // sunnier → smaller array
});

test("config overrides are respected", () => {
  // a 31-day default month spreads the same monthly units over more days
  const r = E.calculate(baseInput(), catalogs, { daysPerMonth: 31 });
  close(r.consumption.daily, 600 / 31);
  const pr = E.calculate(baseInput(), catalogs, { losses: { soiling: 0.1 } });
  const base = E.calculate(baseInput(), catalogs);
  assert.ok(pr.array.requiredKwp > base.array.requiredKwp);
});
