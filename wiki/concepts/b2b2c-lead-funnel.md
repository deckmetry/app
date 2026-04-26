---
type: concept
sources: [deckmetry-context-pack.md, deckmetry-wehrungs-mvp-build-spec.md]
last_updated: 2026-04-26
---

# B2B2C Lead Funnel

## Definition

The B2B2C (Business-to-Business-to-Consumer) lead funnel describes how Deckmetry converts homeowner demand into supplier revenue by routing leads through contractors. The supplier (Wehrung's) is Deckmetry's customer; contractors are the repeat users; homeowners are the demand source and the end consumer.

The funnel: **Homeowner curiosity → BOM/estimate → Lead record → Salesperson assigns → Contractor receives → Material order → Supplier revenue**

## Strategic Importance

This funnel is Deckmetry's demand engine. Without it, Deckmetry is just a contractor ordering portal (valuable but limited). With it, Deckmetry becomes a lead generation system for the supplier — capturing demand at the earliest possible moment (when a homeowner is researching, before they've even talked to a contractor).

The funnel creates three compounding network effects:
1. More homeowner leads → more contractor activity → more supplier revenue
2. More contractor adoption → more homeowners referred → more leads
3. Better data on material demand → better purchasing decisions → better inventory → more contractor loyalty

## How It Appears in the Data

### Homeowner Lead Sources (MVP)

| Source | Description |
|--------|-------------|
| Website calculator | Homeowner uses public-facing deck configurator; BOM + contact info submitted |
| In-store | Wehrung's salesperson creates lead manually during an in-store conversation |
| Manual phone/email | Salesperson enters a lead from a phone call or email inquiry |

### Lead Record Fields

`homeowners_leads` table: `supplier_id`, `assigned_salesperson_id`, `assigned_contractor_id`, `name`, `email`, `phone`, `address`, `source`, `project_description`, `estimated_value`, `status`, `notes`

### Lead Statuses

| Status | Meaning |
|--------|---------|
| New | Created, not reviewed |
| Contacted | Salesperson reached out to homeowner |
| Redirected to Contractor | Salesperson assigned lead to a contractor |
| Closed Won | Lead became a material order |
| Lost | Did not move forward |

### Lead Assignment Logic

Salesperson selects a contractor from their contractor list and assigns the lead. Contractor only sees the homeowner lead *after* it is assigned to them. Status becomes "Redirected to Contractor."

### MVP vs. Future Homeowner Experience

| Version | Homeowner experience |
|---------|---------------------|
| MVP (Phase 1) | Lead record only. No homeowner portal. Salesperson-managed. |
| Phase 2 | Website-embedded calculator. Homeowner submits their own BOM. Lead auto-created. |
| Future | Homeowner portal. Saved projects. Contractor connection marketplace. |

### Homeowner CTAs (Phase 2 website calculator)

- "Send My Material List"
- "Request Pro Pricing for Labor"
- "Talk to a Deck Specialist"
- "Have Wehrung's Review This Project"

## Deckmetry Implications

- Homeowners are **not users in MVP** — they are CRM records. No login, no portal, no self-service.
- The value of the homeowner funnel to Wehrung's is lead quality, not volume. A homeowner who has already configured a deck with specific materials is a far warmer lead than a phone inquiry.
- Contractor adoption is the prerequisite for homeowner lead assignment to be useful — if Wehrung's has no contractors on the platform, assigned leads go nowhere.
- Homeowner-facing features (website calculator) are Phase 2, after contractor + supplier workflows are validated.
- Future: homeowner-to-contractor marketplace where homeowners can request quotes from multiple contractors — a significant platform expansion.

## Related Concepts

- [Supplier-Embedded Portal](supplier-embedded-portal.md) — The platform context in which the funnel operates
- [Pilot Validation Framework](pilot-validation-framework.md) — How the funnel's effectiveness is being measured
- [BOM Generation](bom-generation.md) — The BOM is what makes homeowner leads valuable (pre-qualified with material specs)
- [Contractor Discount Model](contractor-discount-model.md) — Contractor pricing that makes the portal attractive enough for contractors to use

## Related Entities

- [Wehrung's](../entities/wehrungs.md) — The supplier that benefits from the funnel
- [Deckmetry BOM Engine](../entities/deckmetry-bom-engine.md) — Generates the BOM that qualifies homeowner leads

## Source References

- [Deckmetry Context Pack](../sources/deckmetry-context-pack.md)
- [Deckmetry Wehrung's MVP Build Spec](../sources/deckmetry-wehrungs-mvp-build-spec.md)
