# Product catalog data reference

Backend/CMS only. No public route, public page, filter, comparison, cart or API was added or redesigned by this upgrade.

## Families and tables

Family values are `lead-acid`, `inverter`, and `lithium-ion` (`App\Catalog\ProductFamily`).

| Table | Ownership / purpose |
|---|---|
| `products` | Shared identity, publication, content and legacy Lead Acid values. Names unique per `type`; slugs remain globally unique and stable on rename. |
| `lead_acid_specifications` | One optional row per Lead Acid product; new typed secondary measurements. |
| `inverter_specifications` | One optional row per inverter; typed electrical/mechanical specifications. |
| `lithium_specifications` | One optional row per Lithium product; typed electrical/environmental specifications. |
| `product_series` | `family`, `name`, `is_active`, `sort_order`; one series per published product. |
| `product_categories` | `family`, `name`, `is_active`, `sort_order`, `description`, optional `legacy_section_id`; one primary category. |
| `product_tags` | `family`, `name`, `is_active`, `sort_order`; multiple tags through `product_tag_assignments`. |
| `product_gallery_images` | `product_id`, `path`, `alt_text`, `sort_order`; rows returned in saved order. |
| `product_documents` | `product_id`, `slot`, nullable `path`, `is_visible`; unique slot per product. |
| `catalog_banners` | Unique `family`, title/subtitle, main/mobile upload paths and alt text. |
| `product_sections`, `product_product_section` | Original Lead Acid sections/many-to-many memberships, retained for the existing public catalog. |

Classification names are unique within their family. Product classification foreign keys are `series_id` and `primary_category_id`. Models validate family membership; the normalized tag pivot rejects cross-family assignments. Do not move existing products/classifications/banners to another family.

## Shared product fields and editing

Shared fields: `name`, `slug`, `type`, `status`, `technology`, `series_id`, `primary_category_id`, `image`, `legacy_image_path`, `alt_text`, nullable `price_pkr` (decimal 12,2), `description`, `sort_order`, nullable integer `short_warranty_months`, `certifications`, boolean `certifications_visible`, JSON `specification_visibility`, and ordered string arrays `features`, `recommended_uses`, `warranty_details`, `installation_instructions`.

Lists are JSON arrays of strings in their saved order. Filament uses reorderable repeaters; the editing service converts `{text: ...}` form entries to those arrays. Gallery images are separate ordered rows. Product features on new Inverter/Lithium forms are editable suggestions; admins must verify claims before publishing. Warranty and installation text is not fabricated or prefilled with product claims.

Use `App\Services\Catalog\ProductEditor::save($product, $data, $family)` for aggregate edits. It saves related data transactionally, checks the completed aggregate before publication, scopes classifications and preserves historic section memberships. Form-only keys include `tag_ids`, `specs`, `gallery`, and `documents`. Omitted keys preserve saved values; explicit empty optional inputs clear them. Filament handles uploaded files before passing stored paths to this service. Direct product/spec model saves also enforce server-side validation; query-builder/raw SQL writes bypass model events and must not be used for normal CMS editing.

Image uploads accept real JPEG/PNG/WebP files; PDF slots accept actual PDF bytes, not just a `.pdf` filename. Maximum upload size is 10 MB per file. Uploads use the public disk under `content/products`; existing image alt text and legacy bundled assets remain supported. Instance deletion/replacement cleans up unreferenced managed files after successful transaction commit. Rollbacks keep the previously saved files. Avoid bulk SQL deletes that bypass those hooks.

## Publication and classification safety

`draft` and `hidden` may be incomplete. New `published` records require their family's identity, active series/category, image and alt text, technical specifications, certifications, and at least one entry in all four ordered lists. Lead Acid and Lithium additionally require at least one active family tag; Inverters may have none. Price is always nullable, never automatically zero. All supplied optional numbers/options/ranges are validated even on drafts.

Visibility is display metadata, not permission to omit a required value. `Product::isSpecificationVisible($group)` returns the saved flag, defaulting to true when absent. Main/secondary field metadata and visibility groups are declared in `App\Catalog\SpecificationFields`. Shared certifications have their own boolean. Reading a hidden specification still returns its stored value for future comparison.

A series/category/tag in use by published products cannot be deactivated. Classifications cannot be deleted while assigned. Categories also check historical Lead Acid memberships, including ambiguous legacy products without a primary category. Classification updates are transactional and publication reads lock their classifications, so a simultaneous publication/deactivation cannot intentionally leave a newly published product depending on an inactive classification. Hide/reassign dependent products first. Category order updates also synchronize the compatible Lead Acid section order.

## Legacy Lead Acid compatibility

The migration marks ONLY pre-existing published Lead Acid records `legacy_publication_exempt = true`. They remain published and can receive safe edits while incomplete. The admin shows missing-field information. Moving one to Draft/Hidden permanently clears its exemption; republishing then requires the full current specification. New records cannot grant themselves an exemption.

The original `warranty` text, `weight_kg`, `length`, `width`, `height`, `dimension_unit`, `voltage`, `capacity_ah`, `plates`, `box_size`, `uses`, `tags` JSON and other existing attributes remain. Old warranty text is not converted into warranty months. Old Length is not reinterpreted as Depth. Inch/cm measurements are not relabelled as millimetres, and old weight is not assumed to be dry weight. Enter the new verified mm/dry-weight fields separately.

Existing `uses` text is copied intact into one recommended-use entry when the new list is empty. No comma-based splitting or interpretation occurs. Editing recommended uses updates the old `uses` text for backward-compatible retrieval. Normalized tag selection updates the legacy `tags` name array; existing tag names were migrated without merging Solar and Backup.

Single legacy section membership is mapped to the matching primary category. Multiple memberships are retained without guessing a primary. Selecting a primary category adds its compatible section without detaching historical memberships. Existing sections remain independently stored; deleting a legacy section retains the original behavior of drafting associated products. Review primary categories and reassign/republish deliberately afterward.

`Product::specifications()`, `image_url`, search helpers and the old `published()` scope retain their public contracts. `published()` remains **Lead Acid-only** and requires section membership. New secondary fields do not silently replace ambiguous legacy dimension/weight values in that old formatter. A future frontend should use the typed records below.

## Retrieval through Eloquent (no API endpoint)

```php
use App\Models\Product;
use App\Catalog\CatalogData;

// Only published records, across the requested family.
$products = Product::forPublicUse()->forFamily('lithium-ion')
    ->with(['series', 'primaryCategory', 'catalogTags', 'galleryImages',
            'documents', 'lithiumSpecifications'])
    ->orderBy('sort_order')->orderBy('name')->get();

$product = $products->first();
$data = $product ? CatalogData::forProduct($product) : null;
```

`forPublicUse()` excludes Draft and Hidden. It deliberately includes grandfathered published Lead Acid records, which may still have missing new fields. `CatalogData::forProduct()` is an INTERNAL adapter and does not authorize or select public records itself: filter status/family before calling it. No public API routes exist for this adapter.

Its output contains identity/status, classifications, tags, image/gallery URLs, nullable PKR price, description, ordered content, certifications with visibility, all document slots and grouped `main` / `secondary` specifications. Every specification entry contains `label`, `value`, `unit`, `visibility_group`, `is_visible`. Values are returned even when invisible. Numeric SQL decimal fields are returned as precision-preserving decimal strings by Eloquent; perform numeric filtering in SQL, not by lexically comparing formatted strings.

```php
$lead = Product::forPublicUse()->forFamily('lead-acid')
    ->with('leadAcidSpecifications')->first();
$dryWeight = $lead?->leadAcidSpecifications?->dry_weight_kg; // kg

$inverters = Product::forPublicUse()->forFamily('inverter')
    ->whereHas('inverterSpecifications', fn ($q) =>
        $q->where('rated_capacity_kw', '>=', 5))->get();

$banner = App\Models\CatalogBanner::where('family', 'inverter')->first();
```

Use the explicit static relationships `leadAcidSpecifications`, `inverterSpecifications`, `lithiumSpecifications` when eager-loading. The existing shared public detail URL resolver still only handles Lead Acid. New static public range pages were not wired to this CMS in this task.

## Units, energy and ranges

New family-specific decimal measurements use SQL decimal(16,4); counts use integers, strings remain text. Lead Acid's existing voltage and Ah columns keep their existing decimal(8,2) and decimal(10,2) precision. All required measurements are entered numerically, separately from unit metadata. Wh/kWh, W/kW, V/VDC, A/Ah, kg/mm and other units are not interchangeable.

Lithium persists `nominal_energy_wh` in Wh and `energy_unit` as the chosen input/display preference (`Wh` or `kWh`). Filament exposes `specs.energy_value` plus the selector; the service normalizes with decimal arithmetic, rounding to 0.0001 Wh. No binary floating-point multiplication is used for normalization. Editing converts back to the stored preferred input unit.

```php
$spec = $product->lithiumSpecifications;
$wh  = $spec->energyIn('Wh');  // e.g. "5120.0000"
$kwh = $spec->energyIn('kWh'); // e.g. "5.1200000"
```

Voltage/MPPT and each temperature range store separate min/max columns and reject min > max. Temperatures support negatives (not below absolute zero). DOD and self-discharge percentages are 0–100. Pulse duration inherits pulse-current visibility; cycle-life conditions inherit cycle-life visibility; the self-discharge period shares the rate's visibility. Extra Lithium dimension label/value must either both be present or both be null. Dimensions share one flag per family.

Wi-Fi options are `available`, `not_available`. Bluetooth options are `available`, `optional`, `not_specified`. Both fields are nullable; explicit `not_specified` is different from null. Inverter phase is `1P` or `3P`. Lithium humidity, protection, cycle-life conditions, communication and self-discharge period remain descriptive text, preserving qualifiers.

## Documents and availability

Lead Acid slots: `datasheet`, `other`. Inverter/Lithium slots: `datasheet`, `manual`, `installation`, `other`. Slots are created for every new product, even an incomplete draft. A slot may have a null PDF path and independent `is_visible` flag. Toggling visibility retains the file.

```php
$documents = $product->documents()->get()->filter->is_available;
```

`is_available` checks a saved path, enabled visibility and physical file existence. `available()` is a database prefilter for nonempty enabled paths; still check `is_available` if files may have been removed outside the CMS. `CatalogData` only returns a document URL when available. Raw model/storage data remains accessible to backend staff. Visibility is not a private-file access-control mechanism.

Banner URLs retain existing Lead Acid bundled fallbacks. New families have no fabricated default banner image: upload a main image; mobile falls back to main. Banners are edited independently through family-scoped resources.

## Vehicle compatibility (backend only)

`vehicle_makes` → `vehicle_models` (`vehicle_make_id`) → `vehicle_fitments` (`vehicle_model_id`, `year_from`, `year_to`, optional notes). A single year is represented by equal from/to values; years validate from 1886–2200 and from <= to. Exact duplicate model/year intervals are prevented by a unique constraint.

`vehicle_product_compatibilities` maps a fitment to many Lead Acid products; the custom pivot rejects other product families. `Product::vehicleFitments()` and `VehicleFitment::products()` expose the relationship. Makes/models can be deactivated; deleting a make/model with dependent records is blocked. No compatibility data is seeded. This structure does not gate publication and does not modify the public finder/sidebar.

## Admin workspaces and operations

Each family has Products, Series, Categories & Order, Tags and Page Banner. Lead Acid additionally has Vehicle Makes, Vehicle Models, Years & Compatibility. Thin family resource adapters reuse `app/Filament/Catalog/*` and `SpecificationFields` rather than maintaining three separate form/validation implementations.

All three existing active roles (Super Admin, Admin, Content Manager) retain CMS access, with the existing MFA/authentication middleware. Only Super Admin manages staff; no new role or approval flow was introduced. Old Lithium/Inverter placeholder URLs redirect to their real product resources and are hidden from navigation. Existing Lead Acid product and category-management URL paths are preserved.

Normal model changes and category order changes are audited; aggregate product saves record classification assignments. Do not use raw SQL writes for normal content changes. No static product catalog is imported into production or populated with invented specifications. The opt-in Lead Acid demo seeder now creates incomplete samples as Drafts; it continues to skip existing slugs, so rerunning it does not change published legacy records.

## Migration and verification notes

Apply pending migrations with `php artisan migrate`. They add classifications, typed specifications, attachments, family-scoped banners and vehicle tables; they preserve existing records/IDs/slugs/files/legacy attributes/pivots. The main expansion deliberately refuses an automatic destructive rollback. Restore a reviewed backup if a rollback of populated catalogs is required.

The pre-migration development snapshot and working-tree diff are private, ignored files under `local-docs/catalog-upgrade/`. Existing uncommitted public UI/admin-branding changes were preserved exactly. No public routes or frontend assets were changed by this backend task.

The field matrices below are generated from the same registry used by validation and Filament. R applies at new publication/republishing; O may remain null. A visibility-group name denotes one saved Boolean in `products.specification_visibility`; `—` means no individual toggle. Shared certifications use `certifications_visible` instead.

## Lead Acid specification fields

| Storage / field | Label | Type | Unit | R/O | Group | Visibility key |
|---|---|---|---|---|---|---|
| `products.short_warranty_months` | Short Warranty | integer | months | O | main | short_warranty |
| `products.plates` | Plates | integer | — | R | main | plates |
| `products.voltage` | Voltage | decimal | V | R | main | voltage |
| `products.capacity_ah` | Capacity | decimal | Ah | R | main | capacity |
| `products.box_size` | Box Size | text | — | R | secondary | box_size |
| `lead_acid_specifications.cca` | CCA (Cold Cranking Amperes) | text | — | R | secondary | cca |
| `lead_acid_specifications.reserve_capacity` | RC (Reserve Capacity) | text | — | R | secondary | reserve_capacity |
| `lead_acid_specifications.terminal_type` | Terminal Type | text | — | R | secondary | terminal_type |
| `lead_acid_specifications.terminal_layout` | Terminal Layout | text | — | R | secondary | terminal_layout |
| `lead_acid_specifications.depth_mm` | Depth | decimal | mm | R | secondary | dimensions |
| `lead_acid_specifications.width_mm` | Width | decimal | mm | R | secondary | dimensions |
| `lead_acid_specifications.height_mm` | Height | decimal | mm | R | secondary | dimensions |
| `lead_acid_specifications.true_height_mm` | True Height | decimal | mm | R | secondary | dimensions |
| `lead_acid_specifications.dry_weight_kg` | Dry Weight | decimal | kg | R | secondary | dry_weight |

## Inverters specification fields

| Storage / field | Label | Type | Unit | R/O | Group | Visibility key |
|---|---|---|---|---|---|---|
| `products.short_warranty_months` | Short Warranty | integer | months | O | main | short_warranty |
| `inverter_specifications.inverter_type` | Type | text | — | O | main | — |
| `inverter_specifications.operating_voltage_v` | Operating Voltage | decimal | V | R | main | operating_voltage |
| `inverter_specifications.rated_capacity_kw` | Rated Capacity | decimal | kW | R | main | rated_capacity |
| `inverter_specifications.phase` | Phase | select | — | R | main | phase |
| `inverter_specifications.pv_capacity_w` | PV Capacity | decimal | W | R | main | pv_capacity |
| `inverter_specifications.mppt_min_vdc` | MPPT Voltage Minimum | decimal | VDC | R | main | mppt_voltage |
| `inverter_specifications.mppt_max_vdc` | MPPT Voltage Maximum | decimal | VDC | R | main | mppt_voltage |
| `inverter_specifications.ip_rating` | IP Rating | text | — | R | main | ip_rating |
| `inverter_specifications.communication_interface` | Communication Interface | text | — | O | main | — |
| `inverter_specifications.depth_mm` | Depth | decimal | mm | R | secondary | dimensions |
| `inverter_specifications.width_mm` | Width | decimal | mm | R | secondary | dimensions |
| `inverter_specifications.height_mm` | Height | decimal | mm | R | secondary | dimensions |
| `inverter_specifications.true_height_mm` | True Height | decimal | mm | R | secondary | dimensions |
| `inverter_specifications.weight_kg` | Weight | decimal | kg | R | secondary | weight |
| `inverter_specifications.wifi` | Wi-Fi | select | — | O | main | wifi |
| `inverter_specifications.bluetooth` | Bluetooth | select | — | O | main | bluetooth |

## Lithium specification fields

| Storage / field | Label | Type | Unit | R/O | Group | Visibility key |
|---|---|---|---|---|---|---|
| `products.short_warranty_months` | Short Warranty | integer | months | O | main | short_warranty |
| `lithium_specifications.model_number` | Model Number | text | — | O | main | — |
| `lithium_specifications.battery_type` | Battery Type | text | — | O | main | — |
| `lithium_specifications.installation_type` | Installation Type | text | — | O | main | — |
| `lithium_specifications.nominal_voltage_v` | Nominal Voltage | decimal | V | R | main | nominal_voltage |
| `lithium_specifications.nominal_capacity_ah` | Nominal Capacity | decimal | Ah | R | main | nominal_capacity |
| `lithium_specifications.nominal_energy_wh` | Nominal Energy | decimal | Wh | R | main | nominal_energy |
| `lithium_specifications.ip_rating` | IP Rating | text | — | R | main | ip_rating |
| `lithium_specifications.communication_interface` | Communication Interface | text | — | O | main | — |
| `lithium_specifications.terminal_type` | Terminal Type | text | — | R | secondary | terminal_type |
| `lithium_specifications.length_mm` | Length | decimal | mm | R | secondary | dimensions |
| `lithium_specifications.width_mm` | Width | decimal | mm | R | secondary | dimensions |
| `lithium_specifications.height_mm` | Height | decimal | mm | R | secondary | dimensions |
| `lithium_specifications.extra_dimension_label` | Extra Dimension Label | text | — | O | secondary | dimensions |
| `lithium_specifications.extra_dimension_mm` | Extra Dimension Value | decimal | mm | O | secondary | dimensions |
| `lithium_specifications.weight_kg` | Weight | decimal | kg | R | secondary | weight |
| `lithium_specifications.charge_voltage_min_v` | Charge / Operating Voltage Minimum | decimal | V | R | main | charge_voltage |
| `lithium_specifications.charge_voltage_max_v` | Charge / Operating Voltage Maximum | decimal | V | R | main | charge_voltage |
| `lithium_specifications.discharge_cutoff_voltage_v` | Discharge Cut-off Voltage | decimal | V | R | main | discharge_cutoff_voltage |
| `lithium_specifications.nominal_charge_current_a` | Nominal Charge Current | decimal | A | R | main | nominal_charge_current |
| `lithium_specifications.max_charge_current_a` | Maximum Charge Current | decimal | A | R | main | max_charge_current |
| `lithium_specifications.nominal_discharge_current_a` | Nominal Discharge Current | decimal | A | R | main | nominal_discharge_current |
| `lithium_specifications.max_continuous_discharge_current_a` | Max Continuous Discharge Current | decimal | A | R | main | max_continuous_discharge_current |
| `lithium_specifications.max_pulse_discharge_current_a` | Max Pulse Discharge Current | decimal | A | R | main | max_pulse_discharge_current |
| `lithium_specifications.pulse_duration_s` | Pulse Duration | decimal | seconds | O | main | max_pulse_discharge_current |
| `lithium_specifications.cycle_life_cycles` | Cycle Life | integer | cycles | R | main | cycle_life |
| `lithium_specifications.cycle_life_conditions` | Cycle Life Conditions | text | — | O | main | cycle_life |
| `lithium_specifications.depth_of_discharge_percent` | Depth of Discharge (DOD) | decimal | % | R | main | depth_of_discharge |
| `lithium_specifications.max_parallel_connections` | Max Parallel Connection | integer | — | R | main | max_parallel_connections |
| `lithium_specifications.max_series_connections` | Max Series Connection | integer | — | R | main | max_series_connections |
| `lithium_specifications.cell_configuration` | Cell Configuration | text | — | R | main | cell_configuration |
| `lithium_specifications.internal_resistance_mohm` | Internal Resistance | decimal | mΩ | R | main | internal_resistance |
| `lithium_specifications.self_discharge_percent` | Self-Discharge Rate | decimal | % | R | main | self_discharge |
| `lithium_specifications.self_discharge_period` | Self-Discharge Period | text | — | R | main | self_discharge |
| `lithium_specifications.charging_temp_min_c` | Charging Temperature Minimum | decimal | °C | R | main | charging_temperature |
| `lithium_specifications.charging_temp_max_c` | Charging Temperature Maximum | decimal | °C | R | main | charging_temperature |
| `lithium_specifications.discharging_temp_min_c` | Discharging Temperature Minimum | decimal | °C | R | main | discharging_temperature |
| `lithium_specifications.discharging_temp_max_c` | Discharging Temperature Maximum | decimal | °C | R | main | discharging_temperature |
| `lithium_specifications.storage_temp_min_c` | Storage Temperature Minimum | decimal | °C | R | main | storage_temperature |
| `lithium_specifications.storage_temp_max_c` | Storage Temperature Maximum | decimal | °C | R | main | storage_temperature |
| `lithium_specifications.operating_humidity` | Operating Humidity | text | — | R | main | operating_humidity |
| `lithium_specifications.max_altitude_m` | Max Operating Altitude | decimal | m | R | main | max_altitude |
| `lithium_specifications.protection` | Protection | text | — | R | main | protection |
| `lithium_specifications.display` | Display | text | — | O | main | display |
| `lithium_specifications.energy_unit` | Energy Input Unit | select | — | R | main | nominal_energy |
| `lithium_specifications.wifi` | Wi-Fi | select | — | O | main | wifi |
| `lithium_specifications.bluetooth` | Bluetooth | select | — | O | main | bluetooth |

## Verification for this upgrade

- Full Laravel suite: 79 tests passed, 588 assertions.
- Existing JavaScript suite: 46 tests passed.
- PHP formatting and Git whitespace checks passed.
- Snapshot comparison: all original product/section/membership/banner field values preserved; all three existing Lead Acid products remain published and grandfathered.
- Existing tracked public UI/admin-branding changes matched the pre-task diff exactly. No public route or frontend implementation was added.
