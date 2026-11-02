/*
 * Alaska Batteries — shared helpers for site forms
 * (warranty claim, warranty registration, quote request). Sends JSON — or
 * FormData when a file is attached — to send-email.php on the same site and
 * offers WhatsApp as a fallback if sending fails.
 */
(function () {
  "use strict";
  const ENDPOINT = window.ALASKA_FORM_ENDPOINT || "send-email.php";
  const WHATSAPP = "923266660757";

  const AlaskaForms = {
    WHATSAPP,
    esc(s) {
      return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    },
    isEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()),
    isPhone: (v) => /^[+\d][\d\s()-]{7,}$/.test(String(v).trim()),
    waLink(text) {
      return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(String(text).slice(0, 1800))}`;
    },
    reference(prefix) {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `${prefix}-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`;
    },
    /** Validate required fields. rules: [{el, test?(value)=>bool, msg}] — returns first invalid element or null */
    validate(rules, errorEl) {
      let first = null;
      const msgs = [];
      rules.forEach((r) => {
        const v = (r.el.value || "").trim();
        const ok = r.test ? r.test(v) : v !== "";
        r.el.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok) {
          msgs.push(r.msg);
          if (!first) first = r.el;
        }
      });
      if (errorEl) errorEl.textContent = msgs.length ? "Please check: " + msgs.join(", ") + "." : "";
      if (first) first.focus();
      return first;
    },
    async send(payload) {
      try {
        const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
        const res = await fetch(ENDPOINT, isForm ? { method: "POST", body: payload } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) return { ok: false, message: data.message || "The server could not send your request." };
        return { ok: true };
      } catch (e) {
        return { ok: false, message: "We couldn't reach the server." };
      }
    },
    /** Turn a payload object into FormData, adding a file if one was chosen */
    withFile(payload, input, field = "attachment") {
      const fd = new FormData();
      Object.keys(payload).forEach((k) => fd.append(k, payload[k]));
      if (input && input.files && input.files[0]) fd.append(field, input.files[0]);
      return fd;
    },
    /** Optional file button (css/split-form.css .sf-file): show the chosen file name, max size in MB */
    fileButton(input, maxMb = 5) {
      const box = input && input.closest(".sf-file");
      if (!box) return;
      const name = box.querySelector(".sf-file-name");
      const act = box.querySelector(".sf-file-act");
      const empty = name.textContent, emptyAct = act.textContent;
      const show = () => {
        let f = input.files && input.files[0];
        if (f && f.size > maxMb * 1024 * 1024) {
          input.value = "";
          f = null;
          name.textContent = "That file is larger than " + maxMb + " MB. Please choose a smaller one.";
          box.classList.remove("has-file");
          act.textContent = emptyAct;
          return;
        }
        box.classList.toggle("has-file", !!f);
        name.textContent = f ? f.name : empty;
        act.textContent = f ? "Change File" : emptyAct;
      };
      input.addEventListener("change", show);
      if (input.form) input.form.addEventListener("reset", () => setTimeout(show, 0));
    },
  };
  window.AlaskaForms = AlaskaForms;
})();
