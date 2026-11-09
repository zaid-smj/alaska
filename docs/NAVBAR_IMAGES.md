# Navbar images

Edit under **Content Management → Navbar Images** (`/admin/navbar-images`). Active Super Admins, Admins and Content Managers have the existing CMS access. There are fourteen fixed positions: six dropdown feature photos, six technology-logo variants, and two main-logo variants. Admins edit replacements and optional image descriptions; they cannot add/remove positions or change menu destinations.

`navbar_images` stores a unique `slot`, nullable uploaded `image`, optional `alt_text` and timestamps. The additive migration initializes the fixed positions without copying or changing existing assets. `NavbarImage::SLOTS` holds the original bundled paths. Clearing an uploaded replacement restores its bundled default. Uploads accept JPEG, PNG and WebP up to 10 MB, are checked on the server, and use `content/navbar` on the public disk. Replaced files are removed after commit only when not referenced by other catalog/navbar records. Changes use the existing audit logger.

`WebsiteController` includes `navigationImages` in the existing page content payload. The catalog Blade layout supplies the same payload, so Lead Acid listings/details also receive changes. `public/js/components.js` applies replacements before generating desktop/mobile markup, preserving existing menus, destinations, themes and layout. Static templates opened directly without Laravel retain bundled defaults.

Verification: four new Laravel tests cover fixed slots/defaults, Filament permissions/editing, public-page data, reset behavior and invalid file rejection. Browser checks cover shared desktop/mobile logo and dropdown rendering on home, About and Lead Acid pages.
