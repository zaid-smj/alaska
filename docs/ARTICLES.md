# News / Articles CMS

Manage articles in **Content Management → News / Articles** (`/admin/articles`). Existing active Super Admin, Admin and Content Manager CMS permissions apply; no roles or approval process were added. Existing MFA, authentication, active-user checks and audit logging remain.

## Editing

Create a draft with a title, then add a category label, main image and formatted content before publishing. Optional fields: shorter card title, mobile image and image description. The full title is used inside the existing article popup. The short title falls back to it on cards. Image descriptions fall back to the full title.

The rich-text editor supports headings, links, bold/italic/underline, lists and quotes. Main/mobile uploads accept JPEG, PNG and WebP up to 10 MB. Mobile images fall back to an uploaded main image before any imported mobile asset. Existing bundled images stay intact unless replaced; clearing replacements restores imported defaults. Replaced/deleted uploads are cleaned after the actual database commit and retained while another article or catalog/navbar record references them.

Set display order numerically or reorder the admin table. Draft and Hidden articles never appear publicly. Published articles appear only when `published_at` is reached; an omitted publish time becomes the time of publishing. Future publish times schedule visibility. No scheduler job is needed for this visibility check. Removing an article removes it from News, mobile slides, search and popup data.

## Data and frontend connection

`articles` stores title, optional card title, unique stable slug, category text, uploaded main/mobile paths, imported bundled paths, optional alt text, HTML body, status, sort order, publication time and timestamps. `Article::published()` supplies visible articles ordered by sort order then ID. `Article::publicData()` maps them to the existing News scripts; `safe_body` sanitizes stored HTML before public rendering. Titles/categories and card markup are escaped separately. No public API was added.

The six previous hardcoded articles were extracted verbatim into `database/data/legacy_articles.json` and imported by an additive migration. Full text, original popup titles, shorter card titles, category labels, image paths, original identifiers and order are preserved. No historic publication dates existed; their initial publication timestamps represent the import time. The fixture is used only by the migration and does not recreate deleted content during page requests. Original identifiers remain stable even if titles change.

`WebsiteController` supplies published data only for `news.html` and renders `resources/views/articles/cards.blade.php`. `public/js/blog.js` uses the same data for mobile cards and search; `public/js/main.js` opens the existing popup with the sanitized content. Empty catalogs/searches show an empty state instead of bringing back hardcoded samples. The public URL remains `/news.html`.

Verification includes import preservation, Filament create/edit/publish/hide/delete, CMS role access and inactive-user denial, publication requirements, scheduled visibility, stable unique identifiers, image validation/fallbacks, sanitization, display order and deletion without fallback resurrection. A real-commit test covers rollback-safe image cleanup and shared article/navbar references. Browser checks exercise original text, desktop/mobile popup navigation, search and empty states.
