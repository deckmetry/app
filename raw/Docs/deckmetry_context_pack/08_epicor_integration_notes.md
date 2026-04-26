# 08 — Epicor Integration Notes

## Context

Wehrung's currently uses Epicor as their main system. The Deckmetry pilot must respect this reality, but should not depend on full Epicor integration for the first validation phase.

## Recommended approach

### Phase 1 — No hard integration required

For the pilot, Deckmetry can operate independently and provide:
- Structured project requests.
- BOM export as PDF.
- BOM export as CSV.
- SKU and quantity list.
- Admin review dashboard.
- Email notifications.

Wehrung's staff can manually enter or process the order in Epicor as they do today.

This reduces risk and allows the pilot to start faster.

### Phase 2 — Integration discovery

During the pilot, Deckmetry team and Wehrung's IT should evaluate:
- Does their Epicor version expose API access?
- Are product SKUs accessible?
- Can customer-specific pricing be retrieved?
- Can inventory availability be retrieved?
- Can orders or quotes be created through API?
- Are there CSV/import workflows?
- Are there middleware tools already used by Wehrung's?
- What security/permission requirements exist?

### Phase 3 — Partial integration

Possible first integration points:
- Product catalog sync.
- Price sync.
- Customer account/pricing tier sync.
- Inventory availability lookup.
- Quote/order export.
- Delivery status sync.

### Phase 4 — Deeper integration

Future integration:
- Create Epicor quote from Deckmetry.
- Convert quote to order.
- Sync order status back to Deckmetry.
- Sync delivery schedule.
- Sync invoices/payments if needed.

## Integration principles

1. Do not promise real-time pricing unless confirmed.
2. Do not promise real-time inventory unless confirmed.
3. Avoid making Epicor integration a blocker for pilot validation.
4. Use SKU consistency as the foundation.
5. Make exports clean enough for manual processing.
6. Get IT involved early but keep MVP scope controlled.

## Questions for Wehrung's IT

- Which Epicor product/version are you using?
- Does your Epicor environment have API access enabled?
- Do you currently integrate Epicor with any e-commerce, CRM, or third-party quoting tools?
- Can we access a product catalog export?
- Can we access customer-specific pricing tables?
- Can we import quotes/orders from CSV?
- Do you have sandbox/test environment access?
- Who controls API credentials and permissions?
- Are there compliance/security requirements we need to follow?
- What is the preferred workflow for turning a BOM into an internal quote/order?

## Pilot-safe message to Wehrung's

> For the first pilot, Deckmetry does not need to directly write into Epicor. We can generate clean, structured BOMs and order requests for your team to review. During the pilot, we can work with IT to identify the best integration path, whether that is API-based, CSV import, or a staged product/pricing sync.
