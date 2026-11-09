const brandRed = "#c00d1e";

/* =====================================================================
   Main navigation — single source of truth for the desktop mega menus
   and the mobile drawer. Edit NAV to change menu items.
   Styles: css/nav.css
   ===================================================================== */
const NAV = [
  {
    id: "solutions",
    label: "Solutions",
    links: [
      { label: "Battery Finder", href: "/battery-finder.html", icon: "fa-car", desc: "Pick your vehicle and engine to see the battery that fits." },
      { label: "Solar Calculator", href: "/solar-calculator.html", icon: "fa-solar-panel", desc: "Decide and build your Alaska solar solution today." },
      { label: "Lead-Acid Batteries", href: "/lead-acid", icon: "fa-car-battery", desc: "The only Calcium Silver and Graphite Enhanced batteries in Pakistan." },
      { label: "LiFePO4 Batteries", href: "/solutions/lithium-ion", icon: "fa-battery-full", desc: "LiFePO4 Life Series for solar, ESS and drop-in use." },
      { label: "Inverters", href: "/solutions/inverters", icon: "fa-bolt", desc: "Hybrid and off-grid inverters for solar and more." },
    ],
    feature: { kicker: "Battery Finder", title: "Not sure which battery your car needs?", cta: "Find my battery", href: "/battery-finder.html", image: "/assets/solutions/automotive.webp" },
  },
  {
    id: "technology",
    label: "Technology",
    // Logo buttons: each technology is shown by its own logo (light + dark versions)
    logos: [
      { label: "Graphite Lead-Acid Battery", footerLabel: "Graphite Enhanced", href: "/graphite.html", light: "/assets/technology/tech.png", dark: "/assets/tech-inv.png" },
      { label: "Calcium Silver", href: "/CaAg.html", light: "/assets/calcium_silver_logo.png", dark: "/assets/calcium_silver_logo-inv.png" },
      { label: "LiFePO4 Lithium Battery", footerLabel: "LiFePO4", href: "/lifepo4.html", light: "/assets/brand/lifepo4-logo.png", dark: "/assets/brand/lifepo4-logo-inv.png" },
    ],
    feature: { kicker: "Technology", title: "Graphite lead-acid: the science inside every Alaska battery", cta: "Explore graphite", href: "/graphite.html", image: "/assets/technology/tech-1.webp" },
  },
  {
    id: "partners",
    label: "Partners",
    links: [
      { label: "Find a Partner", href: "/dealers.html", icon: "fa-location-dot", desc: "Find the nearest authorized Alaska dealer." },
      { label: "Become a Partner", href: "/become-dealer.html", icon: "fa-handshake", desc: "Apply to sell Alaska batteries in your area." },
    ],
    feature: { kicker: "Partner Locator", title: "Find an Alaska dealer near you", cta: "Open the map", href: "/dealers.html", image: "/assets/Dealer-locator-banner.webp" },
  },
  {
    id: "warranty",
    label: "Warranty",
    links: [
      { label: "Warranty", href: "/warranty.html", icon: "fa-shield-halved", desc: "Policy, terms and registration for your warranties." },
      { label: "Claim", href: "/warranty-claim.html", icon: "fa-file-signature", desc: "How to file a claim on your warranty." },
    ],
    feature: { kicker: "Warranty", title: "Free replacement against manufacturing defects", cta: "See warranty terms", href: "/warranty.html", image: "/assets/support2.webp" },
  },
  {
    id: "info",
    label: "Info",
    links: [
      { label: "News", href: "/news.html", icon: "fa-newspaper", desc: "News, stories and battery advice from Alaska Batteries." },
      { label: "FAQs", href: "/faqs.html", icon: "fa-circle-question", desc: "Guides, tips and quick answers to common questions." },
      { label: "Gallery", href: "/vault.html", icon: "fa-images", desc: "Corporate events, our partners and awards." },
      { label: "Privacy Policy", href: "/privacy-policy.html", icon: "fa-user-shield", desc: "How we collect and use your information." },
    ],
    feature: { kicker: "News", title: "Stories and battery advice from Alaska", cta: "Read the news", href: "/news.html", image: "/assets/vault/news.webp" },
  },
  {
    id: "about",
    label: "About",
    links: [
      { label: "About Us", href: "/about.html", icon: "fa-building", desc: "Get to know the mind behind the fastest-growing company in Pakistan's energy sector." },
      { label: "Careers", href: "/careers.html", icon: "fa-briefcase", desc: "Join the fastest-growing company in Pakistan's energy sector." },
      { label: "Contact Us", href: "/support.html", icon: "fa-headset", desc: "Let us help you in whatever way we can." },
    ],
    feature: { kicker: "Our story", title: "Built on reliability, not promises", cta: "About Alaska", href: "/about.html", image: "/assets/mgmt.webp" },
  },
];

// CMS replacements are shared by desktop panels, mobile drawer and logo buttons.
const navImages = window.ALASKA_CONTENT?.navigationImages || {};
const navImage = (slot, fallback) => navImages[slot]?.url || fallback;
const navImageAlt = (slot, fallback = '') => navImages[slot]?.alt || fallback;
for (const item of NAV) {
  item.feature.image = navImage(item.id, item.feature.image);
  item.feature.imageAlt = navImageAlt(item.id);
}
NAV.find(item => item.id === 'technology').logos.forEach((logo, index) => {
  const key = ['graphite', 'calcium', 'lifepo4'][index];
  logo.light = navImage(`${key}-light`, logo.light);
  logo.dark = navImage(`${key}-dark`, logo.dark);
  logo.lightAlt = navImageAlt(`${key}-light`);
  logo.darkAlt = navImageAlt(`${key}-dark`);
});

/* =====================================================================
   Site-wide light / dark theme. One setting for the whole site, stored in
   this browser and chosen with the switch in the footer. The inline script
   in each page's <head> applies it before first paint; css/theme.css holds
   the dark palette. Values: "light" (default), "dark", "system".
   ===================================================================== */
const AlaskaTheme = (function () {
  const KEY = "alaska-theme";
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  let memory = null;
  let animTimer = null;

  function pref() {
    let v = memory;
    try {
      v = localStorage.getItem(KEY) || memory;
    } catch (e) {}
    return v === "dark" || v === "system" ? v : "light";
  }
  function resolved(p) {
    return p === "system" ? (mq && mq.matches ? "dark" : "light") : p;
  }
  function sync() {
    const p = pref();
    const dark = resolved(p) === "dark";
    document.querySelectorAll("[data-theme-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeSet === p)));
    // Day / night slider: shows the theme currently in use (also while "Auto" is on)
    document.querySelectorAll("[data-theme-toggle]").forEach((t) => {
      t.setAttribute("aria-checked", String(dark));
      t.classList.toggle("is-auto", p === "system");
    });
  }
  function apply(animate) {
    const p = pref();
    if (animate) {
      root.classList.add("theme-anim");
      clearTimeout(animTimer);
      animTimer = setTimeout(() => root.classList.remove("theme-anim"), 350);
    }
    root.setAttribute("data-theme", resolved(p));
    root.setAttribute("data-theme-pref", p);
    sync();
    document.dispatchEvent(new CustomEvent("alaska:theme", { detail: { theme: resolved(p), preference: p } }));
  }
  function set(p) {
    memory = p;
    try {
      localStorage.setItem(KEY, p);
    } catch (e) {}
    apply(true);
  }
  if (mq) {
    const onChange = () => pref() === "system" && apply(true);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) apply(true);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest) return;
    const b = e.target.closest("[data-theme-set]");
    if (b) {
      e.preventDefault();
      return set(b.dataset.themeSet);
    }
    // slider flips between day and night (and leaves "Auto")
    if (e.target.closest("[data-theme-toggle]")) set(resolved(pref()) === "dark" ? "light" : "dark");
  });
  // "Auto" is text, not a <button>, so give it the keyboard behaviour of one
  document.addEventListener("keydown", (e) => {
    const t = e.target.closest && e.target.closest("span[data-theme-set]");
    if (t && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      set(t.dataset.themeSet);
    }
  });
  apply(false);
  return { get: pref, current: () => resolved(pref()), set, sync };
})();
window.AlaskaTheme = AlaskaTheme;

const NAV_CART = { label: "Your Cart", href: "/checkout.html" }; // the Cart button opens the cart panel; this is the no-JS fallback
const NAV_QUOTE = { label: "Request a Quote", href: "/quote.html" };

// Absolute URL for images passed to CSS through a custom property (a relative url()
// there would be resolved against the stylesheet's folder, not the page).
function navAbs(p) {
  try {
    return new URL(p, document.baseURI).href;
  } catch (e) {
    return p;
  }
}

function navEsc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function navLinkHTML(l) {
  return `<li><a class="anav-link" href="${navEsc(l.href)}">
      <span class="ic"><i class="fa-solid ${navEsc(l.icon)}" aria-hidden="true"></i></span>
      <span><span class="t">${navEsc(l.label)}</span>${l.desc ? `<span class="d">${navEsc(l.desc)}</span>` : ""}</span>
    </a></li>`;
}

function navLogoHTML(l) {
  return `<li><a class="anav-link anav-logo-btn" href="${navEsc(l.href)}" aria-label="${navEsc(l.label)}">
      <img class="theme-light-only" src="${navEsc(l.light)}" alt="${navEsc(l.lightAlt)}" loading="lazy" />
      <img class="theme-dark-only" src="${navEsc(l.dark)}" alt="${navEsc(l.darkAlt)}" loading="lazy" />
    </a></li>`;
}

// Every top-level item opens the same full-width panel: links (or logo buttons) + a feature card.
function navPanelHTML(item) {
  const f = item.feature;
  const body = item.logos
    ? `<ul class="anav-links anav-logos">${item.logos.map(navLogoHTML).join("")}</ul>`
    : `<ul class="anav-links">${item.links.map(navLinkHTML).join("")}</ul>`;
  return `<div class="anav-panel" id="anav-panel-${item.id}" aria-label="${navEsc(item.label)}">
    <div class="anav-mega">
      <div class="anav-groups">${body}</div>
      <a class="anav-feature" href="${navEsc(f.href)}" title="${navEsc(f.imageAlt)}" style="--feature-img:url('${navEsc(navAbs(f.image))}')">
        <span class="k">${navEsc(f.kicker)}</span>
        <span class="anav-feature-bottom"><strong>${navEsc(f.title)}</strong><span class="go">${navEsc(f.cta)}</span></span>
      </a>
    </div>
  </div>`;
}

const headerHTML = /* HTML */ `
  <header class="anav" id="anav">
    <div class="anav-inner">
      <a class="anav-logo" href="/index.html" aria-label="Alaska Batteries — home">
        <img class="theme-light-only" src="${navEsc(navImage('brand-light', '/assets/brand/alaska-logo.png'))}" alt="${navEsc(navImageAlt('brand-light', 'Alaska Batteries'))}" width="142" height="58" />
        <img class="theme-dark-only" src="${navEsc(navImage('brand-dark', '/assets/brand/alaska-logo-inv.png'))}" alt="${navEsc(navImageAlt('brand-dark', 'Alaska Batteries'))}" width="142" height="58" />
      </a>

      <nav class="anav-primary" aria-label="Main">
        <ul class="anav-list">
          ${NAV.map(
            (item) => `<li class="anav-item is-mega" data-nav="${item.id}">
              <button type="button" class="anav-top" aria-expanded="false" aria-controls="anav-panel-${item.id}">
                ${navEsc(item.label)}
              </button>
              ${navPanelHTML(item)}
            </li>`
          ).join("")}
        </ul>
      </nav>

      <div class="anav-utils">
        <a class="anav-cart" href="${NAV_CART.href}" data-cart-link aria-label="${NAV_CART.label}">
          <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i><span class="lbl">Cart</span>
          <span class="anav-badge" data-cart-count hidden>0</span>
        </a>
        <span class="anav-sep" aria-hidden="true"></span>
        <a class="anav-cta" href="${NAV_QUOTE.href}" aria-label="${NAV_QUOTE.label}"><span class="anav-cta-long">Request a&nbsp;</span>Quote</a>
        <button type="button" class="anav-burger" id="anav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="anav-drawer"><span></span></button>
      </div>
    </div>
  </header>
  <div class="anav-scrim" id="anav-scrim" aria-hidden="true"></div>
  <div class="h-20"></div>
`;

function drawerHTML() {
  const logoImgs = `<img class="theme-light-only" src="${navEsc(navImage('brand-light', '/assets/brand/alaska-logo.png'))}" alt="${navEsc(navImageAlt('brand-light', 'Alaska Batteries'))}" width="117" height="48" /><img class="theme-dark-only" src="${navEsc(navImage('brand-dark', '/assets/brand/alaska-logo-inv.png'))}" alt="${navEsc(navImageAlt('brand-dark', 'Alaska Batteries'))}" width="117" height="48" />`;
  // Root view: Cart + Request a Quote on top, then the six sections
  const root = `<div class="anav-view is-root is-active" data-view="root">
      <div class="anav-drawer-actions">
        <a class="anav-cart" href="${NAV_CART.href}" data-cart-link><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i><span class="lbl">Cart</span><span class="anav-badge" data-cart-count hidden>0</span></a>
        <a class="anav-cta" href="${NAV_QUOTE.href}">${NAV_QUOTE.label}</a>
      </div>
      <ul class="anav-sections">
        ${NAV.map(
          (item) => `<li><button type="button" class="anav-section-btn" data-open-view="${item.id}" aria-controls="anav-view-${item.id}">
            <span>${navEsc(item.label)}</span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></li>`
        ).join("")}
      </ul>
    </div>`;
  // One side panel per section: links with descriptions, then the picture card
  const views = NAV.map((item) => {
    const f = item.feature;
    const links = item.logos
      ? `<ul class="anav-links anav-logos anav-m-logos">${item.logos.map(navLogoHTML).join("")}</ul>`
      : `<ul class="anav-m-links">${item.links.map(navLinkHTML).join("")}</ul>`;
    return `<div class="anav-view" data-view="${item.id}" id="anav-view-${item.id}" role="region" aria-label="${navEsc(item.label)}">
        <div class="anav-view-head">
          <h2>${navEsc(item.label)}</h2>
          <button type="button" class="anav-back" data-back><i class="fa-solid fa-chevron-left" aria-hidden="true"></i>Back</button>
        </div>
        ${links}
        <a class="anav-feature anav-m-feature" href="${navEsc(f.href)}" title="${navEsc(f.imageAlt)}" style="--feature-img:url('${navEsc(navAbs(f.image))}')">
          <span class="k">${navEsc(f.kicker)}</span>
          <span class="anav-feature-bottom"><strong>${navEsc(f.title)}</strong><span class="go">${navEsc(f.cta)}</span></span>
        </a>
      </div>`;
  }).join("");
  return `<div class="anav-drawer-backdrop" data-close-drawer></div>
    <div class="anav-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="anav-drawer-head">
        <a href="/index.html" aria-label="Alaska Batteries — home">${logoImgs}</a>
        <button type="button" class="anav-close" data-close-drawer aria-label="Close menu"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
      <nav class="anav-views" aria-label="Main">${root}${views}</nav>
    </div>`;
}

/* ---------------------------------------------------------------------
   Desktop behaviour: hover (mouse), click/tap (touch), keyboard.
   --------------------------------------------------------------------- */
function setupMainNav() {
  const header = document.getElementById("anav");
  if (!header) return;
  const scrim = document.getElementById("anav-scrim");
  const items = Array.from(header.querySelectorAll(".anav-item"));
  const tops = items.map((li) => li.querySelector(".anav-top"));
  let openItem = null;
  let closeTimer = null;
  let openTimer = null;
  let hoverOpenedAt = 0;

  function setOpen(li, open) {
    const btn = li.querySelector(".anav-top");
    li.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  }
  function open(li) {
    clearTimeout(closeTimer);
    if (openItem && openItem !== li) setOpen(openItem, false);
    setOpen(li, true);
    openItem = li;
    scrim.classList.toggle("is-on", li.classList.contains("is-mega"));
  }
  function close(li, returnFocus) {
    const target = li || openItem;
    if (!target) return;
    setOpen(target, false);
    if (openItem === target) openItem = null;
    scrim.classList.remove("is-on");
    if (returnFocus) target.querySelector(".anav-top").focus();
  }
  function closeAll() {
    items.forEach((li) => setOpen(li, false));
    openItem = null;
    scrim.classList.remove("is-on");
  }

  items.forEach((li, idx) => {
    const btn = tops[idx];
    const panel = li.querySelector(".anav-panel");

    // Hover (mouse / pen only)
    li.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch") return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      // short intent delay when nothing is open; instant switch between menus
      openTimer = setTimeout(
        () => {
          open(li);
          hoverOpenedAt = Date.now();
        },
        openItem ? 0 : 90
      );
    });
    li.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "touch") return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(() => close(li), 160);
    });

    // Click / tap / Enter / Space
    btn.addEventListener("click", () => {
      const isOpen = li.classList.contains("is-open");
      if (isOpen && Date.now() - hoverOpenedAt < 400) return; // hover just opened it
      if (isOpen) close(li);
      else open(li);
    });

    // Keyboard
    btn.addEventListener("keydown", (e) => {
      const links = Array.from(panel.querySelectorAll("a"));
      if (e.key === "ArrowDown") {
        e.preventDefault();
        open(li);
        if (links[0]) links[0].focus();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const next = tops[(idx + (e.key === "ArrowRight" ? 1 : -1) + tops.length) % tops.length];
        const wasOpen = !!openItem;
        closeAll();
        next.focus();
        if (wasOpen) open(next.closest(".anav-item"));
      } else if (e.key === "Escape") {
        close(li, true);
      }
    });
    panel.addEventListener("keydown", (e) => {
      const links = Array.from(panel.querySelectorAll("a"));
      const i = links.indexOf(document.activeElement);
      if (e.key === "Escape") {
        e.preventDefault();
        close(li, true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        links[(i + 1) % links.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (i <= 0) btn.focus();
        else links[i - 1].focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        links[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        links[links.length - 1].focus();
      }
    });
    // Close when focus leaves the item entirely
    li.addEventListener("focusout", (e) => {
      if (!li.contains(e.relatedTarget)) close(li);
    });
  });

  // Click outside, scrim, or navigating within the page closes menus
  document.addEventListener("pointerdown", (e) => {
    if (openItem && !header.contains(e.target)) closeAll();
  });
  scrim.addEventListener("pointerenter", () => {
    closeTimer = setTimeout(closeAll, 120);
  });
  header.addEventListener("click", (e) => {
    if (e.target.closest(".anav-panel a")) closeAll();
  });
  window.addEventListener("hashchange", closeAll);
  window.addEventListener("pageshow", closeAll);
  window.addEventListener("resize", () => {
    if (window.innerWidth < 1024) closeAll();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openItem) close(openItem, true);
  });

  // Subtle shadow once the page scrolls
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 4);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------------------
   Mobile drawer with accordion sections
   --------------------------------------------------------------------- */
function setupMobileMenu() {
  const burger = document.getElementById("anav-burger");
  if (!burger) return;
  const old = document.getElementById("anav-drawer");
  if (old) old.remove();

  const drawer = document.createElement("div");
  drawer.id = "anav-drawer";
  drawer.className = "anav-drawer";
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = drawerHTML();
  document.body.appendChild(drawer);
  const panel = drawer.querySelector(".anav-drawer-panel");
  let lastFocus = null;

  // Slide between the main list and a section's side panel
  function showView(id, moveFocus, fromBtn) {
    panel.querySelectorAll(".anav-view").forEach((v) => {
      const on = v.dataset.view === id;
      v.classList.toggle("is-active", on);
      v.classList.toggle("is-behind", v.dataset.view === "root" && id !== "root");
      v.toggleAttribute("inert", !on);
      v.setAttribute("aria-hidden", String(!on));
    });
    if (!moveFocus) return;
    const target = id === "root" ? panel.querySelector(`[data-open-view="${fromBtn}"]`) : panel.querySelector(`[data-view="${id}"] .anav-back`);
    // preventScroll: the panel is still sliding in, so a normal focus() would scroll the container sideways
    if (!target) return;
    setTimeout(() => target.focus({ preventScroll: true }), 60);
    // retry once the slide has finished, in case the browser ignored the first attempt
    setTimeout(() => {
      if (document.activeElement !== target) target.focus({ preventScroll: true });
    }, 360);
  }
  let openSection = null;
  function focusables() {
    return Array.from(panel.querySelectorAll("a[href], button:not([disabled])")).filter((el) => el.offsetParent !== null);
  }
  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("anav-locked");
    // always start on the main list
    showView("root", false);
    // Move focus into the drawer (retry once: some browsers ignore focus while the
    // element is still becoming visible)
    const closeBtn = panel.querySelector(".anav-close");
    requestAnimationFrame(() => {
      closeBtn.focus();
      setTimeout(() => {
        if (!panel.contains(document.activeElement)) closeBtn.focus();
      }, 120);
    });
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("anav-locked");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  burger.addEventListener("click", openDrawer);
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-drawer]")) return closeDrawer();
    const sec = e.target.closest("[data-open-view]");
    if (sec) {
      openSection = sec.dataset.openView;
      return showView(openSection, true);
    }
    if (e.target.closest("[data-back]")) return showView("root", true, openSection);
    if (e.target.closest("a")) {
      // same-page anchors (e.g. /warranty.html#lithium) don't reload, so close explicitly
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("anav-locked");
    }
  });
  drawer.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Escape steps back from a section first, then closes the menu
      if (openSection && panel.querySelector(`[data-view="${openSection}"]`).classList.contains("is-active")) return showView("root", true, openSection);
      return closeDrawer();
    }
    if (e.key === "Tab") {
      const f = focusables();
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && drawer.classList.contains("is-open")) closeDrawer();
  });
}

/* ---------------------------------------------------------------------
   Mark the current page (aria-current + highlighted top item)
   --------------------------------------------------------------------- */
function setActiveNavItem() {
  const page = window.location.pathname === "/" ? "/index.html" : window.location.pathname;
  const hash = window.location.hash;
  const matches = (href) => {
    const [p, h] = href.split("#");
    if (p === "/lead-acid" && page.startsWith("/products/")) return true;
    if (p !== page) return false;
    return !h || !hash || "#" + h === hash;
  };
  document.querySelectorAll(".anav-link, .afoot-group a").forEach((a) => {
    const hit = matches(a.getAttribute("href"));
    if (hit) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.querySelectorAll(".anav-item").forEach((li) => li.classList.toggle("is-current", !!li.querySelector('.anav-link[aria-current="page"]')));
  document.querySelectorAll("[data-open-view]").forEach((b) => {
    const v = document.querySelector(`.anav-view[data-view="${b.dataset.openView}"]`);
    b.classList.toggle("is-current", !!(v && v.querySelector('a[aria-current="page"]')));
  });
  document.querySelectorAll(".anav-cta").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href").split("#")[0] === page));
  document.querySelectorAll("[data-cart-link]").forEach((a) => (a.getAttribute("href").split("#")[0] === page ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
}

/* ---------------------------------------------------------------------
   Cart — for orders of up to CART_MAX units (fewer than 50). Larger, bulk
   orders go through Request a Quote (/quote.html), which is separate.
   Stored in this browser only (localStorage). Used by the cart panel,
   /checkout.html, the Battery Finder and the product pages.
   --------------------------------------------------------------------- */
const CART_MAX = 49;
const AlaskaCart = (function () {
  const KEY = "alaska-quote-cart-v1";
  let memory = [];
  function read() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return memory.slice();
    }
  }
  function write(list) {
    memory = list.slice();
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {}
    document.dispatchEvent(new CustomEvent("alaska:cart", { detail: { items: list.slice() } }));
  }
  const clampQty = (q) => Math.max(1, Math.min(CART_MAX, Math.round(Number(q) || 1)));
  // tell the visitor when the 49-unit limit stopped a change
  function limitNotice() {
    if (window.alaskaToast) window.alaskaToast(`The cart holds up to ${CART_MAX} units. For 50 or more, request a quote.`, { href: "/quote.html#quote-content", label: "Request a Quote" });
  }
  // units in the cart apart from one product
  const othersTotal = (list, id) => list.filter((i) => i.id !== String(id)).reduce((a, i) => a + (i.qty || 1), 0);
  return {
    max: CART_MAX,
    items: read,
    count() {
      return read().reduce((a, i) => a + (i.qty || 1), 0);
    },
    add(item) {
      if (!item || !item.id) return;
      const list = read();
      const room = CART_MAX - othersTotal(list, item.id);
      const found = list.find((i) => i.id === String(item.id));
      const wanted = (found ? found.qty : 0) + (Number(item.qty) || 1);
      if (room < 1 || (found && found.qty >= room)) {
        limitNotice();
        return false;
      }
      if (wanted > room) limitNotice();
      if (found) {
        found.qty = Math.min(room, clampQty(wanted));
        if (item.note && !String(found.note || "").includes(item.note)) found.note = [found.note, item.note].filter(Boolean).join(" · ");
      } else {
        list.push({ id: String(item.id), model: item.model, image: item.image || "", qty: Math.min(room, clampQty(item.qty || 1)), note: item.note || "" });
      }
      write(list);
      return wanted <= room;
    },
    setQty(id, qty) {
      const list = read();
      const f = list.find((i) => i.id === String(id));
      if (f) {
        const room = CART_MAX - othersTotal(list, id);
        const want = Math.max(1, Math.round(Number(qty) || 1));
        if (want > room) limitNotice();
        f.qty = Math.max(1, Math.min(room, want));
      }
      write(list);
    },
    remove(id) {
      write(read().filter((i) => i.id !== String(id)));
    },
    clear() {
      write([]);
    },
  };
})();
window.AlaskaCart = AlaskaCart;

function updateCartBadges() {
  const n = AlaskaCart.count();
  document.querySelectorAll("[data-cart-count]").forEach((b) => {
    b.textContent = n > 99 ? "99+" : String(n);
    b.hidden = n === 0;
  });
  document.querySelectorAll("[data-cart-link]").forEach((a) => a.setAttribute("aria-label", n ? `Your cart, ${n} item${n === 1 ? "" : "s"}` : "Your cart, empty"));
}
document.addEventListener("alaska:cart", updateCartBadges);
window.addEventListener("storage", (e) => {
  if (e.key === "alaska-quote-cart-v1") updateCartBadges();
});

/* Small confirmation toast used by "Add to Cart" buttons across the site */
window.alaskaToast = function (msg, link) {
  const old = document.getElementById("alaska-toast");
  if (old) old.remove();
  const t = document.createElement("div");
  t.id = "alaska-toast";
  t.setAttribute("role", "status");
  t.style.cssText =
    "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1200;background:#111827;color:#fff;padding:12px 16px;border-radius:12px;font:600 14px/1.4 Inter,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3);display:flex;gap:14px;align-items:center;max-width:calc(100% - 32px)";
  t.innerHTML = `<span>${navEsc(msg)}</span>${link ? `<a href="${navEsc(link.href)}" style="color:#c00d1e;font-weight:800;white-space:nowrap">${navEsc(link.label)}</a>` : ""}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
};

/* =====================================================================
   Banner buttons — single source of truth for the buttons inside every
   page banner (the banner itself only shows the heading). Edit here.
   The first button on a page is the red one. `download` marks a file.
   Styles: css/banner.css (.banner-actions)
   ===================================================================== */
const BANNER_DOCS = {
  leadAcid: { label: "Download Catalogue", href: "/assets/docs/alaska-lead-acid-catalogue.pdf", download: true },
  lithium: { label: "Download Catalogue", href: "/assets/docs/alaska-lithium-life-series-brochure.pdf", download: true },
  inverter: { label: "Download Catalogue", href: "/assets/docs/alaska-inverter-catalogue.pdf", download: true },
  profile: { label: "Download Company Profile", href: "/assets/docs/alaska-company-profile.pdf", download: true },
};
const bannerLink = (label, href) => ({ label, href });
const BANNER_BUTTONS = {
  // Products
  "/lead-acid": [BANNER_DOCS.leadAcid, bannerLink("Graphite Technology", "/graphite.html#tech-features"), bannerLink("Calcium Silver Technology", "/CaAg.html#tech-features"), bannerLink("Battery Finder", "/battery-finder.html#bf-root")],
  "/solutions/lithium-ion": [BANNER_DOCS.lithium, bannerLink("LiFePO4 Technology", "/lifepo4.html#tech-features"), bannerLink("Solar Calculator", "/solar-calculator.html#solar-calculator")],
  "/solutions/inverters": [BANNER_DOCS.inverter, bannerLink("Solar Calculator", "/solar-calculator.html#solar-calculator")],
  // Tools
  "/battery-finder.html": [bannerLink("Lead-Acid Batteries", "/lead-acid"), bannerLink("FAQs", "/faqs.html#faq-list")],
  "/solar-calculator.html": [bannerLink("Inverters", "/solutions/inverters"), bannerLink("LiFePO4 Batteries", "/solutions/lithium-ion"), bannerLink("Lead-Acid Batteries", "/lead-acid")],
  // Technology
  "/graphite.html": [bannerLink("Lead-Acid Batteries", "/lead-acid"), bannerLink("About Us", "/about.html#storyVideo")],
  "/CaAg.html": [bannerLink("Lead-Acid Batteries", "/lead-acid"), bannerLink("About Us", "/about.html#storyVideo")],
  "/lifepo4.html": [bannerLink("LiFePO4 Batteries", "/solutions/lithium-ion"), bannerLink("About Us", "/about.html#storyVideo")],
  // Partners
  "/dealers.html": [bannerLink("Become a Partner", "/become-dealer.html#partner-content"), bannerLink("Contact Us", "/support.html#support-content")],
  "/become-dealer.html": [bannerLink("Find a Partner", "/dealers.html#partner-finder"), bannerLink("Contact Us", "/support.html#support-content")],
  // Warranty
  "/warranty.html": [bannerLink("File a Claim", "/warranty-claim.html#claim-content"), bannerLink("Contact Us", "/support.html#support-content")],
  "/warranty-claim.html": [bannerLink("Warranty Terms", "/warranty.html#terms"), bannerLink("Contact Us", "/support.html#support-content")],
  // Info
  "/news.html": [bannerLink("About Us", "/about.html#storyVideo"), bannerLink("Contact Us", "/support.html#support-content")],
  "/faqs.html": [bannerLink("About Us", "/about.html#storyVideo"), bannerLink("Contact Us", "/support.html#support-content")],
  "/vault.html": [bannerLink("About Us", "/about.html#storyVideo"), bannerLink("Contact Us", "/support.html#support-content")],
  "/privacy-policy.html": [bannerLink("About Us", "/about.html#storyVideo"), bannerLink("Contact Us", "/support.html#support-content")],
  // About
  "/about.html": [BANNER_DOCS.profile, bannerLink("Contact Us", "/support.html#support-content")],
  "/careers.html": [bannerLink("About Us", "/about.html#storyVideo"), bannerLink("Become a Partner", "/become-dealer.html#partner-content"), bannerLink("Contact Us", "/support.html#support-content")],
  "/support.html": [bannerLink("Find a Partner", "/dealers.html#partner-finder"), bannerLink("Become a Partner", "/become-dealer.html#partner-content"), bannerLink("Careers", "/careers.html#careers-content")],
  // Cart flow
  "/quote.html": [bannerLink("Battery Finder", "/battery-finder.html#bf-root"), bannerLink("Solar Calculator", "/solar-calculator.html#solar-calculator"), bannerLink("Find a Partner", "/dealers.html#partner-finder")],
  "/checkout.html": [bannerLink("Request a Quote", "/quote.html#quote-content"), bannerLink("Battery Finder", "/battery-finder.html#bf-root"), bannerLink("Solar Calculator", "/solar-calculator.html#solar-calculator")],
};

function renderBannerButtons() {
  const page = document.body.dataset.bannerPage || (window.location.pathname === "/" ? "/index.html" : window.location.pathname);
  const btns = BANNER_BUTTONS[page];
  const box = document.querySelector(".page-banner #hero-text-box, .page-banner .sc-hero-box");
  if (!btns || !box || box.querySelector(".banner-actions")) return;
  const wrap = document.createElement("div");
  wrap.className = "banner-actions";
  wrap.innerHTML = btns
    .map(
      (b, i) =>
        `<a class="banner-btn${i === 0 ? " is-primary" : ""}" href="${navEsc(b.href)}"${b.download ? ' download target="_blank" rel="noopener"' : ""}>` +
        (b.download ? '<i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i>' : "") +
        `${navEsc(b.label)}</a>`
    )
    .join("");
  box.appendChild(wrap);
}

/* =====================================================================
   Cart panel — slides in from the right when any Cart button is clicked.
   Lists the items in AlaskaCart and leads to the checkout page.
   Any link to "#cart" (e.g. "View cart" in a toast) also opens it.
   Styles: css/nav.css ("Cart panel").
   ===================================================================== */
const AlaskaCartPanel = (function () {
  let el = null;
  let lastFocus = null;
  function build() {
    el = document.createElement("div");
    el.id = "cart-panel";
    el.className = "cpanel";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<div class="cpanel-backdrop" data-cart-close></div>
      <aside class="cpanel-box" role="dialog" aria-modal="true" aria-labelledby="cpanel-title">
        <div class="cpanel-head">
          <h2 id="cpanel-title">Your Cart <span class="cpanel-count" data-cpanel-count></span></h2>
          <button type="button" class="cpanel-close" data-cart-close aria-label="Close cart"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <div class="cpanel-body" data-cpanel-body aria-live="polite"></div>
        <div class="cpanel-foot" data-cpanel-foot></div>
      </aside>`;
    document.body.appendChild(el);
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-cart-close]")) return close();
      const row = e.target.closest("[data-cpanel-id]");
      const act = e.target.closest("[data-cpanel-act]");
      if (row && act) {
        const id = row.dataset.cpanelId;
        const it = AlaskaCart.items().find((x) => x.id === id);
        if (!it) return;
        const a = act.dataset.cpanelAct;
        if (a === "inc") AlaskaCart.setQty(id, (it.qty || 1) + 1);
        if (a === "dec") AlaskaCart.setQty(id, (it.qty || 1) - 1);
        if (a === "remove") AlaskaCart.remove(id);
        return;
      }
      if (e.target.closest("a")) close(true);
    });
    el.addEventListener("change", (e) => {
      const row = e.target.closest("[data-cpanel-id]");
      if (row && e.target.matches("input")) AlaskaCart.setQty(row.dataset.cpanelId, e.target.value);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.classList.contains("is-open")) close();
    });
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = Array.from(el.querySelectorAll(".cpanel-box a[href], .cpanel-box button, .cpanel-box input")).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    });
    document.addEventListener("alaska:cart", render);
  }
  function render() {
    if (!el) return;
    const items = AlaskaCart.items();
    const units = AlaskaCart.count();
    el.querySelector("[data-cpanel-count]").textContent = units ? `(${units})` : "";
    const body = el.querySelector("[data-cpanel-body]");
    const foot = el.querySelector("[data-cpanel-foot]");
    if (!items.length) {
      body.innerHTML = `<div class="cpanel-empty"><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>
          <p><strong>Your cart is empty</strong></p>
          <p>Use the Battery Finder or browse our range, then tap “Add to Cart”.</p></div>`;
      foot.innerHTML = `<a class="cpanel-btn primary" href="/battery-finder.html#bf-root">Battery Finder</a>
          <a class="cpanel-btn" href="/lead-acid">Browse batteries</a>`;
      return;
    }
    // keep focus on the same control while the list re-renders
    const a = document.activeElement;
    const keep = a && el.contains(a) && a.closest("[data-cpanel-id]") ? [a.closest("[data-cpanel-id]").dataset.cpanelId, a.dataset.cpanelAct || "qty"] : null;
    body.innerHTML = `<ul class="cpanel-list">${items
      .map(
        (it) => `<li class="cpanel-item" data-cpanel-id="${navEsc(it.id)}">
          <div class="cpanel-img">${it.image ? `<img src="${navEsc(it.image)}" alt="" loading="lazy">` : `<i class="fa-solid fa-car-battery" aria-hidden="true"></i>`}</div>
          <div class="cpanel-info">
            <p class="cpanel-name">${navEsc(it.model)}</p>
            ${it.note ? `<p class="cpanel-note">${navEsc(it.note)}</p>` : ""}
            <div class="cpanel-ctrl">
              <div class="cpanel-qty" role="group" aria-label="Quantity for ${navEsc(it.model)}">
                <button type="button" data-cpanel-act="dec" aria-label="Decrease quantity" ${it.qty <= 1 ? "disabled" : ""}>−</button>
                <input type="number" inputmode="numeric" min="1" max="${CART_MAX}" value="${it.qty || 1}" aria-label="Quantity">
                <button type="button" data-cpanel-act="inc" aria-label="Increase quantity">+</button>
              </div>
              <button type="button" class="cpanel-remove" data-cpanel-act="remove" aria-label="Remove ${navEsc(it.model)}">Remove</button>
            </div>
          </div>
        </li>`
      )
      .join("")}</ul>`;
    foot.innerHTML = `<dl class="cpanel-sum"><div><dt>Units</dt><dd>${units} of ${CART_MAX}</dd></div></dl>
        <p class="cpanel-hint">Ordering 50 or more? <a href="/quote.html#quote-content">Request a quote</a></p>
        <a class="cpanel-btn primary" href="/checkout.html#cart-content">Proceed to checkout</a>
        <button type="button" class="cpanel-btn" data-cart-close>Continue shopping</button>`;
    if (keep) {
      const row = body.querySelector(`[data-cpanel-id="${CSS.escape(keep[0])}"]`);
      const tgt = row && (keep[1] === "qty" ? row.querySelector("input") : row.querySelector(`[data-cpanel-act="${keep[1]}"]`));
      if (tgt && !tgt.disabled) tgt.focus();
    }
  }
  function open() {
    if (!el) build();
    const toast = document.getElementById("alaska-toast");
    if (toast) toast.remove(); // don't cover the checkout button
    render();
    lastFocus = document.activeElement;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("anav-locked");
    const c = el.querySelector(".cpanel-close");
    requestAnimationFrame(() => {
      c.focus();
      setTimeout(() => {
        if (!el.contains(document.activeElement)) c.focus();
      }, 120);
    });
  }
  function close(navigating) {
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("anav-locked");
    if (!navigating && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  // Cart buttons (header, phone top bar, phone menu) and "#cart" links open the panel
  document.addEventListener("click", (e) => {
    if (!e.target.closest) return;
    const t = e.target.closest("[data-cart-link], a[href='#cart']");
    if (!t || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const drawer = document.getElementById("anav-drawer");
    if (drawer && drawer.classList.contains("is-open")) {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      const burger = document.getElementById("anav-burger");
      if (burger) burger.setAttribute("aria-expanded", "false");
    }
    open();
  });
  return { open, close };
})();
window.AlaskaCartPanel = AlaskaCartPanel;

/* =====================================================================
   Footer — single source of truth. Styles: css/footer.css
   Footer links are built from NAV (same groups and order as the menu).
   Edit FOOTER_SOCIAL for social profiles; an entry whose href is null
   is not shown.
   ===================================================================== */
const FOOTER_CONTACT = {
  address: ["7th Floor, B-3 Tower, Opp. F-9 Park,", "Sector F-9/G-9, Jinnah Avenue, New Blue Area,", "Islamabad, Pakistan, 44010"],
  phones: [
    { label: "+92 51 874 0280", tel: "+92518740280" },
    { label: "+92 326 6660757", tel: "+923266660757" },
  ],
  email: "info@alaskabatteries.com",
};

// Footer links mirror the main navigation: same groups, same pages, same order (built from NAV above).
// A NAV entry may set footerLabel to use different wording in the footer only.
function footerNavGroups() {
  return NAV.map((item) => ({
    title: item.label,
    links: (item.links || item.logos || []).map((l) => ({ label: l.footerLabel || l.label, href: l.href })),
  }));
}

// Order matters: the first four form the left column, the rest the offset right column.
const FOOTER_SOCIAL = [
  { name: "Facebook", icon: "fa-facebook", href: "https://www.facebook.com/alaskabatteriespk/" },
  { name: "Instagram", icon: "fa-instagram", href: "https://www.instagram.com/alaskabatteriespk/" },
  { name: "LinkedIn", icon: "fa-linkedin", href: "https://www.linkedin.com/company/alaskabatteriespk/" },
  { name: "YouTube", icon: "fa-youtube", href: "https://www.youtube.com/channel/UCZXmvMmmVMxFqfzQpGHDWWA" },
  { name: "WhatsApp", icon: "fa-whatsapp", href: "https://wa.me/923266660757" },
  { name: "TikTok", icon: "fa-tiktok", href: "https://www.tiktok.com/@alaskabatteriespk" },
  { name: "X", icon: "fa-x-twitter", href: "https://x.com/alaskabatteries" },
];

function footerHTMLBuild() {
  const nav = footerNavGroups().map(
    (g) => `<div class="afoot-group">
        <h2>${navEsc(g.title)}</h2>
        <ul>${g.links
          .filter((l) => l.href)
          .map((l) => `<li><a href="${navEsc(l.href)}">${navEsc(l.label)}</a></li>`)
          .join("")}</ul>
      </div>`
  ).join("");
  const social = FOOTER_SOCIAL.filter((x) => x.href);
  const icon = (x) =>
    `<li><a href="${navEsc(x.href)}" target="_blank" rel="noopener noreferrer" aria-label="Alaska Batteries on ${navEsc(x.name)}" title="${navEsc(x.name)}"><i class="fa-brands ${navEsc(x.icon)}" aria-hidden="true"></i></a></li>`;
  const c = FOOTER_CONTACT;
  return `
  <footer class="afoot">
    <div class="afoot-inner">
      <div class="afoot-main">
        <section class="afoot-brand" aria-label="Contact Alaska Batteries">
          <p class="afoot-tagline"><a href="/index.html" aria-label="ہر لمحہ اعتماد — Alaska Batteries home"><span class="afoot-tagline-img" aria-hidden="true"></span></a></p>
          <address class="afoot-contact">
            <div class="row"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><p>${c.address.map(navEsc).join("<br />")}</p></div>
            <div class="row"><i class="fa-solid fa-phone" aria-hidden="true"></i><span class="afoot-phones">${c.phones
              .map((p) => `<a href="tel:${navEsc(p.tel)}">${navEsc(p.label)}</a>`)
              .join("")}</span></div>
            <div class="row"><i class="fa-solid fa-envelope" aria-hidden="true"></i><a class="afoot-email" href="mailto:${navEsc(c.email)}">${navEsc(c.email)}</a></div>
          </address>
        </section>

        <nav class="afoot-nav" aria-label="Footer">${nav}</nav>

        <section class="afoot-social" aria-label="Follow Alaska Batteries">
          <h2>Follow us</h2>
          <div class="afoot-social-cols">
            <ul class="afoot-social-col">${social.slice(0, 4).map(icon).join("")}</ul>
            ${social.length > 4 ? `<ul class="afoot-social-col is-offset">${social.slice(4).map(icon).join("")}</ul>` : ""}
          </div>
        </section>
      </div>

      <div class="afoot-bottom">
        <div class="afoot-bottom-left">
          <p class="afoot-copy">© 2026 S.M.J. INTERNATIONAL INDUSTRIES LTD. ALL RIGHTS RESERVED.</p>
        </div>
        <div class="footer-theme">
          <span class="theme-auto" data-theme-set="system" role="button" tabindex="0" aria-pressed="false" title="Follow your device setting">Auto</span>
          <button type="button" class="theme-slider" data-theme-toggle role="switch" aria-checked="false" aria-label="Night mode" title="Day / night">
            <i class="fa-solid fa-sun" aria-hidden="true"></i>
            <i class="fa-solid fa-moon" aria-hidden="true"></i>
            <span class="knob" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </div>
  </footer>
    <div id="successModal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div class="bg-white max-w-md w-full p-12 text-center shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-[#c00d1e]"></div>

        <div class="mb-8 flex justify-center">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
            <i class="fa-solid fa-check text-4xl text-[#c00d1e]"></i>
          </div>
        </div>

        <h2 class="text-3xl font-black uppercase tracking-tighter mb-4">Submission <br />Successful</h2>
        <p class="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
          Thank you for reaching out to Alaska. <br />
          Our team will review your details and contact you within 48 business hours.
        </p>

        <button
          id="successModalCloseBtn"
          type="button"
          onclick="(window.closeModal||function(){})()"
          class="w-full bg-black text-white font-black uppercase py-4 text-[10px] tracking-[0.3em] hover:bg-[#c00d1e] transition-all">
          Return to Site
        </button>
      </div>
    </div>
`;
}

// Cookie notice: a translucent bar along the bottom of the screen, shown until the visitor
// chooses "Allow All" or "Essential Only". No overlay and nothing is blocked. The choice is
// kept in this browser and can be read with AlaskaConsent.get() ("all" or "essential") by any
// analytics or marketing script added later, which should only load when it returns "all".
const COOKIE_KEY = "alaska-cookie-notice";
const AlaskaConsent = {
  get() {
    try {
      const v = localStorage.getItem(COOKIE_KEY);
      return v === "accepted" ? "all" : v; // "accepted" was the earlier single-button choice
    } catch (e) {
      return null;
    }
  },
  set(v) {
    try {
      localStorage.setItem(COOKIE_KEY, v);
    } catch (e) {}
    document.dispatchEvent(new CustomEvent("alaska:consent", { detail: { consent: v } }));
  },
};
window.AlaskaConsent = AlaskaConsent;
function setupCookieNotice() {
  if (AlaskaConsent.get() || document.getElementById("acookie")) return;
  const box = document.createElement("div");
  box.id = "acookie";
  box.className = "acookie";
  box.setAttribute("role", "region");
  box.setAttribute("aria-label", "Cookie choices");
  box.innerHTML = `<div class="acookie-in">
      <p>We use essential cookies to run this website, and optional cookies to understand how it is used and improve it. By using the site, you agree to our <a href="/privacy-policy.html#privacy-content">Privacy Policy</a>.</p>
      <div class="acookie-btns">
        <button type="button" class="acookie-btn" data-consent="essential">Essential Only</button>
        <button type="button" class="acookie-btn is-primary" data-consent="all">Allow All</button>
      </div>
    </div>`;
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-consent]");
    if (!b) return;
    AlaskaConsent.set(b.dataset.consent);
    box.classList.remove("is-in");
    setTimeout(() => box.remove(), 250);
  });
  document.body.appendChild(box);
  requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add("is-in")));
}

function init() {
  const headerElem = document.getElementById("header-placeholder");
  const footerElem = document.getElementById("footer-placeholder");

  if (headerElem) headerElem.innerHTML = headerHTML;
  if (footerElem) {
    footerElem.innerHTML = footerHTMLBuild();
  }

  // Initialise navigation AFTER the HTML is injected
  setupMainNav();
  setupMobileMenu();
  setActiveNavItem();
  renderBannerButtons();
  updateCartBadges();
  AlaskaTheme.sync();
  setupCookieNotice();
  window.addEventListener("hashchange", setActiveNavItem);
}

// Run the initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Global modal helpers: ensure pages that don't include `main.js` can still
// open/close the shared `successModal` injected by this component.
window.showSuccessModal = function () {
  const modal = document.getElementById("successModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
};

window.closeModal = function () {
  const modal = document.getElementById("successModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "auto";
};

// Provide a global function name `closeModal` so inline onclick="closeModal()"
// does not throw a ReferenceError if older markup or cached scripts call it.
function closeModal() {
  try {
    // prefer the namespaced window implementation
    if (typeof window.closeModal === "function") return window.closeModal();
  } catch (e) {
    // swallow errors
  }
}

// Attach click handler to modal close button (works across pages)
function _attachSuccessModalClose() {
  try {
    const btn = document.getElementById("successModalCloseBtn");
    if (btn && !btn.dataset._attached) {
      btn.addEventListener("click", function () {
        window.closeModal();
      });
      btn.dataset._attached = "1";
    }
  } catch (e) {
    console.error("Error attaching successModal close handler", e);
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", _attachSuccessModalClose);
else _attachSuccessModalClose();

// Fallback: delegate clicks for the close button so it always works
document.addEventListener("click", function (e) {
  try {
    const target = e.target.closest && e.target.closest("#successModalCloseBtn");
    if (target) {
      window.closeModal();
    }
  } catch (err) {
    // ignore
  }
});
