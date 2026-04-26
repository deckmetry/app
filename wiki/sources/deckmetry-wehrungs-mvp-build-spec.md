---
type: source
original_file: raw/Docs/deckmetry_wehrungs_mvp_build_spec.json
date_ingested: 2026-04-26
source_type: report
entities_mentioned: [Wehrung's, Epicor, Deckmetry BOM Engine]
concepts_mentioned: [Supplier-Embedded Portal, Contractor Discount Model, B2B2C Lead Funnel, BOM Generation, Phased ERP Integration, Pilot Validation Framework]
---

# Deckmetry Wehrung's MVP Build Spec

## Summary

A structured JSON build specification for the Wehrung's MVP. Defines roles, dashboard menus, contractor creation flow, catalog management, status pipeline, deck calculator inputs/outputs, database schema, and phased build priorities. This is the authoritative MVP scope document.

## Key Takeaways

1. **Single-supplier pilot is the explicit strategy** — MVP is Wehrung's only. Multi-supplier is future. Database uses `supplier_id` for future expansion without MVP complexity.
2. **Contractors are supplier-invited, not self-signup** — Wehrung's salespeople create contractor credentials. Contractors cannot register themselves. Fundamentally supply-controlled.
3. **Homeowners have no portal in MVP** — They are CRM lead records only (website, in-store, manual phone/email). No homeowner dashboard until Phase 2.
4. **Contractor discount = single % applied globally** — One discount percentage per contractor against catalog base price. Full price snapshot required on every order.
5. **10-stage unified status pipeline** — `draft → submitted → revision_requested → approved → scheduled → shipped → delivered → completed → paid → canceled_lost`.
6. **Duplicate project feature is MVP** — Copy dimensions + material selections, recalculate at current catalog price + current contractor discount. Do not copy old status/payment/delivery.
7. **Reports are Phase 1, not future** — Quote-to-order conversion rate, sales by contractor/salesperson, most popular brand/color/collection, product demand insights.
8. **Phase 2 explicitly deferred** — Embedded homeowner calculator, email notifications, PDF export, Epicor integration, multi-supplier architecture, homeowner portal.

## Notable Data Points or Quotes

- Claude Code prompt included: *"Do not build a multi-supplier marketplace yet, but structure the database with supplier_id fields so multi-supplier support can be added later."*
- Price snapshot columns on `project_items`: `sku_snapshot`, `description_snapshot`, `unit_snapshot`, `base_price_snapshot`, `discount_percentage_snapshot`, `final_unit_price_snapshot` — all frozen at order time.
- Discount example: catalog price $100 × 12% discount = contractor price $88.
- Duplicate project: pricing recalculates at current catalog price + current contractor discount (not frozen to original).
- Catalog groups: Framing, Decking, Railing, Fascia, Hardware, Footings/Concrete, Lighting, Accessories, Fasteners, Trim, Stairs.
- Supplier dashboard menu: Contractors | Homeowners/Leads | Catalog | Reports.
- Contractor dashboard menu: Projects | New Project | Orders/History | Account (simplified MVP: Projects | Account).

## Competitive Signals

- Supplier-controlled contractor onboarding (vs. self-serve SaaS) is a deliberate lock-in strategy — contractors need the supplier to activate them.
- The "make contractors faster" value prop is the loyalty mechanism. Speed = less reason to price-shop competitors.
- Reports dashboard gives Wehrung's purchasing intelligence (trending colors, collections, brands) — differentiator vs. manual email ordering.

## What This Changes or Confirms in the Wiki

- **Confirms** single-supplier-first go-to-market from context pack.
- **Adds** contractor discount model as a new concept (not in context pack).
- **Clarifies** homeowner MVP scope: lead record only, no portal.
- **Updates** status pipeline: 10 stages vs. 6 in context pack — use 10-stage as authoritative.
- **Adds** database schema detail for price snapshot pattern.
- **Adds** duplicate project as a named contractor feature.

## Links to Updated Wiki Pages

- [Wehrung's](../entities/wehrungs.md) — updated with MVP scope detail
- [Contractor Discount Model](../concepts/contractor-discount-model.md) — new concept
- [Supplier-Embedded Portal](../concepts/supplier-embedded-portal.md) — updated with role/onboarding detail
- [B2B2C Lead Funnel](../concepts/b2b2c-lead-funnel.md) — updated with homeowner-as-lead-only clarification
- [Pilot Validation Framework](../concepts/pilot-validation-framework.md) — updated with phase 1/2 build split
