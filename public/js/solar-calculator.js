/*
 * Alaska Batteries — Solar Calculator UI (three steps: usage, system, backup)
 * Wires solar-calculator.html to SolarEngine (js/solar-engine.js). All sizing and
 * product matching live in the engine; this file reads the steps, shows the result
 * beside them (with a lead-acid vs lithium comparison) and sends quote requests.
 */
(function () {
  "use strict";

  const E = window.SolarEngine;
  const F = window.AlaskaForms;
  const LEAD = typeof batteryData !== "undefined" ? batteryData : [];
  const LITHIUM_RAW = typeof lithiumData !== "undefined" ? lithiumData : [];
  const DRAFT_KEY = "alaska-solar-draft-v5";
  const PANEL_W = E.getConfig().panel.defaultWatt;
  const SYSTEM_HELP = {
    "on-grid": "Solar powers your home by day and sends extra power to the grid (net metering). No batteries, so no power during load-shedding.",
    hybrid: "Solar, grid and batteries work together: lower bills by day and backup during load-shedding. The most popular choice in Pakistan.",
    "off-grid": "No grid at all. Solar and batteries supply everything, day and night, so it needs more panels and batteries. For farms and remote sites.",
  };
  const ROLE_LABEL = { best: "Best Match", budget: "Lower Cost", extended: "Longer Backup" };

  // Life Series LiFePO4 packs in the shape the engine expects (values from js/lithium-data.js)
  const SYS_V = { 12.8: 12, 25.6: 24, 48: 48, 51.2: 48 };
  const spec = (item, key) => (item.specs || []).find((r) => r[0] === key);
  const LITHIUM = LITHIUM_RAW.filter((i) => SYS_V[i.nominalVoltageV]).map((i) => {
    const wt = spec(i, "Weight");
    const cyc = spec(i, "Cycle Life");
    return {
      id: i.id,
      model: i.model,
      ah: i.capacityAh,
      p: i.nominalVoltageV,
      systemV: SYS_V[i.nominalVoltageV],
      tech: "LiFePO4 lithium (Life Series)",
      categories: ["Solar"],
      image: i.image,
      warranty: "5 Years",
      weightKg: wt ? parseFloat(String(wt[1]).replace(/[^\d.]/g, "")) : null,
      cycleLife: cyc ? cyc[1] : null,
      lithium: true,
    };
  });
  // Alaska hybrid inverters (js/inverter-data.js) in the shape the engine expects.
  // Unpublished specs stay null; the battery voltage is part of every model name.
  const INV_RAW = typeof inverterData !== "undefined" ? inverterData : [];
  const INV_IMG = typeof inverterRange !== "undefined" ? inverterRange.image : "";
  const INVERTERS = INV_RAW.map((i) => {
    const nameV = (String(i.model).match(/-(\d+)V$/) || [])[1];
    return {
      id: i.id,
      model: i.model,
      image: INV_IMG,
      url: "/solutions/inverters",
      type: ["hybrid", "off-grid", "on-grid"],
      phase: i.phase === "3P" ? "three" : "single",
      ratedKw: i.ratedKw,
      maxPvKw: i.pvW ? i.pvW / 1000 : null,
      batteryVoltage: i.batteryV || (nameV ? Number(nameV) : null),
      mppt: i.mppt,
      pending: !!i.pending,
    };
  });
  const CATALOGS = { batteries: LEAD.concat(LITHIUM), inverters: INVERTERS.length ? INVERTERS : E.INVERTER_CATALOG };

  const $ = (s, el) => (el || document).querySelector(s);
  const form = $("#sc-form");
  const out = $("#sc-result");
  // Results appear after "Calculate", then follow every change automatically
  const state = { role: "best", invRole: "best", results: {}, calculated: false };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmt = (n, d = 0) => (Number.isFinite(n) ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
  const radio = (name) => (form.querySelector(`input[name="${name}"]:checked`) || {}).value;
  const store = {
    get() {
      try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (e) { return null; }
    },
    set(v) {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch (e) {}
    },
  };
  function productUrl(p) {
    if (p.lithium) return "/solutions/lithium-ion";
    const cats = p.categories || [];
    if (cats.includes("Deep-Cycle") || p.series === "deep-cycle") return "/lead-acid";
    if (cats.includes("Solar")) return "/lead-acid";
    return "/lead-acid";
  }

  // ------------------------------------------------------------ setup
  function buildCities() {
    const groups = {};
    E.LOCATIONS.forEach((l) => (groups[l.region] = groups[l.region] || []).push(l));
    $("#city").innerHTML =
      Object.keys(groups)
        .map((g) => `<optgroup label="${esc(g)}">${groups[g].slice().sort((a, b) => a.name.localeCompare(b.name)).map((l) => `<option value="${l.id}">${esc(l.name)}</option>`).join("")}</optgroup>`)
        .join("") + `<option value="other">Other city</option>`;
    $("#city").value = "lahore";
  }
  function loadDraft() {
    const d = store.get();
    if (!d) return;
    if (d.units) $("#units").value = d.units;
    if (d.city && $(`#city option[value="${CSS.escape(d.city)}"]`)) $("#city").value = d.city;
    ["systemType", "hours", "chemistry"].forEach((n) => {
      const el = d[n] && form.querySelector(`input[name="${n}"][value="${CSS.escape(String(d[n]))}"]`);
      if (el) el.checked = true;
    });
  }

  // ------------------------------------------------------------ calculate
  function input(chemistry) {
    const sys = radio("systemType") || "hybrid";
    return {
      consumption: { mode: "month", value: $("#units").value.trim().replace(/,/g, "") },
      location: { id: $("#city").value, propertyType: "residential", phase: "unknown" },
      systemType: sys,
      backup: { required: sys !== "on-grid", hours: Number(radio("hours") || 4), level: "custom", criticalPct: 100, chemistry },
      prefs: {},
      panelW: PANEL_W,
    };
  }

  function update() {
    const sys = radio("systemType") || "hybrid";
    $("#system-help").textContent = SYSTEM_HELP[sys];
    $("#backup-fields").hidden = sys === "on-grid";
    $("#backup-off").hidden = sys !== "on-grid";

    const raw = $("#units").value.trim();
    const c = E.normalizeConsumption({ mode: "month", value: raw.replace(/,/g, "") });
    $("#units-err").textContent = raw && !c.ok ? c.errors[0] : "";
    $("#units").setAttribute("aria-invalid", raw && !c.ok ? "true" : "false");

    const chem = radio("chemistry") || "compare";
    state.results = {};
    if (c.ok) {
      if (chem === "compare" || chem === "lead-acid") state.results.lead = E.calculate(input("lead-acid"), CATALOGS);
      if (chem === "compare" || chem === "lithium") state.results.li = E.calculate(input("lithium"), CATALOGS);
    }
    render();
    store.set({ units: $("#units").value, city: $("#city").value, systemType: sys, hours: radio("hours"), chemistry: chem, });
  }

  // ------------------------------------------------------------ result
  const label = (t) => `<h4 class="text-[#c00d1e] font-black uppercase text-xs tracking-widest mb-4">${t}</h4>`;
  const tick = (html) => `<li><i class="fas fa-check" aria-hidden="true"></i><span>${html}</span></li>`;
  const main = () => state.results.lead || state.results.li || null;
  const optionsOf = (r) => (r && r.batteries && r.batteries.options) || [];
  const pick = (r) => {
    const o = optionsOf(r);
    return o.find((x) => x.role === state.role) || o[0] || null;
  };

  function render() {
    const r = main();
    $("#sc-quote").hidden = !state.calculated || !(r && r.ok) || $("#sc-quote").dataset.open !== "1";
    if (!state.calculated || !r || !r.ok) {
      const msg = state.calculated && r && r.errors
        ? esc(r.errors[0])
        : state.calculated
          ? "Enter the units from your electricity bill to see your system."
          : "Answer the three steps, then press Calculate. After that, your system updates as you change any answer.";
      out.innerHTML = `<div>${label("Your Solar System")}
        <p class="sc-empty">${msg}</p></div>
        <div>${label("What You Get")}<ul class="sc-list">
          ${tick("The number of solar panels you need and the right Alaska inverter")}
          ${tick("Battery backup sized from your units and the hours you need")}
          ${tick("Lead-acid and lithium (LiFePO4) options compared side by side")}
          ${tick("A free quote from our team")}
        </ul></div>
        ${state.calculated ? "" : `<div><button type="button" class="btn-primary btn-lg" data-act="calc">Calculate</button></div>`}`;
      return;
    }
    const a = r.array;
    const sysName = r.systemType;
    const an = sysName === "hybrid" ? "A" : "An";
    let html = `
      <div>${label("Your Solar System")}
        <div class="sc-big">${fmt(a.newKwp, 1)} <span>kWp</span></div>
        <p class="sc-sub">${an} ${sysName} system that covers about <b>${fmt(Math.min(r.coveragePct, 999), 0)}%</b> of the electricity you use in a year in ${esc(r.resource.location.name)}.</p>
      </div>
      <div>${label("What You Need")}<ul class="sc-list">
        ${tick(`<b>${a.panelCount} × ${a.panelW} W</b> solar panels`)}
        ${tick(`An inverter of at least <b>${r.inverterReq.ratedKw} kW</b>${r.inverterReq.batteryVoltage ? ` with a ${r.inverterReq.batteryVoltage} V battery input` : ""}`)}
        ${tick(`About <b>${fmt(a.roofAreaSqft, 0)} sq ft</b> of shade-free roof`)}
        ${tick(`Makes about <b>${fmt(a.generation.monthly, 0)} units</b> a month (you use ${fmt(r.consumption.monthly, 0)})`)}
      </ul></div>`;
    html += inverterHtml(r);
    if (sysName !== "on-grid") html += backupHtml(r);
    html += `<div class="sc-actions">
        <button type="button" class="btn-primary" data-act="quote">Request a Quote</button>
        <a class="btn-secondary sc-wa" href="${F.waLink("Assalam o Alaikum, I used the Alaska Solar Calculator and would like a quotation.\n\n" + summary())}" target="_blank" rel="noopener"><i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp Us</a>
      </div>
      <p class="sc-note">Estimate only.</p>`;
    out.innerHTML = html;
  }

  const INV_LABEL = { best: "Best Match", higher: "Room to Grow", budget: "Lower Cost" };
  function inverterHtml(r) {
    const inv = r.inverters || {};
    const opts = inv.options || [];
    const pickI = opts.find((o) => o.role === state.invRole) || opts[0];
    let html = `<div>${label("Recommended Inverter")}`;
    if (!pickI) {
      return html + `<p class="sc-empty">This system needs about ${r.inverterReq.ratedKw} kW${r.inverterReq.phase === "three" ? " three-phase" : ""}. Request a quote and our team will recommend the right Alaska inverter.</p></div>`;
    }
    if (opts.length > 1)
      html += `<div class="sf-chips sc-radio" role="group" aria-label="Inverter option" style="margin-bottom:18px">${opts
        .map((o) => `<label class="sf-chip"><input type="radio" name="sc-inv" value="${o.role}" ${o.role === pickI.role ? "checked" : ""}><span>${esc(INV_LABEL[o.role] || o.label)}</span></label>`)
        .join("")}</div>`;
    const p = pickI.product;
    const onGrid = r.systemType === "on-grid";
    const facts = [`${p.ratedKw} kW output`, p.batteryVoltage && !onGrid ? `${p.batteryVoltage} V battery` : null, p.phase === "three" ? "three-phase" : "single-phase", p.maxPvKw ? `up to ${fmt(p.maxPvKw, 1)} kWp of panels` : null, "2-year warranty"]
      .filter(Boolean)
      .join(" · ");
    html += `<div class="sc-bat">
        ${p.image ? `<img src="${esc(p.image)}" alt="Alaska ${esc(p.model)} hybrid inverter" loading="lazy" />` : "<span></span>"}
        <div><div class="m">${esc(p.model)}</div>
          <div class="s">${esc(facts)}</div>
          ${onGrid ? `<div class="s">Hybrid inverter set up for grid feeding (net metering), with room to add batteries later.</div>` : ""}
          ${p.pending ? `<div class="s">Full specifications are not yet published; our team confirms them with your quote.</div>` : ""}
          <a href="${esc(p.url)}">View inverter</a></div>
      </div></div>`;
    return html;
  }

  function backupHtml(r) {
    const b = r.backup;
    if (!b || !b.ok) {
      return `<div>${label("Your Backup")}<p class="sc-empty">${esc(b && b.errors ? b.errors[0] : "")}</p></div>`;
    }
    let html = `<div>${label("Your Backup")}<ul class="sc-list">
        ${tick(`About <b>${fmt(b.loadKw, 2)} kW</b> for <b>${b.hours} hours</b>, based on your units`)}
        ${tick(`Needs about <b>${fmt(b.usableKwh, 1)} kWh</b> of usable battery storage${/night/.test(b.basis) ? ", enough to carry your home through the night with no grid" : ""}`)}
      </ul></div>`;
    const chem = radio("chemistry") || "compare";
    if (chem === "compare") return html + compareHtml();
    const opts = optionsOf(r);
    const bat = pick(r);
    html += `<div>${label("Recommended Battery")}`;
    if (!bat) {
      html += `<p class="sc-empty">${esc((r.batteries && r.batteries.notes[r.batteries.notes.length - 1]) || "This backup needs a custom battery bank.")} Request a quote and our team will design it for you.</p></div>`;
      return html;
    }
    if (opts.length > 1)
      html += `<div class="sf-chips sc-radio" role="group" aria-label="Battery option" style="margin-bottom:18px">${opts
        .map((o) => `<label class="sf-chip"><input type="radio" name="sc-role" value="${o.role}" ${o.role === bat.role ? "checked" : ""}><span>${esc(ROLE_LABEL[o.role] || o.label)}</span></label>`)
        .join("")}</div>`;
    html += `<div class="sc-bat">
        <img src="${esc(bat.product.image)}" alt="Alaska ${esc(bat.product.model)} battery" loading="lazy" />
        <div><div class="m">${bat.units} × ${esc(bat.product.model)}</div>
          <div class="s">About ${fmt(bat.backupHours, 1)} hours of backup · ${bat.bankVoltage} V battery bank</div>
          <a href="${productUrl(bat.product)}">View battery</a></div>
      </div></div>`;
    return html;
  }

  const wiring = (o) =>
    o.series > 1 && o.strings > 1 ? `${o.series} in series × ${o.strings} strings` : o.series > 1 ? `${o.series} in series` : o.strings > 1 ? `${o.strings} in parallel` : "single battery";

  function compareHtml() {
    const lead = pick(state.results.lead);
    const li = pick(state.results.li);
    if (!lead && !li) return `<div>${label("Compare Batteries")}<p class="sc-empty">This backup needs a custom battery bank. Request a quote and our team will design it for you.</p></div>`;
    const cell = (o, f) => (o ? f(o) : "Ask our team");
    const rows = [
      ["Battery", (o) => `<div class="pic"><img src="${esc(o.product.image)}" alt="" loading="lazy"><div>${o.units} × ${esc(o.product.model)}<br><a href="${productUrl(o.product)}">View</a></div></div>`],
      ["Battery bank", (o) => `${o.bankVoltage} V, ${wiring(o)}`],
      ["Usable storage", (o) => `${fmt(o.usableKwh, 1)} kWh (${Math.round(o.dod * 100)}% of ${fmt(o.nominalKwh, 1)})`],
      ["Est. backup", (o) => `About ${fmt(o.backupHours, 1)} h`],
      ["Recharge from solar", (o) => (o.rechargeHours ? `About ${fmt(o.rechargeHours, 0)} h of sun` : "—")],
      ["Cycle life", (o) => esc(o.product.cycleLife ? o.product.cycleLife.split(" /")[0].replace("@", "at").replace("DOD", "DoD") : "Not published")],
      ["Maintenance", (o) => (o.product.lithium ? "None (built-in BMS)" : "Top up distilled water")],
      ["Total weight", (o) => (o.totalWeightKg ? `About ${fmt(o.totalWeightKg, 0)} kg` : "—")],
      ["Warranty", (o) => esc(o.warranty)],
    ];
    return `<div>${label("Lead-Acid vs Lithium")}
      <table class="sc-cmp"><thead><tr><th scope="col"><span class="sr-only">Feature</span></th><th scope="col">Lead-Acid</th><th scope="col">Lithium (LiFePO4)</th></tr></thead>
      <tbody>${rows.map(([k, f]) => `<tr><th scope="row">${k}</th><td>${cell(lead, f)}</td><td>${cell(li, f)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function summary() {
    const r = main();
    if (!r || !r.ok) return "";
    const chem = radio("chemistry") || "compare";
    const invOpts = (r.inverters && r.inverters.options) || [];
    const inverter = invOpts.find((o) => o.role === state.invRole) || invOpts[0];
    let txt = E.buildSummary(r, { battery: chem === "compare" ? pick(state.results.lead) : pick(r), inverter });
    if (chem === "compare" && pick(state.results.li)) {
      const l = pick(state.results.li);
      txt += `\nLithium option: ${l.units} × ${l.product.model} — ${l.bankVoltage} V bank, ${fmt(l.usableKwh, 1)} kWh usable, ~${fmt(l.backupHours, 1)} h backup`;
    }
    return txt;
  }

  // ------------------------------------------------------------ quote
  async function sendQuote(e) {
    e.preventDefault();
    const r = main();
    if (!r || !r.ok) return;
    const name = $("#q-name"), phone = $("#q-phone"), email = $("#q-email");
    const bad = F.validate(
      [
        { el: name, msg: "your name" },
        { el: phone, test: F.isPhone, msg: "a valid phone number" },
        { el: email, test: F.isEmail, msg: "a valid email" },
      ],
      $("#q-err")
    );
    if (bad) return;
    const btn = $("#q-submit");
    btn.disabled = true;
    btn.textContent = "Sending…";
    const res = await F.send({
      form: "solar-quote",
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      subject: `Solar quotation: ${fmt(r.array.newKwp, 1)} kWp ${r.systemType}, ${r.resource.location.name}`,
      message: summary(),
    });
    btn.disabled = false;
    btn.textContent = "Send Request";
    const st = $("#q-status");
    if (res.ok) {
      st.className = "sc-status ok";
      st.textContent = "Thank you. Your request has been sent and our team will contact you shortly.";
      $("#sc-quote").reset();
    } else {
      st.className = "sc-status err";
      st.innerHTML = `We couldn't send your request right now. <a class="underline" target="_blank" rel="noopener" href="${F.waLink(
        "Assalam o Alaikum, I'd like a solar quotation.\n\n" + summary() + `\n\nName: ${name.value.trim()}\nPhone: ${phone.value.trim()}\nEmail: ${email.value.trim()}`
      )}">Send it on WhatsApp instead</a>.`;
    }
  }

  // ------------------------------------------------------------ events
  function init() {
    buildCities();
    loadDraft();
    // "input" covers the text box, the city list and the chips; a "change" on leaving
    // the units box would redraw the result under the pointer and swallow the click
    form.addEventListener("input", update);
    form.addEventListener("submit", (e) => e.preventDefault());
    out.addEventListener("change", (e) => {
      if (e.target.name === "sc-inv") {
        state.invRole = e.target.value;
        render();
        const el = out.querySelector(`input[name="sc-inv"][value="${state.invRole}"]`);
        if (el) el.focus();
        return;
      }
      if (e.target.name === "sc-role") {
        state.role = e.target.value;
        render();
        const el = out.querySelector(`input[name="sc-role"][value="${state.role}"]`);
        if (el) el.focus();
      }
    });
    out.addEventListener("click", (e) => {
      if (e.target.closest('[data-act="calc"]')) {
        const raw = $("#units").value.trim();
        if (!raw) {
          $("#units-err").textContent = "Enter your units per month first.";
          $("#units").setAttribute("aria-invalid", "true");
          $("#units").focus();
          return;
        }
        state.calculated = true;
        update();
        const h = out.querySelector("h4");
        if (h) {
          h.setAttribute("tabindex", "-1");
          h.focus({ preventScroll: true });
        }
        if (window.innerWidth < 768) out.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (e.target.closest('[data-act="quote"]')) {
        const q = $("#sc-quote");
        q.dataset.open = "1";
        q.hidden = false;
        $("#q-status").textContent = "";
        $("#q-name").focus();
        q.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
    $("#sc-quote").addEventListener("submit", sendQuote);
    update();
    if (!LEAD.length) console.warn("Solar calculator: battery catalog (js/data.js) not loaded.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
