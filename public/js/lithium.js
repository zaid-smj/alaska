/*
 * Alaska Batteries — Lithium-Ion (Life Series) page.
 * Renders js/lithium-data.js: filterable model cards, full specification dialog,
 * side-by-side comparison (up to 3 models) and "Add to Cart".
 */
(function () {
  "use strict";
  if (typeof lithiumData === "undefined") return;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmtWh = (wh) => (wh >= 1000 ? `${(wh / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} kWh` : `${wh} Wh`);
  const selected = new Set();
  const grid = $("#li-grid");

  function card(m) {
    const on = selected.has(m.id);
    return `<article class="sc-card li-card" data-id="${esc(m.id)}">
      <button type="button" class="li-media" data-open="${esc(m.id)}" aria-label="View ${esc(m.title)} specifications">
        <img src="${esc(m.image)}" alt="Alaska ${esc(m.code)} ${esc(m.title)} lithium battery" loading="lazy">
      </button>
      <div class="li-body">
        <p class="li-code">${esc(m.code)}</p>
        <h4>${esc(m.title)}</h4>
        <p class="li-group">${esc(m.group)}${m.installation ? " · " + esc(m.installation) : ""}</p>
        <dl class="li-keys">
          <div><dt>Voltage</dt><dd>${m.nominalVoltageV} V</dd></div>
          <div><dt>Capacity</dt><dd>${m.capacityAh} Ah</dd></div>
          <div><dt>Energy</dt><dd>${fmtWh(m.energyWh)}</dd></div>
          <div><dt>Cycle life</dt><dd>${esc(m.compare.cycleLife)}</dd></div>
        </dl>
        <div class="li-actions">
          <button type="button" class="sc-btn sm" data-open="${esc(m.id)}">Specifications</button>
          <button type="button" class="sc-btn ghost sm" data-quote="${esc(m.id)}"><i class="fa-solid fa-cart-plus" aria-hidden="true"></i>Add to Cart</button>
          <label class="sc-check li-cmp"><input type="checkbox" data-cmp="${esc(m.id)}" ${on ? "checked" : ""}> Compare</label>
        </div>
      </div>
    </article>`;
  }

  function render() {
    const f = ($('input[name="lif"]:checked') || {}).value || "all";
    const list = lithiumData.filter((m) => f === "all" || m.group === f);
    grid.innerHTML = list.map(card).join("");
  }

  function openModal(id) {
    const m = lithiumData.find((x) => x.id === id);
    if (!m) return;
    $("#li-modal-code").textContent = m.code;
    $("#li-modal-title").textContent = m.title;
    $("#li-modal-body").innerHTML = `
      <div class="li-modal-grid">
        <div><img src="${esc(m.image)}" alt="" class="li-modal-img"></div>
        <div>
          <p class="prose" style="margin:0 0 12px">${esc(m.description)}</p>
          <h5 class="sc-label">Product features</h5>
          <ul class="ticks">${m.features.map((x) => `<li><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>${esc(x)}</span></li>`).join("")}</ul>
        </div>
      </div>
      <h5 class="sc-label" style="margin-top:18px">Technical specifications — ${esc(m.model)}</h5>
      <div class="sc-table-wrap"><table class="sc-table" style="min-width:0"><caption class="sr-only">Technical specifications</caption><tbody>
        ${m.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}
      </tbody></table></div>
      <div class="sc-actions" style="margin-top:16px">
        <button type="button" class="sc-btn" data-quote="${esc(m.id)}"><i class="fa-solid fa-cart-plus" aria-hidden="true"></i>Add to Cart</button>
        <a class="sc-btn ghost" href="/assets/docs/alaska-lithium-life-series-brochure.pdf" target="_blank" rel="noopener"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i>Brochure</a>
        <a class="sc-btn plain" href="/warranty.html#lithium">Warranty terms</a>
      </div>`;
    lastFocus = document.activeElement;
    $("#li-modal").hidden = false;
    document.body.style.overflow = "hidden";
    $("#li-modal .sc-close").focus();
  }
  let lastFocus = null;
  function closeModal() {
    $("#li-modal").hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  function renderCompare() {
    const bar = $("#li-comparebar");
    bar.hidden = selected.size === 0;
    $("#li-compare-count").textContent = `${selected.size} of 3 selected`;
    $("#li-compare-btn").disabled = selected.size < 2;
  }
  function showCompare() {
    const ms = lithiumData.filter((m) => selected.has(m.id));
    const rows = [
      ["Model", (m) => esc(m.model)],
      ["Type", (m) => esc(m.group) + (m.installation ? " · " + esc(m.installation) : "")],
      ["Nominal voltage", (m) => `${m.nominalVoltageV} V`],
      ["Capacity", (m) => `${m.capacityAh} Ah`],
      ["Energy", (m) => fmtWh(m.energyWh)],
      ["Cycle life (as rated)", (m) => esc(m.compare.cycleLife)],
      ["Max. continuous current", (m) => esc(m.compare.maxCurrent)],
      ["Max. in parallel", (m) => esc(m.compare.parallel)],
      ["Communication", (m) => esc(m.compare.comms)],
      ["IP rating", (m) => esc(m.compare.ip)],
      ["Weight", (m) => esc(m.compare.weight)],
    ];
    const box = $("#li-compare");
    box.hidden = false;
    box.innerHTML = `<h3>Comparison</h3><p class="sc-help" style="margin:0 0 10px">Cycle life is rated under different test conditions per model — see each model's full specifications.</p>
      <div class="sc-card sc-table-wrap"><table class="sc-table"><caption class="sr-only">Lithium models compared</caption>
      <thead><tr><th scope="col"></th>${ms.map((m) => `<th scope="col">${esc(m.code)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(([k, f]) => `<tr><th scope="row">${k}</th>${ms.map((m) => `<td>${f(m)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) return openModal(o.dataset.open);
    const q = e.target.closest("[data-quote]");
    if (q && window.AlaskaCart) {
      const m = lithiumData.find((x) => x.id === q.dataset.quote);
      const ok = window.AlaskaCart.add({ id: m.id, model: `${m.code} (${m.title})`, image: m.image });
      if (ok && window.alaskaToast) window.alaskaToast(`${m.code} added to your cart`, { href: "#cart", label: "View cart" });
      return;
    }
    if (e.target.closest("#li-modal [data-close]") || e.target.id === "li-modal") return closeModal();
    if (e.target.closest("#li-compare-btn")) return showCompare();
    if (e.target.closest("#li-compare-clear")) {
      selected.clear();
      $("#li-compare").hidden = true;
      render();
      renderCompare();
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches('input[name="lif"]')) return render();
    const c = e.target.closest("[data-cmp]");
    if (!c) return;
    if (c.checked) {
      if (selected.size >= 3) {
        c.checked = false;
        if (window.alaskaToast) window.alaskaToast("You can compare up to 3 models");
        return;
      }
      selected.add(c.dataset.cmp);
    } else selected.delete(c.dataset.cmp);
    renderCompare();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#li-modal").hidden) closeModal();
  });

  $("#li-apps-list").innerHTML = (typeof lithiumApplications !== "undefined" ? lithiumApplications : []).map((a) => `<span class="li-app">${esc(a)}</span>`).join("");
  render();
  renderCompare();
})();
