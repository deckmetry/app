# 13 — Master Prompt for v0.app or Developer

Use this prompt to generate or refine the Deckmetry prototype.

---

Build a modern web application prototype called **Deckmetry** for a building material supplier such as Wehrung's. The app is a deck material takeoff, BOM, pricing, lead capture, contractor portal, and admin review platform.

The app should be designed around three user experiences:

## 1. Homeowner Experience

The homeowner enters from Wehrung's website and chooses “Homeowner.”

The homeowner should be guided through:
- Deck width
- Deck length/projection
- Deck height
- Attached or freestanding
- Railing sides
- Stairs
- Decking brand, collection, and color
- Railing type and color
- Options such as fascia, skirting, lighting, and fasteners

After inputs are completed, the system generates:
- Material list / BOM
- Estimated material price
- Summary of selected products
- Disclaimer that pricing, availability, and quantities are subject to Wehrung's review

Before final BOM delivery, capture:
- Name
- Email
- Phone
- Address or ZIP code

Include CTAs:
- Send My Material List
- Request Pro Pricing for Labor
- Talk to a Deck Specialist

When the homeowner submits, Wehrung's admin should receive the lead in the admin dashboard.

## 2. Contractor Portal

The contractor enters from Wehrung's website and chooses “Contractor Portal.”

Contractor dashboard should include:
- New Project
- Drafts
- Requested Orders
- Confirmed Orders
- Scheduled Deliveries
- Completed Projects

Contractor new project flow should include:
- Project name
- Jobsite address
- Deck width
- Deck length/projection
- Deck height
- Joist spacing, with 12” O.C. default and 16” O.C. optional
- Attached/freestanding
- Railing sides
- Stair details
- Decking brand, collection, color
- Railing type/color
- Delivery preference/requested date

The system should generate:
- BOM
- Contractor-specific pricing
- Estimated total
- Export/download option
- Submit for Wehrung's Review button

Project statuses:
- Draft
- Requested
- Received
- Confirmed
- Scheduled
- Complete

## 3. Admin/Sales Portal

Wehrung's admin dashboard should show:
- New homeowner leads
- New contractor requests
- Requests needing review
- Scheduled deliveries
- Completed projects

Admin should be able to:
- Open a lead/request
- Review project inputs
- Review BOM
- Edit quantities
- Substitute products
- Add notes
- Confirm availability
- Confirm or propose delivery date
- Move project through statuses
- Export BOM as CSV/PDF

## Design requirements

Use a clean, professional, modern interface appropriate for a building supplier and contractors. It should feel practical, not gimmicky.

Suggested visual style:
- White/light background
- Strong black or dark charcoal text
- Warm accent color inspired by lumber/construction
- Clear cards
- Large buttons
- Simple dashboard tables
- Progress/status badges
- BOM table with categories and totals
- Mobile-friendly but desktop-first for contractor/admin use

## Important disclaimers

Include language:
“Material quantities and pricing are generated based on the information provided and standard estimating assumptions. Final quantities, pricing, availability, and delivery dates are subject to Wehrung's review and confirmation.”

Also include:
“Framing quantities are generated from standard estimating assumptions and must be reviewed for code, span, load, and site-specific conditions.”

## Product assumptions

Support product categories:
- Decking
- Fascia
- Framing
- Railing
- Stairs
- Fasteners
- Foundation/concrete
- Lighting/options
- Skirting/accessories

Decking brands may include:
- Trex
- TimberTech
- Deckorators

Railing may include:
- Vinyl
- Composite
- Aluminum
- Cable
- RDI Finyl Line white with black round balusters as one example option

## BOM logic assumptions

The app should visually show that it calculates:
- Deck boards based on deck dimensions and board coverage
- Joists based on spacing
- Railing kits using 6 ft and 8 ft sections where possible
- Fasteners rounded to package quantity
- Concrete/foundation products rounded to sellable units
- Waste factor for decking/framing/fascia

This prototype does not need full engineering accuracy. It should show the workflow and structure.

## Epicor integration note

Include an admin/integration settings screen or section showing:
- Epicor integration: Future/Discovery
- CSV export available for pilot
- Product catalog sync future
- Pricing sync future
- Order/quote creation future

The message should be that Epicor integration is phased and not required for MVP.

## Goal of the prototype

The prototype should clearly communicate to Wehrung's directors and IT that Deckmetry can:
- Capture homeowner leads
- Help contractors create orders faster
- Give Wehrung's cleaner requests
- Preserve admin review and control
- Support phased Epicor integration
- Become a scalable supplier sales channel

---
