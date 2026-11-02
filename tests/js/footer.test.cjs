// Run with: npm run test:js
// Footer contract (js/components.js → FOOTER_CONTACT / FOOTER_NAV / FOOTER_SOCIAL).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const src = fs.readFileSync(path.join(root, "public/js/components.js"), "utf8");
const block = (name) => {
  const start = src.indexOf(`const ${name} = `);
  const end = src.indexOf("\n};\n", start) > -1 && name === "FOOTER_CONTACT" ? src.indexOf("\n};\n", start) + 3 : src.indexOf("\n];\n", start) + 3;
  return new Function(`return ${src.slice(start + `const ${name} = `.length, end - 1)}`)();
};
const contact = block("FOOTER_CONTACT");
const NAV = (() => {
  const start = src.indexOf("const NAV = ");
  const end = src.indexOf("\n];\n", start) + 3;
  return new Function(`return ${src.slice(start + "const NAV = ".length, end - 1)}`)();
})();
const social = block("FOOTER_SOCIAL");

test("both phone numbers, email and address are kept", () => {
  assert.deepEqual(contact.phones.map((p) => p.tel), ["+92518740280", "+923266660757"]);
  assert.deepEqual(contact.phones.map((p) => p.label), ["+92 51 874 0280", "+92 326 6660757"]);
  assert.equal(contact.email, "info@alaskabatteries.com");
  assert.equal(contact.address.join(" "), "7th Floor, B-3 Tower, Opp. F-9 Park, Sector F-9/G-9, Jinnah Avenue, New Blue Area, Islamabad, Pakistan, 44010");
});

test("footer links mirror the main navigation; every link points to an existing page", () => {
  assert.match(src, /function footerNavGroups\(\) \{\s*return NAV\.map\(/);
  assert.deepEqual(NAV.map((i) => i.label), ["Solutions", "Technology", "Partners", "Warranty", "Info", "About"]);
  NAV.flatMap((i) => i.links || i.logos).forEach((l) => {
    assert.ok(["/lead-acid", "/solutions/lithium-ion", "/solutions/inverters"].includes(l.href) || fs.existsSync(path.join(root, l.href.replace(/^\//, "").split("#")[0])), `${l.label} → ${l.href} missing`);
  });
});

test("social icons in the required order; WhatsApp uses the second number", () => {
  assert.deepEqual(social.map((s) => s.name), ["Facebook", "Instagram", "LinkedIn", "YouTube", "WhatsApp", "TikTok", "X"]);
  assert.equal(social.find((s) => s.name === "WhatsApp").href, "https://wa.me/923266660757");
  assert.equal(social.find((s) => s.name === "X").icon, "fa-x-twitter");
  assert.equal(social.find((s) => s.name === "X").href, "https://x.com/alaskabatteries");
  social.filter((s) => s.href).forEach((s) => assert.match(s.href, /^https:\/\//));
});

test("footer markup: Urdu tagline artwork, exact copyright, no legal links in the copyright line", () => {
  assert.ok(!src.includes("afoot-legal"));
  assert.match(src, /<p class="afoot-tagline"><a href="\/index.html" aria-label="ہر لمحہ اعتماد[^"]*"><span class="afoot-tagline-img" aria-hidden="true"><\/span><\/a><\/p>/);
  assert.ok(src.includes("© 2026 S.M.J. INTERNATIONAL INDUSTRIES LTD. ALL RIGHTS RESERVED."));
});
