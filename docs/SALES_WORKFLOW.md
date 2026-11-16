# Sales management and checkout backend

## Agreed scope

Any website visitor can request a quote or place an order without an account. Normal checkout and Request a Quote are separate. Checkout offers **bank transfer** and **Cash on Delivery**. Bank checks, collections, proposals, invoices, negotiations, discounts, returns and financial reconciliation happen outside the website; authorized staff record the relevant outcomes here. WhatsApp integration and customer-facing checkout wiring belong to the frontend team's later work.

PKR only. No inventory system, customer/dealer tiers, customer logins or payment gateway. The cart threshold remains **49 total units**, not 49 different models. Above it the backend returns a quote-routing result. Unpriced products cannot be purchased through checkout and remain quote-only. No old prices, tax bases or specifications are fabricated.

## Quote requests and order intake

`POST /sales/requests` accepts guest quote requests (`source=quote`) with product names/quantities, contact data, consent and confirmation. Unknown/older models remain quotable. Existing published prices are observed from the database; a missing price stays null. The old `source=cart` submission is rejected so it cannot silently substitute an enquiry for a priced checkout order.

Checkout uses separate options, preview and confirmation routes, documented in [CHECKOUT_BACKEND.md](CHECKOUT_BACKEND.md). All quantities, prices, tax and shipping are calculated on the server. Confirmation revalidates against the reviewed preview. Orders receive unique `ORD-...` references, an immutable checkout snapshot, and their payment method/status. Bank-transfer orders start awaiting verification; COD orders start awaiting collection. Nothing collects or verifies money automatically.

Requests have unique references, consent timestamps, session-bound idempotency keys, original customer/product information and audit/history. CSRF, throttling, server validation and private evidence handling apply. Neither references nor public endpoints provide a customer lookup or expose staff notes.

## Sales workspace

Overview, New Sales, Pending Sales, Completed Sales and All Sales Requests share centralized searchable/filterable/paginated data. Quotes, checkout orders and earlier cart enquiries have separate tabs/types. Ownership, payment route/status, order total and follow-up dates are visible/filterable.

All sales-authorized staff can see and claim unowned requests. Claiming locks the record: a second claimant gets an error rather than stealing ownership. A repeated claim by the same owner is harmless. Staff can transfer between active sales-authorized colleagues, with a required handover note and stale-owner check. **Admin/Super Admin can override the prior-owner check and reassign without colleague approval.** All transfers record who acted, previous/new owner, reason and time.

Actions include a dedicated work/handover note, status/follow-up update, external proposal/invoice/team reference, delivery/return reference and, for orders, manual external payment outcome. Notes are append-only activity entries; a successor can read the full history. Detail views, settings edits, assignments, notes, payment outcomes and status changes are audited.

Staff may record completion, cancellation, declined requests, external proposals, returns and refunds with outcome notes; no generated invoice or cash ledger is required. Bank-transfer checkout orders require an externally verified transfer before moving into processing/dispatch/delivery/completion. COD can progress before collection, because payment is due on delivery. Cancellation never deletes the order, its prices, customer details or history.

## Payment outcome tracking

Payment status stays separate from order status. Sales-authorized staff—including Sales users—can record:

- Bank transfer: awaiting verification, verified externally, verification failed.
- COD: awaiting collection, collected externally, collection failed.

Every update requires a reference and explanatory note, and stores actor/time. Corrections are new audit/history events containing the previous outcome; they do not erase the earlier assertion. A bank message, order placement or attachment is not proof of payment. Quote requests cannot be marked as paid. Payment-status correction does not automatically rewrite fulfilment history, reopen a cancelled order or imply a bank API connection.

## Payment and shipping settings

**Sales Management → Payment & Shipping Settings** is editable only by active Admin/Super Admin. It controls checkout enablement, available payment routes, public bank accounts/instructions, COD instructions and shipping.

Shipping defaults to **PKR 500 before tax**. It can be changed in the dashboard, and its applicable tax is calculated separately. Changing instructions or fees never changes existing orders. Settings changes are transactional and audited. Never store banking login credentials, PINs or API keys in public instructions.

Checkout starts disabled with no invented bank accounts or live tax rules. Enabling bank transfer requires bank details. Paid shipping requires an explicitly confirmed shipping tax profile, including an explicit zero rule if applicable. Each product must also have an unambiguous valid tax treatment when previewed. A missing rule blocks a total instead of substituting zero.

## Tax calculation

`SalesTaxProfile` stores product-family/product-specific or shipping applicability, transaction/retail basis, explicit rate, optional same-basis additional components, inclusive/exclusive treatment, dates, official source and accounts-confirmed notes. Only Admin/Super Admin can manage/activate rules; activation records its actor/time. Rule changes and their audit events share a transaction.

Catalog prices are **tax-exclusive per the user's instruction**; the engine retains inclusive-price support for an explicitly confirmed exception. `products.tax_retail_price_pkr` is a separate nullable, accounts-provided printed retail-price basis excluding tax. It never replaces or automatically derives from the selling price. The product form exposes it without adding a publication requirement.

Integer paisa and basis-point rates avoid trusting browser arithmetic. Snapshots include product net/tax/gross, shipping before tax, shipping tax, all tax components/bases/rates, final payable total, tax sources/approval times and the payment instructions shown at placement. Product-specific tax profiles override family defaults; ambiguous, inactive, expired or incomplete rules fail. Rounding is explicit and inclusive allocations cannot create negative components.

The shipping rule is a configured company/courier treatment, not an assumed universal Pakistan shipping rate. If the actual provider/jurisdiction changes the applicable treatment, configure the correct rule or extend selection before launch. Seller settlement withholding is not automatically turned into an additional customer charge.

### Official research and review requirement

- [FBR Sales Tax Act consolidation to 30 June 2025](https://download1.fbr.gov.pk/Docs/202586148252375SalesTaxActupdatedupto2025-26.pdf), section 3 and Third Schedule entry 43: general sales-tax regime and storage-battery retail-price treatment, with exceptions.
- [FBR Finance Act 2026](https://download1.fbr.gov.pk/Docs/20266291261044366FinanceAct2026.pdf), reviewed sales-tax amendments and Third Schedule additions; [official index](https://www.fbr.gov.pk/Categ/Finance-Acts/620).
- [Punjab specific service rules](https://reg.pra.punjab.gov.pk/ptms/SOP/Download/Rules/5-Specific%20provisions.pdf): courier-service tax treatment is separate from goods taxation.
- [Sindh rules/acts index](https://www.srb.gos.pk/srb/acts-rules-amendments/): current provincial service rules must be checked for the applicable courier arrangement.
- [FBR SRO 1429 of 2025](https://download1.fbr.gov.pk/SROs/2025858833282SRO1429DATED04-08-2025.pdf): courier/payment-intermediary withholding obligations are not interchangeable with a shipping-service surcharge.

No universal product/courier rate was guessed or activated. The company's registration, product classifications, applicable exemptions/notifications and actual shipping arrangement need the promised accounts/tax review. The rates and bank accounts in tests are synthetic fixtures only. Code completion is not a claim of production tax compliance.

## Reports and permissions

Operational reports use actual requests for status counts, ownership/workload, overdue follow-ups, requested units/products, trends and manual completion. Orders can be broken down by COD/bank transfer and recorded external payment outcome. No revenue, collected cash, verified bank balance or profit is inferred from those statuses.

Super Admin keeps full access and exclusive management of Admin accounts/permission overrides. Admin manages Sales/Marketing staff, sales, CMS and warranties. Marketing has CMS access; Sales has sales access. Explicit additional grants remain Super Admin-controlled. Staff access requires an active account; MFA, work sessions and existing authentication remain. Displays and date/report boundaries use PKT; timestamps remain UTC.

## Preserved/retired data

The original product, section, membership and banner data remain. Earlier cart enquiries remain labeled `legacy_cart`, not confirmed orders. Previously applied invoice/payment/discount/tier tables are retained without destructive migrations; there are no active invoice-generation, cash-ledger, discount-code or tier-management screens/routes. Immutable historical invoice/payment models preserve any existing records.

Main tables: `sales_requests`, `sales_request_items`, `sales_activities`, `sales_attachments`, `sales_tax_profiles`, `sales_checkout_settings`, `sales_checkout_previews`. Use `SalesWorkflow` and `CheckoutWorkflow` for mutations. Original checkout snapshot/method/currency cannot be overwritten through model updates. Preview/attachment cleanup excludes submitted evidence and orders; hosting must run Laravel's scheduler.

## Verification — completed backend/admin revision

- Full Laravel suite: **135 tests passed, 991 assertions**, on the isolated testing database.
- JavaScript regressions: **46 passed**. Vite production build and PHP formatting passed.
- Coverage includes authoritative goods/shipping tax totals, both payment routes, unchanged purchase snapshots, disabled/missing configuration, stale/expired/session-bound previews, idempotent confirmation, forged-price/status rejection, audited external verification, fulfilment checks, admin reassignment, private evidence, settings permissions/PKR conversion, and preview cleanup retaining all orders.
- Existing product, section, membership and banner values were verified against the preservation snapshot. No development database reset or invented live bank/tax data was used.
- Current development shipping base is PKR 500; checkout remains disabled until actual bank details and applicable tax rules are configured/reviewed. Frontend/WhatsApp integration remains the frontend team's work.

### Bank/payment editing permission verification

Only active Super Admin and Admin accounts can open/edit Payment & Shipping Settings or save bank/payment details. Sales and Marketing remain denied even with the additional Sales-access override; inactive Admins are also denied. Authorized changes are audited. The expanded CheckoutOrdersTest suite passed **13 tests / 81 assertions**, including this explicit role-by-role regression.
