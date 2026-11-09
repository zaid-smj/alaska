# Warranty registration and claim workflow

Public pages: `/warranty.html` and `/warranty-claim.html`. Staff workspace: `/admin/warranty-registrations` and `/admin/warranty-claims`.

## Customer flow

Customers enter information manually or upload a supporting document/image. Extraction suggests values only into empty fields; it never overwrites customer edits. Missing or invalid required fields must be completed. A review dialog displays the values and attachment. Only **Confirm and send** submits the registration/claim. Consent and confirmation are also validated on the server. The receipt includes a reference and server receipt time. Keep the registration reference for future claims. No customer account, public registration lookup, email delivery or automatic warranty approval is implemented.

Registration stores customer name, phone, email, city, product type/model, serial, warranty card, purchase date and dealer. Unknown/older product models are accepted as text; `product_id` links to a matching published catalog model when available. Catalog changes cannot erase warranty information.

Claims additionally store the optional registration reference/card, problem date, usage, issue and description. Lookup requires matching email, normalized serial and family, plus either a matching reference or card. Lookup never returns stored customer details to the browser. Claims keep their own original customer submission separately from the linked registration.

## Transition policy

`config/warranty.php` defaults `allow_unregistered_claims` to true (`WARRANTY_ALLOW_UNREGISTERED_CLAIMS`). A claim can therefore be submitted without prior online registration and enters the queue as `unregistered_transition`. A linked registration strictly before the reported problem's calendar date is `registered_before_problem`; registration on/after that date is `late_or_same_day_registration`. Same-day cases are conservative because the form collects a date, not a precise problem time. All cases need manual eligibility review. Dates do not automatically extend warranty from the purchase date.

Setting the transition flag false blocks claims with no matching registration. It does not automatically approve/reject linked late registrations; those remain explicitly flagged for staff. Adopt any final eligibility policy before changing this behavior.

## Schema and retrieval

- `warranty_registrations`: immutable customer/product fields, optional catalog FK, unique reference, `registered_at`, `confirmed_at`, `consented_at`, purchase date, versioned original `form_snapshot`. Unique normalized family/serial/card identity prevents identical registrations. Submission key, payload hash and session hash support safe retries.
- `warranty_claims`: immutable customer/product/issue fields, optional registration FK, unique reference, `claimed_at`, confirmation/consent times, original snapshot, registration state, staff-editable status/assignee.
- `warranty_claim_activities`: submission and staff review history, actor, timestamp, changes and internal note.
- `warranty_uploads`: UUID, original filename/MIME/size, **private local disk path**, extraction result, owning browser session hash, expiry, registration/claim link.
- `users.can_manage_warranties`: explicit additional access flag. Active Super Admin/Admin already have access. Active Content Managers require this grant. Only the existing Super Admin staff-management interface can grant it. No roles were added; CMS access alone does not grant warranty access. Existing authentication, MFA and active-user middleware remain.

```php
use App\Models\Warranty\WarrantyClaim;
use App\Models\Warranty\WarrantyRegistration;

$registration = WarrantyRegistration::with(['uploads', 'claims'])->findOrFail($id);
$claim = WarrantyClaim::with(['registration.uploads', 'uploads', 'assignee', 'activities.actor'])
    ->findOrFail($id);
$queue = WarrantyClaim::whereIn('status', ['new', 'in_review', 'awaiting_information'])
    ->latest('claimed_at')->get();
```

Use `WarrantyWorkflow::review()` for review mutations: permission/assignee checks, transaction, history and audit logging. Statuses: `new`, `in_review`, `awaiting_information`, `approved`, `rejected`, `resolved`. Staff can view/search registrations and claims, assign claims, change status and add notes. Customer records cannot be created, edited or deleted through these resources. Submitted evidence remains retained. Dates/times are server generated; matching uses the configured display timezone (Asia/Karachi fallback). Original customer fields do not change with status updates.

Staff downloads use `/admin/warranty-files/{upload}` under panel authentication, MFA and warranty permission checks; submitted attachments only. There is no public file URL. IDs/tokens alone are insufficient. Downloads and review actions are audited. Public POST endpoints use CSRF, size/type validation and rate limits. A submission key replay returns the original receipt only for the same session and payload.

## Extraction and uploads

Accepted: PDF, DOCX, TXT, JPEG, PNG, WebP; 5 MB maximum; images up to 20 megapixels. Actual MIME is checked. DOCX must contain a bounded `word/document.xml`; extraction does not unzip arbitrary paths or resolve XML entities. Documents remain private even if extraction fails.

Extraction runs locally: PDF selectable text via Poppler, scanned PDF/image OCR via Tesseract (English). PDF processing is bounded to the first three pages; subprocesses have timeouts. Labelled printed text such as `Customer Name: ...`, `Serial Number: ...`, `Purchase Date: 2026-01-01` is supported. ISO dates or unambiguous written-month dates are accepted; ambiguous dates are left for manual input. Unlabelled invoices, handwriting and complex layouts are not reliably understood. This is best-effort extraction, not a guarantee every document is understood. Failed/unreadable extraction still permits manual completion and attachment submission. No external AI service receives customer files.

The running development container has `tesseract-ocr` and `poppler-utils` installed. For a reproducible rebuild, build the existing Sail base, then use the optional overlay:

```sh
docker compose build laravel.test
docker compose -f compose.yaml -f compose.warranty.yaml up --build -d
```

Use the same Compose project name as your running stack (this WSL stack uses `-p alaska-wsl`) on both commands. The overlay builds from `sail-8.5/app`; the normal project composition is otherwise unchanged. Other hosting environments must install those binaries and PHP ZIP/DOM/fileinfo/GD support. Without reader binaries, submission remains possible through manual entry and extraction reports unavailable.

Unsubmitted uploads expire after 24 hours. `php artisan warranty:prune-uploads` deletes only expired unattached evidence. It is scheduled hourly; hosting must run Laravel's scheduler (`schedule:run` each minute). Submitted documents are excluded. A future formal retention policy can be implemented independently.

## Evolving the forms

Add explicit typed columns through additive migrations for new stable fields. Update `WarrantyWorkflow` server validation, frontend field mapping, extraction labels where appropriate, Filament infolists and tests. Increment `form_version` when the form contract changes. Preserve existing snapshots and timestamps rather than rewriting past customer submissions. Never use OCR output as verified facts or automatically decide eligibility.

## Verification (2026-11-08)

- Full Laravel regression suite: **92 passed, 668 assertions**, using the isolated `testing` database.
- JavaScript regression suite: **46 passed**. Vite production build succeeded.
- Warranty tests cover confirmation, retry/session ownership, prior/late/unregistered claims, invalid references/dates, private uploads and downloads, staff permissions/grants, Filament list/detail/review actions, immutable snapshots, expiration cleanup, and real printed-image OCR/PDF text/DOCX extraction.
- Playwright exercised actual document upload, preserved customer edits, review-before-submit, successful registration and linked claim, and desktop/mobile pages without JavaScript errors or horizontal overflow. Synthetic records/attachments were removed afterward.
- Existing product, section, membership and banner values matched their preservation snapshot.
