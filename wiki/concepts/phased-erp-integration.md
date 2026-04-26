---
type: concept
sources: [deckmetry-context-pack.md, deckmetry-wehrungs-mvp-build-spec.md]
last_updated: 2026-04-26
---

# Phased ERP Integration

## Definition

Phased ERP integration is the deliberate strategy of deferring deep enterprise resource planning (ERP) system connectivity until after pilot validation, instead starting with structured data exports and manual handoff workflows. In Deckmetry's context, this means Epicor (Wehrung's ERP) is not a pilot blocker — the MVP works alongside Epicor without touching it.

## Strategic Importance

ERP integration is the most common reason supplier-side software pilots fail or stall: IT requirements, API access restrictions, security reviews, and data mapping complexity can add months and kill momentum before the product has proven its value.

The phased approach separates the business validation question ("does this create value?") from the technical integration question ("how do we connect the systems?"). By answering the first question first, Deckmetry avoids the situation where Epicor integration becomes a prerequisite for even testing the product.

## How It Appears in the Data

### 4-Phase Integration Roadmap

| Phase | Integration level | What Deckmetry does | What Wehrung's does manually |
|-------|------------------|---------------------|------------------------------|
| 1 — Pilot | None | Generates structured BOMs, PDFs, CSVs, admin review dashboard | Enter/process orders in Epicor as usual |
| 2 — Discovery | Evaluation | Works with IT to assess API access, catalog export, pricing tables, import workflows | Provides IT access, sandbox environment |
| 3 — Partial | Selective sync | Product catalog sync, price sync, customer/pricing tier sync, inventory lookup, quote/order export | Reviews imported data, handles exceptions |
| 4 — Deep | Full integration | Creates Epicor quote from Deckmetry, converts to order, syncs status + delivery + invoices back | Minimal manual work |

### Integration Principles

1. Do not promise real-time pricing unless confirmed (Phase 3+)
2. Do not promise real-time inventory unless confirmed (Phase 3+)
3. Do not make Epicor integration a pilot blocker
4. Use SKU consistency as the integration foundation — SKUs are the join key between Deckmetry and Epicor
5. Make exports clean enough for manual processing
6. Get IT involved early but keep MVP scope controlled

### Pilot-Safe Message

> "For the first pilot, Deckmetry does not need to directly write into Epicor. We can generate clean, structured BOMs and order requests for your team to review. During the pilot, we can work with IT to identify the best integration path."

### Key Open Questions for Phase 2 Discovery

- Does Wehrung's Epicor version expose API access?
- Can product SKUs be exported (format + frequency)?
- Can contractor-specific pricing be retrieved?
- Can inventory availability be queried in real-time?
- Can orders or quotes be created through API or CSV import?
- Are there middleware tools already in use?
- What security/permission requirements apply?

## Deckmetry Implications

- Phase 1 must include: structured BOM export (CSV), PDF export, clean SKU list on every order — these are the foundation for Phase 3 integration
- SKU discipline in the Deckmetry catalog (matching Epicor SKUs exactly) is the single most important Phase 1 groundwork for future integration
- The catalog tab in the supplier dashboard (where Wehrung's manages products) should include an `epicor_product_id` or equivalent field for future mapping
- Real-time pricing and inventory availability are the highest-value Phase 3 features — they transform Deckmetry from a structured request tool into a live ordering system

## Related Concepts

- [Supplier-Embedded Portal](supplier-embedded-portal.md) — The product context in which ERP integration matters
- [Pilot Validation Framework](pilot-validation-framework.md) — Integration discovery is a Phase 2 pilot activity
- [BOM Generation](bom-generation.md) — BOM export quality is the Phase 1 foundation for Phase 3 integration

## Related Entities

- [Epicor](../entities/epicor.md) — The specific ERP being integrated with at Wehrung's
- [Wehrung's](../entities/wehrungs.md) — The Epicor customer and Deckmetry pilot partner

## Source References

- [Deckmetry Context Pack](../sources/deckmetry-context-pack.md)
- [Deckmetry Wehrung's MVP Build Spec](../sources/deckmetry-wehrungs-mvp-build-spec.md)
