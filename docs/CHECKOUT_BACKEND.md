# Frontend checkout integration

This is the completed backend/admin contract. Customer-facing checkout selection, rendering, above-limit routing and WhatsApp integration remain frontend tasks. No bank API is connected. All amounts are integer **paisa** (`100 = PKR 1`). Do not submit browser-calculated prices/taxes/totals as authoritative values.

## 1. Options

`GET /sales/checkout/options` returns:

```json
{
  "checkout_enabled": false,
  "currency": "PKR",
  "cart_unit_limit": 49,
  "payment_methods": {"bank_transfer": true, "cod": true},
  "shipping_before_tax_cents": 50000,
  "final_total_requires_preview": true
}
```

Respect the enabled flags. This is a base shipping charge, not an untaxed final total or a tax-inclusive delivery quote. The actual total comes from preview. Bank details are supplied with the selected method's preview, not exposed in the options payload.

Published product IDs and slugs are included in `window.ALASKA_CONTENT.salesProducts` on existing checkout/quote pages. Use real CMS IDs; static catalog IDs or names are not checkout product identifiers. Unpriced models belong in Request a Quote.

## 2. Preview

`POST /sales/checkout/preview`:

```json
{
  "payment_method": "bank_transfer",
  "items": [{"product_id": 123, "quantity": 2}]
}
```

Response includes `preview_id`, expiry (15 minutes by default), selected method, server-calculated pricing and public payment instructions. Pricing contains lines, product subtotal excluding tax, product tax, product gross, shipping before tax, shipping tax, combined taxes and final total. Each line and shipping component includes a tax breakdown and source/profile snapshot. COD previews do not include bank account details.

The server uses its saved prices, tax profiles and shipping settings, regardless of extra browser fields. Render the exact reviewed total and instructions before asking for confirmation. Above 49 **total units**, the response is instead `requires_quote: true`, `reason: quantity_limit` and `quote_url`; no preview/order is created. Missing prices or tax configuration return validation errors. They are not treated as zero.

## 3. Confirm

`POST /sales/checkout/confirm`:

```json
{
  "preview_id": "UUID_FROM_PREVIEW",
  "submission_key": "NEW_UUID_FOR_THIS_CHECKOUT",
  "name": "Customer name",
  "phone": "+923001234567",
  "email": "customer@example.com",
  "city": "Lahore",
  "address": "Delivery address",
  "customer_type": "individual",
  "company": null,
  "message": "Optional delivery notes",
  "consent": true,
  "confirmed": true
}
```

Customer type: `individual`, `business`, `dealer`, `installer`. These are declared contact categories, not account/tier entitlements. Optional company/message may be omitted. Address, contact details, consent and explicit confirmation are required. No customer login is needed.

The preview must belong to the same browser session, be unexpired and unused. The server locks/reloads applicable data, recalculates and compares the reviewed snapshot. Changed prices/taxes/shipping/instructions require a fresh review; a changed amount is never silently accepted. Only then does it create a unique `ORD-...` record and immutable snapshot.

Successful response includes `success`, `reference`, `request_kind: checkout`, method, initial payment state, saved checkout and acknowledgement message. Bank transfer starts `awaiting_verification`; COD starts `awaiting_collection`. This response is an acknowledgement, not a live customer payment-status lookup. The staff dashboard holds later outcomes.

Keep the same submission key and data for a network retry. Exact retries return the persisted receipt without another order, including after prices later change. Reusing a key/preview with different data fails. Both key and preview are session-bound. Do not clear the cart until confirmation succeeds. A preview does not create an order.

## Transport and errors

These are Laravel **web** routes, not token-authenticated public account APIs. Use same-origin cookies, `Accept: application/json`, `Content-Type: application/json`, and `X-CSRF-TOKEN` from the server-rendered meta token for POSTs. The existing checkout page supplies that token. Do not disable CSRF or use a browser-only random total.

Options/preview/confirm are rate limited and use no-store responses. Validation failures return 422 with field errors. Handle session expiry and rate limits explicitly. Do not display raw internal server errors as payment success.

## Staff-only workflow

All sales-authorized staff can see/claim/transfer records. Admin can override assignments without colleague approval; all changes are audited. Notes, external references, status history and cancellation remain accessible.

Use the method-specific **Record external payment status** action to record finance-team verification or COD collection, with reference and note. It records actor/time and the previous state. Wrong-method outcomes and attempts on quotes are rejected. Bank-transfer fulfilment progression requires a recorded verified outcome; COD fulfilment may precede collection. These are employee assertions about external checks, never automated bank verification or ledger reconciliation.

## Launch configuration

In **Sales Management → Payment & Shipping Settings**, Admin/Super Admin enters actual bank accounts/instructions, confirms available methods and the shipping base (default PKR 500 before tax), and selects the applicable shipping tax rule. Product/shipping tax profiles must be reviewed and activated using official sources and company accounts guidance. Configure printed retail-price bases when applicable. Checkout remains disabled by default, and missing/ambiguous tax data blocks totals even if enabled.

No real bank details or guessed active tax rates are seeded. Enabling the backend does not implement frontend checkout or send WhatsApp messages.
