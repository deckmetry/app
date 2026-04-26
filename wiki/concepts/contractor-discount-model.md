---
type: concept
sources: [deckmetry-wehrungs-mvp-build-spec.md]
last_updated: 2026-04-26
---

# Contractor Discount Model

## Definition

The contractor discount model is Deckmetry's pricing architecture for supplier-contractor relationships. Each contractor has a single percentage discount applied against the supplier's catalog base price. The discounted price is calculated at quote time and frozen into a price snapshot on every project/order — so historical quotes and orders never change if catalog prices are updated later.

## Strategic Importance

The discount model is the mechanism that makes the supplier-embedded portal valuable to contractors. Contractors who log in see *their price*, not retail. This:
- Gives contractors a reason to use the portal (vs. calling or emailing)
- Keeps contractor pricing confidential from homeowners (who see estimated retail)
- Allows the supplier to differentiate pricing by contractor relationship/volume
- Creates a record of exactly what price was offered at the moment of quoting (critical for dispute resolution and accounting)

## How It Appears in the Data

### Discount Calculation

```
contractor_price = catalog_base_price × (1 - discount_percentage / 100)

Example:
catalog_base_price  = $100.00
discount_percentage = 12%
contractor_price    = $88.00
```

### Price Snapshot Pattern

Every `project_items` row stores a complete price snapshot at the moment the quote/order is created:

| Field | Value frozen at order time |
|-------|--------------------------|
| `sku_snapshot` | Exact SKU |
| `description_snapshot` | Product description |
| `unit_snapshot` | Unit of measure |
| `base_price_snapshot` | Catalog price at time of quote |
| `discount_percentage_snapshot` | Contractor's discount % at time of quote |
| `final_unit_price_snapshot` | Calculated contractor price |
| `quantity` | BOM quantity |
| `line_total` | `final_unit_price_snapshot × quantity` |

**Why snapshots are required**: Catalog prices change. If a contractor submitted a quote last month and the catalog price updates today, the old quote must show the original price — otherwise historical records become inaccurate and trust breaks down.

### Duplicate Project Pricing Behavior

When a contractor duplicates a past project, prices **recalculate** using:
- Current catalog base price (not the original snapshot)
- Contractor's current discount percentage (not the snapshot)

This is intentional — a duplicate is a new project, not a resubmission of the old one.

### Discount Assignment

- Assigned by Wehrung's salesperson when creating the contractor account
- Stored on the `contractors` table as `discount_percentage`
- Default scope: applies to all catalog items (item-level discount rules are a future feature)
- Can be edited by the supplier admin

### Pricing Modes

| User | Price shown | Label |
|------|-------------|-------|
| Homeowner (Phase 2 calculator) | Estimated retail | "Estimated material cost — subject to review" |
| Contractor (logged in) | `catalog_price × (1 - discount%)` | Contractor-specific price |
| Supplier admin | Both | Can see and override either |

## Deckmetry Implications

- The `discount_percentage` field on the contractor record is simple but effective for MVP — avoid item-level pricing complexity until validated
- Price snapshots are non-negotiable for legal and accounting integrity — never recalculate historical line items from current catalog prices
- The supplier must be able to update a contractor's discount at any time (effective on future quotes only, not past ones)
- Future: contractor pricing tiers, volume-based discounts, brand-specific discounts, promotional pricing windows

## Related Concepts

- [Supplier-Embedded Portal](supplier-embedded-portal.md) — The portal context where pricing is displayed
- [B2B2C Lead Funnel](b2b2c-lead-funnel.md) — Contractor pricing is a key retention mechanism in the funnel
- [BOM Generation](bom-generation.md) — BOM quantities × unit prices = quote total

## Related Entities

- [Wehrung's](../entities/wehrungs.md) — Assigns and manages contractor discounts

## Source References

- [Deckmetry Wehrung's MVP Build Spec](../sources/deckmetry-wehrungs-mvp-build-spec.md)
