---
type: concept
sources: [deckmetry-context-pack.md, deckmetry-wehrungs-mvp-build-spec.md]
last_updated: 2026-04-26
---

# Supplier-Embedded Portal

## Definition

A supplier-embedded portal is a digital ordering and lead-generation platform that lives on or within a building material supplier's website, branded (fully or co-branded) as the supplier's own product experience. In Deckmetry's model, the platform is accessed through two entry points on the supplier's site — one for homeowners and one for contractors — with all data scoped to that supplier's catalog, pricing, and contractor network.

This is the opposite of a standalone consumer SaaS (like a general deck estimator). The supplier controls the experience, the product catalog, the contractor list, and the pricing.

## Strategic Importance

The supplier-embedded model is Deckmetry's core go-to-market architecture. It determines:
- **Who the paying customer is**: the supplier (Wehrung's), not the contractor or homeowner
- **What the value prop is**: more leads, faster contractor orders, cleaner internal requests — supplier-facing benefits
- **What the lock-in mechanism is**: contractors become dependent on the portal because it's where their supplier's pricing lives; switching suppliers means losing the portal
- **What the expansion model is**: one supplier per deployment, with the multi-supplier marketplace as a future phase

## How It Appears in the Data

### MVP Architecture (Wehrung's Pilot)

```
supplier_id = wehrungs_id  (scoped to all data)
├── Supplier Dashboard
│   ├── Contractors tab (salesperson manages contractor accounts)
│   ├── Homeowners/Leads tab (lead CRM)
│   ├── Catalog tab (product groups + SKUs + pricing)
│   └── Reports tab (sales analytics)
└── Contractor Dashboard
    ├── Projects (create, view, submit, duplicate)
    └── Account
```

### Role Hierarchy

| Role | Created by | Portal access |
|------|-----------|---------------|
| Supplier Admin/Salesperson | Self (system admin) | Full supplier dashboard |
| Contractor | Supplier salesperson | Contractor dashboard only |
| Homeowner | No portal — lead record only | None (MVP) |

### Key Architectural Decision

The database includes `supplier_id` on all tables (suppliers, contractors, catalog_items, projects, etc.) so that multi-supplier support can be added later without schema changes. MVP deploys a single `supplier_id` = Wehrung's.

## Deckmetry Implications

- Product experience should *feel like a custom Wehrung's portal*, not a generic SaaS — per build spec
- Contractors cannot self-register; they are invited by the supplier salesperson. This is a deliberate lock-in: the supplier controls who has access
- Homeowners are leads, not users — their "experience" is the public-facing calculator that generates a lead record
- The embedded/linked entry point from Wehrung's website is a Phase 2 feature; Phase 1 focuses on authenticated supplier + contractor dashboards
- Future white-label capability allows deploying the same codebase for other suppliers with their own branding, catalog, and contractors

## Related Concepts

- [Pilot Validation Framework](pilot-validation-framework.md) — How the Wehrung's deployment is being validated
- [B2B2C Lead Funnel](b2b2c-lead-funnel.md) — The demand flow the portal enables
- [Contractor Discount Model](contractor-discount-model.md) — How contractor-specific pricing works within the portal
- [Phased ERP Integration](phased-erp-integration.md) — How the portal connects to the supplier's ERP over time

## Related Entities

- [Wehrung's](../entities/wehrungs.md) — First supplier to deploy the embedded portal
- [Epicor](../entities/epicor.md) — ERP the portal will eventually integrate with

## Source References

- [Deckmetry Context Pack](../sources/deckmetry-context-pack.md)
- [Deckmetry Wehrung's MVP Build Spec](../sources/deckmetry-wehrungs-mvp-build-spec.md)
