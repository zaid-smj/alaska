/*
 * Alaska Batteries — feature graph on graphite.html and CaAg.html (page data: js/casilver-data.js).
 * One graph serves all five tabs. Changing tab morphs the two curves into
 * the new shape while the labels and the text beside it change. The tabs
 * advance on their own every 5 seconds (paused while the visitor hovers or
 * focuses the section, while it is off screen, and for reduced motion).
 * Tab selection itself is selectFeatureTab() in main.js, which calls
 * window.showGraphiteDiagram(index).
 */
(function () {
  "use strict";
  const fig = document.getElementById("gt-graph");
  if (!fig) return;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel) => fig.querySelector(sel);
  const svgNS = "http://www.w3.org/2000/svg";

  // Each curve: start point + three cubic segments = 20 numbers, so any curve can morph into any other.
  // Values are illustrative: in every graph graphite is shown about 30% better than conventional.
  // (y = 350 is zero on the axis, y = 90 is the top of the scale)
  const G = window.FEATURE_GRAPHS || [
    {
      // Composition: plate degradation over repeated cycles (graphite ends ~30% lower)
      y: "Plate degradation",
      x: "Charge-discharge cycles",
      std: [30, 335, 120, 330, 200, 290, 260, 240, 320, 190, 420, 140, 580, 121],
      gx: [30, 335, 120, 333, 200, 305, 260, 280, 320, 255, 420, 215, 580, 189],
      aria: "Graph: plate degradation rises with charge-discharge cycles for both batteries; graphite lead-acid ends about 30% lower",
    },
    {
      // Efficiency: energy lost as heat under the same load (graphite ~30% less)
      y: "",
      x: "Energy lost as heat under the same load",
      bars: [
        { label: "Conventional Lead-Acid", len: 1, inner: "Energy lost as heat" },
        { label: "Graphite Lead-Acid", len: 0.7, inner: "Energy lost as heat" },
      ],
      aria: "Chart: under the same load graphite lead-acid loses about 30% less energy as heat than conventional lead-acid",
    },
    {
      // Longevity: battery life; graphite reaches end of life ~30% later
      y: "Battery health",
      x: "Years of use",
      std: [30, 90, 150, 92, 300, 130, 438, 220, 480, 248, 530, 280, 580, 300],
      gx: [30, 90, 200, 92, 400, 130, 560, 220, 567, 224, 574, 228, 580, 232],
      limit: [220, "End of life", 206, 30, "start"],
      dots: [[438, 220], [560, 220]],
      aria: "Graph: battery health declines with years of use; graphite lead-acid reaches end of life about 30% later than conventional lead-acid",
    },
    {
      // Recovery: both fall into deep discharge, graphite recovers faster and ~30% higher
      y: "Usable capacity",
      x: "Time",
      std: [30, 95, 110, 95, 150, 330, 200, 340, 260, 345, 330, 260, 420, 205, 480, 175, 530, 168, 580, 168],
      gx: [30, 95, 110, 95, 150, 330, 200, 340, 230, 345, 250, 130, 320, 115, 380, 108, 480, 113, 580, 113],
      deep: true,
      extra: ["Deep discharge", 205, 376],
      aria: "Graph: both batteries fall into a deep discharge; on recharge graphite lead-acid recovers faster and to about 30% more capacity",
    },
    {
      // Charge: graphite reaches full charge ~30% sooner
      y: "State of charge",
      x: "Charging time",
      std: [30, 340, 180, 280, 380, 120, 550, 90, 560, 90, 570, 90, 580, 90],
      gx: [30, 340, 150, 250, 290, 110, 394, 90, 456, 90, 518, 90, 580, 90],
      limit: [90, "Full", 78],
      dots: [[550, 90], [394, 90]],
      aria: "Graph: on the same charger graphite lead-acid reaches full charge about 30% sooner than conventional lead-acid",
    },
  ];
  // curves written with two segments get their last segment split in half (de Casteljau),
  // so every curve has a start point and three segments: 20 numbers that morph into each other
  const splitLast = (c) => {
    const p0 = [c[6], c[7]], p1 = [c[8], c[9]], p2 = [c[10], c[11]], p3 = [c[12], c[13]];
    const m = (u, v) => [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2];
    const q = m(p0, p1), r = m(p1, p2), t = m(p2, p3), d = m(q, r), e = m(r, t), f = m(d, e);
    return c.slice(0, 8).concat([q[0], q[1], d[0], d[1], f[0], f[1], e[0], e[1], t[0], t[1], p3[0], p3[1]]);
  };
  G.forEach((g) => {
    if (g.std && g.std.length === 14) g.std = splitLast(g.std);
    if (g.gx && g.gx.length === 14) g.gx = splitLast(g.gx);
  });

  const path = (c) => `M${c[0]} ${c[1]} C${c[2]} ${c[3]} ${c[4]} ${c[5]} ${c[6]} ${c[7]} C${c[8]} ${c[9]} ${c[10]} ${c[11]} ${c[12]} ${c[13]} C${c[14]} ${c[15]} ${c[16]} ${c[17]} ${c[18]} ${c[19]}`;
  // area between the two curves: along one, back along the other (a reversed cubic keeps its points in reverse order)
  const area = (a, b) => {
    const r = [];
    for (let i = 18; i >= 0; i -= 2) r.push(b[i], b[i + 1]);
    return path(a) + ` L${r[0]} ${r[1]} C${r[2]} ${r[3]} ${r[4]} ${r[5]} ${r[6]} ${r[7]} C${r[8]} ${r[9]} ${r[10]} ${r[11]} ${r[12]} ${r[13]} C${r[14]} ${r[15]} ${r[16]} ${r[17]} ${r[18]} ${r[19]} Z`;
  };

  const cStd = $(".c-std"), cGx = $(".c-gx"), cArea = $(".area"), limit = $(".limit");
  let cur = { std: G[0].std.slice(), gx: G[0].gx.slice(), lim: 270 };
  const paint = () => {
    cStd.setAttribute("d", path(cur.std));
    cGx.setAttribute("d", path(cur.gx));
    cArea.setAttribute("d", area(cur.std, cur.gx));
    limit.setAttribute("y1", cur.lim);
    limit.setAttribute("y2", cur.lim);
  };

  // ---- Bar charts: a graph with `bars` shows two horizontal bars instead of lines.
  // bars: [conventional row, Alaska row], each { label, len (0–1 of the axis), inner, off }
  // `off` labels the striped remainder of a bar (e.g. "Do not drain").
  const svg = fig.querySelector("svg");
  let barG = svg.querySelector(".bars");
  if (barG) barG.remove(); // older static markup: replaced by the generated one
  barG = document.createElementNS(svgNS, "g");
  barG.setAttribute("class", "bars");
  svg.insertBefore(barG, svg.querySelector(".axis"));
  if (!svg.querySelector("#gt-hatch")) {
    const defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS(svgNS, "defs"), svg.firstChild);
    defs.innerHTML = '<pattern id="gt-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" class="hatch-line" /></pattern>';
  }
  const BAR_ROWS = [128, 248], BAR_H = 60, X0 = 30, XW = 550;
  const mk = (tag, attrs, text) => {
    const n = document.createElementNS(svgNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    barG.appendChild(n);
    return n;
  };
  const drawBars = (rows) => {
    barG.textContent = "";
    rows.forEach((r, i) => {
      const y = BAR_ROWS[i], w = XW * r.len, cls = i ? "gx" : "std";
      mk("text", { class: "d-label bar-lbl" + (i ? " d-label-red" : ""), x: X0, y: y - 10 }, r.label);
      mk("rect", { class: "bar bar-" + cls, x: X0, y, width: w, height: BAR_H, rx: 4 });
      if (r.off !== undefined) {
        mk("rect", { class: "bar bar-off", x: X0 + w, y, width: XW - w, height: BAR_H, rx: 4 });
        if (r.off) mk("text", { class: "bar-warn", x: X0 + w + (XW - w) / 2, y: y + 37, "text-anchor": "middle" }, r.off);
      }
      if (r.inner) mk("text", { class: "bar-in", x: X0 + 14, y: y + 37 }, r.inner);
    });
  };
  // lines flatten into the middle of each bar before the bars appear
  G.forEach((g) => {
    if (!g.bars || g.std) return;
    const flat = (len, y) => {
      const e = X0 + XW * len, out = [];
      for (let i = 0; i < 10; i++) out.push(X0 + ((e - X0) * i) / 9, y);
      return out;
    };
    g.std = flat(g.bars[0].len, BAR_ROWS[0] + BAR_H / 2);
    g.gx = flat(g.bars[1].len, BAR_ROWS[1] + BAR_H / 2);
  });

  // the key above the graph can be renamed per graph (e.g. a different comparison on one tab)
  const keyStd = fig.querySelector(".k-std"), keyGx = fig.querySelector(".k-gx");
  const keyDefaults = [keyStd && keyStd.textContent, keyGx && keyGx.textContent];
  const setLabels = (g) => {
    if (keyStd) keyStd.textContent = g.keyStd || keyDefaults[0];
    if (keyGx) keyGx.textContent = g.keyGx || keyDefaults[1];
    $(".y-lbl").textContent = g.y;
    $(".x-lbl").textContent = g.x;
    $(".x-lbl").setAttribute("y", g.ticks ? 412 : 400); // make room for tick labels
    const ex = $(".l-extra");
    ex.textContent = g.extra ? g.extra[0] : "";
    if (g.extra) {
      ex.setAttribute("x", g.extra[1]);
      ex.setAttribute("y", g.extra[2]);
    }
    const ll = $(".l-limit");
    ll.textContent = g.limit ? g.limit[1] : "";
    if (g.limit) {
      ll.setAttribute("y", g.limit[2]);
      ll.setAttribute("x", g.limit[3] || 580);
      ll.setAttribute("text-anchor", g.limit[4] || "end");
    }
    const ticks = $(".ticks");
    ticks.textContent = "";
    (g.ticks || []).forEach(([t, x]) => {
      const n = document.createElementNS(svgNS, "text");
      n.setAttribute("class", "d-note");
      n.setAttribute("x", x);
      n.setAttribute("y", 376);
      n.setAttribute("text-anchor", "middle");
      n.textContent = t;
      ticks.appendChild(n);
    });
    fig.classList.toggle("has-area", !!g.area);
    fig.classList.toggle("has-deep", !!g.deep);
    fig.classList.toggle("has-limit", !!g.limit);
    fig.classList.toggle("has-dots", !!g.dots);
    if (g.bars) drawBars(g.bars);
    fig.classList.toggle("has-bars", !!g.bars);
    if (g.dots) {
      ["std", "gx"].forEach((k, i) => {
        $(".dot-" + k).setAttribute("cx", g.dots[i][0]);
        $(".dot-" + k).setAttribute("cy", g.dots[i][1]);
      });
    }
    fig.setAttribute("aria-label", g.aria);
  };

  let shown = -1, raf = 0;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  window.showGraphiteDiagram = function (index) {
    const g = G[index];
    if (!g || index === shown) return;
    const first = shown === -1;
    shown = index;
    const to = { std: g.std, gx: g.gx, lim: g.limit ? g.limit[0] : cur.lim };
    if (first || reduce) {
      cur = { std: to.std.slice(), gx: to.gx.slice(), lim: to.lim };
      paint();
      setLabels(g);
      if (first && !reduce) {
        fig.classList.remove("drawn");
        void fig.getBoundingClientRect();
        fig.classList.add("drawn"); // curves draw in once, on first view
      }
      return;
    }
    // labels fade out, curves morph, new labels fade in
    fig.classList.add("swap");
    setTimeout(() => {
      setLabels(g);
      fig.classList.remove("swap");
    }, 450);
    const from = { std: cur.std.slice(), gx: cur.gx.slice(), lim: cur.lim };
    const t0 = performance.now(), dur = 900;
    cancelAnimationFrame(raf);
    const step = (t) => {
      const k = ease(Math.min(1, (t - t0) / dur));
      cur.std = from.std.map((v, i) => v + (to.std[i] - v) * k);
      cur.gx = from.gx.map((v, i) => v + (to.gx[i] - v) * k);
      cur.lim = from.lim + (to.lim - from.lim) * k;
      paint();
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  // ---- Auto-advance every 10 s
  if (reduce || typeof window.selectFeatureTab !== "function") return;
  const section = document.querySelector(".graphite-features");
  let timer = 0, visible = false, held = false;
  const restart = () => {
    clearTimeout(timer);
    if (visible && !held) timer = setTimeout(() => window.selectFeatureTab((shown + 1) % G.length, false), 5000);
  };
  // every tab change (manual or automatic) restarts the 10 s count
  const original = window.selectFeatureTab;
  window.selectFeatureTab = function (i, s) {
    original(i, s);
    restart();
  };
  if (section) {
    section.addEventListener("mouseenter", () => { held = true; clearTimeout(timer); });
    section.addEventListener("mouseleave", () => { held = false; restart(); });
    section.addEventListener("focusin", () => { held = true; clearTimeout(timer); });
    section.addEventListener("focusout", () => { held = false; restart(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => es.forEach((e) => { visible = e.isIntersecting; restart(); }), { threshold: 0.4 }).observe(section);
    } else {
      visible = true;
      restart();
    }
  }
})();
