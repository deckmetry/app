---
type: entity
category: tool
role: partner
aliases: [Epicor ERP, Epicor Kinetic]
sources: [deckmetry-context-pack.md, deckmetry-wehrungs-mvp-build-spec.md]
last_updated: 2026-04-26
---

# Epicor

## Overview

Epicor is an enterprise resource planning (ERP) system used by Wehrung's as their primary business system. It handles inventory, pricing, customer accounts, quoting, ordering, and fulfillment. Epicor integration is a known constraint in the Deckmetry pilot — it is intentionally deferred to Phase 2+ via a 4-phase integration strategy.

## Key Facts

- **Vendor**: Epicor Software Corporation
- **Category**: ERP / business management platform common in manufacturing, distribution, and building materials
- **Used by**: Wehrung's (as of April 2026)
- **Specific version**: Unknown — to be confirmed with Wehrung's IT
- **API access**: Unknown — a key open question for Phase 2 planning
- **Current integrations at Wehrung's**: Unknown

## 4-Phase Integration Strategy

The context pack documents a deliberate phased approach to avoid Epicor becoming a pilot blocker:

| Phase | Description | Timing |
|-------|-------------|--------|
| Phase 1 | No hard integration. Deckmetry operates independently. Structured BOM exports (PDF/CSV) for manual processing by Wehrung's staff. | MVP / Pilot |
| Phase 2 | Discovery: evaluate API access, product catalog export, pricing export, CSV import workflows, security requirements. | During pilot |
| Phase 3 | Partial integration: product catalog sync, price sync, contractor pricing tier sync, inventory availability lookup, quote/order export. | Post-pilot |
| Phase 4 | Deep integration: create Epicor quote from Deckmetry, convert to order, sync order status back, sync delivery schedule, sync invoices/payments. | Future roadmap |

## Open Questions for Wehrung's IT

- Which Epicor product/version is in use?
- Does their environment have API access enabled?
- Do they currently integrate Epicor with any e-commerce, CRM, or quoting tools?
- Can a product catalog be exported? In what format?
- Can customer-specific pricing tables be accessed?
- Can quotes/orders be imported from CSV?
- Is there a sandbox/test environment?
- Who controls API credentials and permissions?
- What are the compliance/security requirements?

## Strategic Relevance

Epicor is the primary technical risk and the primary Phase 2 value unlock for Deckmetry's Wehrung's pilot. If Epicor API access exists and is usable, Deckmetry can offer real-time pricing, real-time inventory, and automated order creation — dramatically increasing value. If not, Deckmetry operates as a structured request layer with manual handoff, which is still a large improvement over current email workflows.

The deliberate "Epicor is not a pilot blocker" framing is essential sales strategy — it lets Wehrung's IT say yes to a pilot without committing to an ERP integration project.

## Activity Log

- **2026-04-26**: Identified as the ERP integration target for Wehrung's pilot. 4-phase integration strategy documented.

## Related Entities

- [Wehrung's](wehrungs.md) — The Epicor customer and Deckmetry's first pilot partner

## Related Concepts

- [Phased ERP Integration](../concepts/phased-erp-integration.md) — The strategy for sequencing Epicor integration
- [Supplier-Embedded Portal](../concepts/supplier-embedded-portal.md) — The product context in which Epicor integration matters

## Source References

- [Deckmetry Context Pack](../sources/deckmetry-context-pack.md)
- [Deckmetry Wehrung's MVP Build Spec](../sources/deckmetry-wehrungs-mvp-build-spec.md)
