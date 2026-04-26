---
type: concept
sources: [deckmetry-context-pack.md, deckmetry-wehrungs-mvp-build-spec.md]
last_updated: 2026-04-26
---

# Pilot Validation Framework

## Definition

The Pilot Validation Framework is Deckmetry's structured approach to proving product-market fit with a single supplier before expanding to a multi-supplier model. It is a paid, time-bounded engagement with Wehrung's designed to answer: "Does this create measurable value for suppliers, contractors, and homeowners?"

The pilot is explicitly positioned as a **paid validation of a new sales channel**, not free custom software development.

## Strategic Importance

A disciplined pilot framework serves multiple purposes:
- **De-risks product bets** — validates BOM accuracy, contractor adoption, and homeowner lead quality before building Phase 2 features
- **Establishes commercial precedent** — a paid pilot signals the product is real and valuable, not a favor
- **Identifies integration requirements** — especially what Epicor integration actually needs to look like
- **Generates data** — usage metrics, conversion rates, and feedback that justify the full commercial agreement
- **Protects IP** — pilot agreement clarifies that Deckmetry retains platform ownership

## How It Appears in the Data

### Pilot Structure (4 Phases)

| Phase | Activities | Timing |
|-------|-----------|--------|
| Phase 0 — Discovery | Confirm product categories, pricing assumptions, contractor workflow, admin review requirements, Epicor limitations | Before build |
| Phase 1 — MVP Build | Homeowner path, contractor path, admin dashboard, BOM generation, export/email, basic pricing, status workflow | Build period |
| Phase 2 — Live Pilot | Launch with 3–5 contractors, embed/link from website, test homeowner leads, collect feedback biweekly, track usage | 60–90 days |
| Phase 3 — Review | Present metrics, identify integration needs, define full version scope, decide pricing model and rollout | End of pilot |

### Pilot Success Criteria

A successful pilot proves at least some of:
- Contractors find it faster than manual takeoff/email workflow
- Homeowners submit qualified leads
- Wehrung's receives cleaner order requests
- Sales team can review and confirm without friction
- BOM accuracy is acceptable after admin review
- Value justifies a paid full version
- Epicor integration requirements become clear

### Validation Metrics to Track

- Number of homeowner sessions and BOMs generated
- Number of labor quote requests
- Number of contractor accounts invited and active
- Number of contractor projects created and submitted
- Number of confirmed orders
- Average order value
- Time saved vs. email workflow
- Number of admin revisions per BOM
- Product selection trends (brand/color/collection popularity)
- Feedback scores from sales team and contractors

### Pilot Pricing Options

| Option | Description | When to use |
|--------|-------------|-------------|
| A — Low-friction | Lower upfront fee | Want fast yes; risk: underpricing |
| B — Serious paid | Mid-level pilot fee (several thousand to low five figures) | Directors + IT involved; signals real product |
| C — Custom enterprise | Higher fee with deeper customization | Wehrung's wants exclusivity or roadmap influence |

### Build Phase Split (from MVP Spec)

**Phase 1 (must build first):**
Authentication, supplier + contractor dashboards, contractor creation, discount assignment, catalog management, deck calculator, BOM/quote generation, status workflow, project list + detail, supplier view of contractor projects, homeowner lead list + manual creation, lead assignment, reports dashboard.

**Phase 2 (after validation):**
Website-embedded homeowner calculator, email notifications, PDF export, contractor invite email automation, advanced inventory logic, Epicor integration, payment automation, delivery scheduling, multi-supplier architecture, homeowner portal, multi-member supplier team permissions.

## Deckmetry Implications

- The pilot is the revenue gate for Phase 2 features — don't build Phase 2 before pilot validation
- IP ownership must be clarified in the pilot agreement before signing
- 3–5 contractors is the right pilot cohort size — enough to see patterns, small enough to manage feedback
- Biweekly feedback collection during the live pilot is important for rapid iteration
- The pilot should not promise real-time Epicor pricing or inventory

## Related Concepts

- [Supplier-Embedded Portal](supplier-embedded-portal.md) — The product being validated
- [B2B2C Lead Funnel](b2b2c-lead-funnel.md) — The demand flow being tested
- [Phased ERP Integration](phased-erp-integration.md) — The integration path being discovered during the pilot

## Related Entities

- [Wehrung's](../entities/wehrungs.md) — The pilot partner

## Source References

- [Deckmetry Context Pack](../sources/deckmetry-context-pack.md)
- [Deckmetry Wehrung's MVP Build Spec](../sources/deckmetry-wehrungs-mvp-build-spec.md)
