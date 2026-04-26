---
type: entity
category: company
role: customer
aliases: [Wehrung's, Wehrungs, Wehrung's Lumber]
sources: [deckmetry-context-pack.md, deckmetry-wehrungs-mvp-build-spec.md]
last_updated: 2026-04-26
---

# Wehrung's

## Overview

Wehrung's is a building material supplier (lumberyard/dealer) and the first pilot customer for Deckmetry. They have already seen the Deckmetry prototype, expressed strong interest, and requested a follow-up presentation with their IT team and directors. Their adoption of Deckmetry would serve as the product's first live validation with real salespeople, contractors, and homeowners.

## Key Facts

- **Industry**: Building material supply (deck materials, lumber, hardware)
- **ERP System**: Epicor (see [Epicor](epicor.md))
- **Decision makers**: IT team + directors (next meeting pending as of April 2026)
- **Current ordering workflow**: Manual — contractor creates takeoff → emails BOM to Wehrung's → Wehrung's checks pricing/availability → back-and-forth → delivery coordination
- **Staff using Deckmetry**: Salespeople (admin users) who manage contractor accounts, review leads, and confirm orders
- **Pilot structure**: 60–90 days post-launch, paid validation fee (low-to-mid five figures)
- **Branding question open**: Branded as Wehrung's, Deckmetry, or co-branded — to be confirmed

## MVP Scope for Wehrung's

Per the MVP Build Spec, Wehrung's deployment includes:

**Supplier Dashboard** (menu: Contractors | Homeowners/Leads | Catalog | Reports):
- Salesperson creates and manages contractor accounts (supplier-invited model — contractors do not self-register)
- Assigns per-contractor discount percentage against catalog base price
- Manages product catalog (groups, SKUs, prices, stock status)
- Reviews homeowner leads (website, in-store, manual entry)
- Assigns homeowner leads to contractors
- Views reports: sales by contractor/salesperson, quote-to-order conversion, product popularity

**Contractor experience** (invited by supplier):
- Logs in with credentials created by Wehrung's salesperson
- Creates deck projects using calculator
- Sees contractor-specific discounted pricing
- Submits orders to Wehrung's for review
- Tracks project/order status

**Homeowner experience** (MVP): Lead record only. No portal. Sources: website calculator, in-store entry, manual phone/email.

## Strategic Relevance

Wehrung's is Deckmetry's revenue-proving pilot. A successful 60–90 day pilot validates: (1) contractors adopt the portal, (2) homeowners submit qualified leads, (3) Wehrung's can shorten quote-to-order time, (4) BOM accuracy is acceptable for sales review. Success here unlocks the multi-supplier expansion model.

Wehrung's also represents the category of supplier that Deckmetry is built for: mid-market lumberyards with a contractor customer base and no current digital ordering channel. There are thousands of such suppliers in North America.

## IP / Exclusivity Notes

Deckmetry retains platform IP. Wehrung's participates as a pilot partner. Any exclusivity or white-label arrangement requires a separate commercial agreement. This was explicitly documented to prevent scope creep.

## Activity Log

- **2026-04 (before April 26)**: Wehrung's saw the Deckmetry prototype. Strong interest. Requested follow-up meeting with IT + directors.
- **2026-04-26**: Context pack and MVP build spec ingested. Active sales opportunity confirmed.

## Related Entities

- [Epicor](epicor.md) — Their ERP system; integration target for Phase 2+
- [Deckmetry BOM Engine](deckmetry-bom-engine.md) — Powers the calculator Wehrung's will embed

## Related Concepts

- [Supplier-Embedded Portal](../concepts/supplier-embedded-portal.md) — The deployment model for Wehrung's
- [Pilot Validation Framework](../concepts/pilot-validation-framework.md) — 60–90 day paid pilot structure
- [B2B2C Lead Funnel](../concepts/b2b2c-lead-funnel.md) — Homeowner → Contractor → Supplier lead chain
- [Phased ERP Integration](../concepts/phased-erp-integration.md) — How Epicor integration is sequenced
- [Contractor Discount Model](../concepts/contractor-discount-model.md) — Per-contractor % discount applied to catalog

## Source References

- [Deckmetry Context Pack](../sources/deckmetry-context-pack.md)
- [Deckmetry Wehrung's MVP Build Spec](../sources/deckmetry-wehrungs-mvp-build-spec.md)
