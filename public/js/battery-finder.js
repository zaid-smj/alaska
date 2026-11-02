/*
 * Alaska Batteries — Battery Finder UI
 * Wires battery-finder.html to BatteryFinder (js/battery-finder-engine.js),
 * the vehicle list (js/vehicle-data.js) and the product catalog (js/data.js).
 * Searches are reflected in the URL (?make=&model=&engine= or ?size=) so a
 * result can be shared or bookmarked.
 */
(function () {
  "use strict";

  const F = window.BatteryFinder;
  const VEHICLES = window.ALASKA_VEHICLES || [];
  const CATALOG = typeof batteryData !== "undefined" ? batteryData : [];
  const WHATSAPP_NUMBER = "923266660757";
  const POPULAR = [
    ["Suzuki", "Alto", "660cc"],
    ["Suzuki", "Cultus", "1000cc"],
    ["Suzuki", "Mehran", "800cc"],
    ["Toyota", "Corolla", "1.3L XLi / GLi"],
    ["Honda", "City", "1.2L"],
    ["Honda", "Civic", "1.5L Turbo"],
    ["Toyota", "Hilux", "2.8L Diesel"],
    ["KIA", "Picanto", "1.0L"],
  ];
  const SIZE_EXAMPLES = ["NS40", "N40", "N50", "N70", "38B20L", "46B24R", "80D26L", "N150"];

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const root = $("#bf-root");
  const out = $("#bf-results");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const storage = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch (e) {}
    },
    del(k) {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    },
  };

  // ------------------------------------------------------------ selects
  const sel = { make: $("#bf-make"), model: $("#bf-model"), engine: $("#bf-engine") };
  const opt = (v, label, ph) => `<option value="${esc(v)}"${ph ? " disabled selected" : ""}>${esc(label)}</option>`;

  function fillMakes() {
    sel.make.innerHTML = opt("", "Select make", true) + F.makes(VEHICLES).map((m) => opt(m, m)).join("");
  }
  function fillModels() {
    const make = sel.make.value;
    const list = make ? F.models(VEHICLES, make) : [];
    sel.model.innerHTML = opt("", make ? "Select model" : "Choose make first", true) + list.map((m) => opt(m, m)).join("");
    sel.model.disabled = !make;
    fillEngines();
  }
  function fillEngines() {
    const list = sel.model.value ? F.engines(VEHICLES, sel.make.value, sel.model.value) : [];
    sel.engine.innerHTML = opt("", sel.model.value ? "Select engine" : "Choose model first", true) + list.map((e) => opt(e.label, e.label)).join("");
    sel.engine.disabled = !sel.model.value;
    if (list.length === 1) sel.engine.value = list[0].label; // only one option: pre-select it
    $("#bf-go").disabled = !sel.engine.value;
  }
  function setVehicle(make, model, engine) {
    sel.make.value = make;
    fillModels();
    sel.model.value = model;
    fillEngines();
    if (engine) sel.engine.value = engine;
    $("#bf-go").disabled = !sel.engine.value;
  }

  // ------------------------------------------------------------ rendering
  function productUrl(d) {
    if (d.mf) return "/lead-acid";
    const cats = d.product.categories || [];
    if (cats.includes("Industrial") && !cats.includes("Automotive")) return "/lead-acid";
    return "/lead-acid";
  }
  function waLink(text) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }
  function dimsText(d) {
    return d.dims ? `${d.dims.l} × ${d.dims.w} × ${d.dims.h} mm` : "N/A";
  }
  function noteHtml(n) {
    const ic = n.level === "warn" ? "fa-triangle-exclamation" : "fa-circle-info";
    return `<div class="sc-note ${n.level === "warn" ? "warn" : ""}"><i class="fa-solid ${ic}" aria-hidden="true"></i><div>${esc(n.text)}</div></div>`;
  }

  function card(d, ctx) {
    const qty = ctx.qty > 1 ? `<span class="bf-qty">× ${ctx.qty}</span>` : "";
    const variants = (d.twins && d.twins.length > 1 ? d.twins : d.polarity.length > 1 ? d.polarity.map((p) => `${p} terminal`) : d.polarity.map((p) => `${p} terminal`)).map(
      (v) => `<span>${esc(v)}</span>`
    );
    const ask = `Assalam o Alaikum, I'd like the price and availability of Alaska ${d.model}${ctx.qty > 1 ? " (×" + ctx.qty + ")" : ""} for my ${ctx.subject}.`;
    return `<article class="sc-card sc-opt role-${d.role === "recommended" ? "best" : esc(d.role || "other")}" aria-label="${esc(d.label || "Option")}: ${esc(d.model)}">
      <span class="sc-opt-badge">${esc(d.label || "Fits")}</span>
      <div class="sc-opt-img"><img src="${esc(d.product.image)}" alt="Alaska ${esc(d.model)} battery" loading="lazy"></div>
      <div class="sc-opt-body">
        <div class="model">${esc(d.model)}${qty}</div>
        <div class="tech">${esc(d.tech)}</div>
        ${variants.length ? `<div class="bf-variants" aria-label="Available versions">${variants.join("")}</div>` : ""}
        ${d.fitNote ? `<div class="bf-fitnote ${/check/.test(d.fitNote) ? "warn" : ""}"><i class="fa-solid ${/check/.test(d.fitNote) ? "fa-circle-exclamation" : "fa-circle-check"}" aria-hidden="true"></i>${esc(d.fitNote)}</div>` : ""}
        ${d.polarityOk === false ? `<div class="bf-fitnote warn"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Terminal side differs from your code</div>` : ""}
        <div class="sc-specs">
          <div><span>Capacity</span><b>${d.ah} Ah</b></div>
          <div><span>Voltage</span><b>12 V</b></div>
          <div><span>Case size</span><b>${esc(d.box || (d.mf ? "MF range" : "N/A"))}</b></div>
          <div><span>Plates</span><b>${d.plates || "N/A"}</b></div>
          <div><span>Dimensions</span><b>${dimsText(d)}</b></div>
          <div><span>Weight</span><b>${d.weightKg ? d.weightKg + " kg" : "N/A"}</b></div>
          <div><span>Warranty</span><b>${esc(d.warranty)}</b></div>
          <div><span>Price</span><b>Ask a dealer</b></div>
        </div>
        ${d.why ? `<p class="sc-opt-why">${esc(d.why)}</p>` : ""}
        <div class="sc-opt-actions">
          <button type="button" class="sc-btn sm" data-add-cart="${esc(d.product.id)}" data-qty="${ctx.qty}" data-note="${esc("For " + ctx.subject + (d.twins && d.twins.length > 1 ? ", " + d.twins.join(" or ") : ""))}"><i class="fa-solid fa-cart-plus" aria-hidden="true"></i>Add to Cart</button>
          <a class="sc-btn ghost sm" href="dealers.html#partner-finder"><i class="fa-solid fa-location-dot" aria-hidden="true"></i>Dealer</a>
          <a class="sc-btn wa sm" href="${waLink(ask)}" target="_blank" rel="noopener" aria-label="Ask about ${esc(d.model)} on WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
          <a class="sc-btn plain sm" href="${productUrl(d)}">View product</a>
        </div>
      </div>
    </article>`;
  }

  function compareTable(list, qty) {
    if (list.length < 2) return "";
    const rows = [
      ["Capacity", (d) => `${d.ah} Ah`],
      ["Case size", (d) => esc(d.box || (d.mf ? "MF range" : "N/A"))],
      ["Dimensions", dimsText],
      ["Terminal", (d) => (d.twins && d.twins.length > 1 ? esc(d.twins.join(" / ")) : d.polarity.length ? d.polarity.join(" / ") : "N/A")],
      ["Technology", (d) => esc(d.tech)],
      ["Plates", (d) => d.plates || "N/A"],
      ["Weight", (d) => (d.weightKg ? `${d.weightKg} kg` : "N/A")],
      ["Warranty", (d) => esc(d.warranty)],
      ["Quantity needed", () => String(qty)],
    ];
    return `<details class="sc-details" style="margin-top:18px">
      <summary>Compare these batteries</summary>
      <div class="sc-card sc-table-wrap" style="margin-bottom:6px"><table class="sc-table"><caption class="sr-only">Recommended batteries compared</caption>
        <thead><tr><th scope="col"></th>${list.map((d) => `<th scope="col">${esc(d.label || "")}<br><span style="text-transform:none;letter-spacing:0;font-size:14px;color:var(--ink)">${esc(d.model)}</span></th>`).join("")}</tr></thead>
        <tbody>${rows.map(([k, f]) => `<tr><th scope="row">${k}</th>${list.map((d) => `<td>${f(d)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>
    </details>`;
  }

  function othersTable(list) {
    if (!list.length) return "";
    return `<details class="sc-details" style="margin-top:6px">
      <summary>Other Alaska batteries in this size range (${list.length})</summary>
      <div class="sc-card sc-table-wrap" style="margin-bottom:6px"><table class="sc-table"><caption class="sr-only">Other compatible batteries</caption>
        <thead><tr><th scope="col">Model</th><th scope="col">Capacity</th><th scope="col">Case</th><th scope="col">Dimensions</th><th scope="col">Warranty</th><th scope="col"></th></tr></thead>
        <tbody>${list
          .map(
            (d) => `<tr><th scope="row">${esc(d.model)}</th><td>${d.ah} Ah</td><td>${esc(d.box || "N/A")}</td><td>${dimsText(d)}</td><td>${esc(d.warranty)}</td><td><a href="${productUrl(d)}" style="color:var(--red);font-weight:700">View</a></td></tr>`
          )
          .join("")}</tbody>
      </table></div>
    </details>`;
  }

  function actionsBar(subject) {
    return `<div class="sc-actions bf-actions">
      <button type="button" class="sc-btn ghost sm" data-action="share"><i class="fa-solid fa-link" aria-hidden="true"></i>Copy link</button>
      <a class="sc-btn ghost sm" href="${waLink(`Assalam o Alaikum, which Alaska battery do you recommend for my ${subject}?`)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>Ask on WhatsApp</a>
      <button type="button" class="sc-btn plain sm" data-action="new"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i>New search</button>
    </div>`;
  }

  function renderVehicle(make, model, engineLabel) {
    const engine = F.findEngine(VEHICLES, make, model, engineLabel);
    if (!engine) return;
    const r = F.recommendForVehicle(engine, CATALOG);
    const subject = `${make} ${model} ${engineLabel}`;
    const band = !r.verified && r.cls && r.cls.ah ? `${r.cls.ah[0]} to ${r.cls.ah[1]} Ah` : null;
    const head = `<div class="bf-res-head">
        <div>
          <div class="k">${r.picks.length ? "Batteries for your vehicle" : "Your vehicle"}</div>
          <h3>${esc(make)} ${esc(model)} <span style="color:var(--muted);font-weight:700">${esc(engineLabel)}</span></h3>
          <div class="bf-tags">
            <span class="bf-tag"><i class="fa-solid fa-gas-pump" aria-hidden="true"></i>${esc(engine.fuel === "diesel" ? "Diesel" : engine.fuel === "electric" ? "Electric" : "Petrol")}${engine.cc && engine.fuel !== "electric" && r.classKey !== "tractor" && !/truck/.test(r.classKey) ? " · " + engine.cc + " cc" : ""}</span>
            ${r.cls ? `<span class="bf-tag"><i class="fa-solid fa-car-side" aria-hidden="true"></i>${esc(r.cls.label)}</span>` : ""}
            ${band ? `<span class="bf-tag"><i class="fa-solid fa-battery-three-quarters" aria-hidden="true"></i>Typical need ${band}${r.qty > 1 ? " × " + r.qty : ""}</span>` : ""}
            ${r.verified ? `<span class="bf-tag"><i class="fa-solid fa-circle-check" aria-hidden="true"></i>Alaska fitment chart</span>` : ""}
          </div>
        </div>
        ${actionsBar(subject)}
      </div>`;
    if (!r.picks.length) {
      out.innerHTML =
        head +
        r.notes.map(noteHtml).join("") +
        `<div class="sc-card bf-empty"><i class="fa-solid fa-headset" aria-hidden="true"></i><h4>Let an Alaska dealer help</h4><p>We couldn't match a battery for this vehicle from the online catalog. A dealer can check it for you.</p>
        <div class="sc-actions" style="justify-content:center"><a class="sc-btn" href="dealers.html#partner-finder">Find a dealer</a><a class="sc-btn wa" target="_blank" rel="noopener" href="${waLink(`Assalam o Alaikum, I need a battery for my ${subject}.`)}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>WhatsApp us</a></div></div>`;
      return;
    }
    out.innerHTML =
      head +
      `<div class="bf-picks n-${Math.min(r.picks.length, 3)}">${r.picks.map((p) => card(p, { qty: r.qty, subject })).join("")}</div>` +
      `<div style="margin-top:16px">${r.notes.map(noteHtml).join("")}</div>` +
      compareTable(r.picks, r.qty) +
      othersTable(r.others);
  }

  function renderSize(code) {
    const r = F.findBySize(code, CATALOG);
    if (!r.code.ok) {
      $("#bf-size-err").textContent = r.code.error;
      $("#bf-size").setAttribute("aria-invalid", "true");
      out.innerHTML = "";
      return false;
    }
    $("#bf-size-err").textContent = "";
    $("#bf-size").removeAttribute("aria-invalid");
    const subject = `car (current battery ${r.code.label})`;
    const head = `<div class="bf-res-head">
        <div>
          <div class="k">Same-size replacements</div>
          <h3>Batteries that fit a ${esc(r.code.label)} tray</h3>
          <div class="bf-tags">
            ${r.code.dims ? `<span class="bf-tag"><i class="fa-solid fa-ruler-combined" aria-hidden="true"></i>About ${r.code.dims.l} × ${r.code.dims.w} mm</span>` : ""}
            ${r.code.note ? `<span class="bf-tag"><i class="fa-solid fa-circle-info" aria-hidden="true"></i>${esc(r.code.note)}</span>` : ""}
            ${r.code.polarity ? `<span class="bf-tag"><i class="fa-solid fa-left-right" aria-hidden="true"></i>${r.code.polarity} terminal layout</span>` : ""}
          </div>
        </div>
        ${actionsBar(subject)}
      </div>`;
    const picks = r.matches.slice(0, 3).map((m, i) => Object.assign(m, { label: i === 0 ? "Closest fit" : "Also fits", role: i === 0 ? "recommended" : "other" }));
    const rest = r.matches.slice(3);
    out.innerHTML =
      head +
      (picks.length
        ? `<div class="bf-picks n-${Math.min(picks.length, 3)}">${picks.map((p) => card(p, { qty: 1, subject })).join("")}</div>`
        : `<div class="sc-card bf-empty"><i class="fa-solid fa-ruler" aria-hidden="true"></i><h4>No same-size Alaska battery listed</h4><p>An Alaska dealer can suggest the closest fit for your vehicle.</p><a class="sc-btn" href="dealers.html#partner-finder">Find a dealer</a></div>`) +
      `<div style="margin-top:16px">${r.notes.map(noteHtml).join("")}</div>` +
      compareTable(picks, 1) +
      othersTable(rest);
    return true;
  }

  // ------------------------------------------------------------ state / URL
  function setUrl(params) {
    const u = new URL(window.location.href);
    ["make", "model", "engine", "size"].forEach((k) => u.searchParams.delete(k));
    Object.entries(params).forEach(([k, v]) => v && u.searchParams.set(k, v));
    history.replaceState(null, "", u.pathname + (u.searchParams.toString() ? "?" + u.searchParams.toString() : "") + u.hash);
  }
  function focusResults() {
    out.focus({ preventScroll: true });
    const top = out.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "bf-toast";
    t.setAttribute("role", "status");
    t.textContent = msg;
    root.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }


  // ------------------------------------------------------------ events
  function bind() {
    sel.make.addEventListener("change", () => {
      fillModels();
      sel.model.focus();
    });
    sel.model.addEventListener("change", () => {
      fillEngines();
      if (sel.engine.value) $("#bf-go").focus();
      else sel.engine.focus();
    });
    sel.engine.addEventListener("change", () => {
      $("#bf-go").disabled = !sel.engine.value;
      $("#bf-go").focus();
    });
    $("#panel-vehicle").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!sel.engine.value) return;
      renderVehicle(sel.make.value, sel.model.value, sel.engine.value);
      setUrl({ make: sel.make.value, model: sel.model.value, engine: sel.engine.value });
      focusResults();
    });
    $("#bf-popular").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-v]");
      if (!b) return;
      const [make, model, engine] = JSON.parse(b.dataset.v);
      setVehicle(make, model, engine);
      $("#panel-vehicle").requestSubmit();
    });
    out.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add-cart]");
      if (add && window.AlaskaCart) {
        const p = CATALOG.find((b) => String(b.id) === add.dataset.addCart);
        if (p) {
          const ok = window.AlaskaCart.add({ id: p.id, model: p.model, image: p.image, qty: Number(add.dataset.qty) || 1, note: add.dataset.note });
          if (ok && window.alaskaToast) window.alaskaToast(`${p.model} added to your cart`, { href: "#cart", label: "View cart" });
        }
        return;
      }
      const a = e.target.closest("[data-action]");
      if (!a) return;
      if (a.dataset.action === "share") {
        const url = window.location.href;
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
          .then(() => toast("Link copied"))
          .catch(() => window.prompt("Copy this link:", url));
      }
      if (a.dataset.action === "new") {
        out.innerHTML = "";
        setUrl({});
        fillMakes();
        fillModels();
        window.scrollTo({ top: $(".bf-finder").getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
        sel.make.focus({ preventScroll: true });
      }
    });
  }

  // ------------------------------------------------------------ init
  function init() {
    fillMakes();
    fillModels();
    $("#bf-popular").innerHTML = POPULAR.filter(([mk, md, en]) => F.findEngine(VEHICLES, mk, md, en))
      .map((v) => `<button type="button" data-v='${esc(JSON.stringify(v))}'>${esc(v[1])}${v[0] === "Toyota" && v[1] === "Hilux" ? " Diesel" : ""}</button>`)
      .join("");
    bind();

    // Restore a shared search from the URL
    const q = new URLSearchParams(window.location.search);
    if (q.get("make") && q.get("model")) {
      const make = q.get("make");
      const model = q.get("model");
      const engs = F.engines(VEHICLES, make, model);
      const engine = q.get("engine") || (engs.length === 1 ? engs[0].label : "");
      if (engs.length) {
        setVehicle(make, model, engine);
        if (sel.engine.value) renderVehicle(make, model, sel.engine.value);
      }
    }
    if (!CATALOG.length) console.warn("Battery finder: product catalog (js/data.js) not loaded.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
