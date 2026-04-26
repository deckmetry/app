# 03 — System Overview

## System name

Working name: **Deckmetry**

Possible positioning language:
- Deck takeoffs in minutes.
- The digital ordering portal for deck materials.
- A smarter way for suppliers, contractors, and homeowners to build deck orders.
- From deck idea to BOM to delivery request.

## System architecture overview

Deckmetry should have three main portals:

1. Homeowner Experience
2. Contractor Portal
3. Admin/Sales Portal

The system can be embedded into Wehrung's website or launched through a button/link from Wehrung's website.

## Entry point on Wehrung's website

The application should be accessible from Wehrung's website with two clear buttons:

### Button 1: Homeowner
For homeowners looking to plan a new deck, estimate materials, select colors, and request professional help.

### Button 2: Contractor
For contractors looking to create a project, generate a BOM, see pricing, request delivery, and manage project/order status.

## Homeowner path

Homeowners should:
1. Enter deck dimensions and basic project information.
2. Select decking brand, collection, and color.
3. Select railing type, color, and options.
4. Add stairs, lighting, skirt, fascia, or other options.
5. View a material list with an estimated material price.
6. Enter contact info to receive the BOM by email.
7. Click “Request Pro Pricing for Labor.”
8. Wehrung's receives the lead and project details.

## Contractor path

Contractors should:
1. Log in.
2. Create a new project.
3. Enter dimensions and project specs.
4. Select materials.
5. View contractor-specific pricing.
6. Save the project.
7. Request order review and delivery date.
8. Track project/order status.

## Admin/sales path

Wehrung's sales/admin users should:
1. View homeowner leads.
2. View contractor project requests.
3. Open the generated BOM.
4. Adjust quantities or pricing if needed.
5. Confirm availability.
6. Confirm or propose delivery date.
7. Move request status through the workflow.
8. Communicate with homeowner or contractor.
9. Export/order data for internal processing.

## Core status workflow

Recommended stages:

1. **Draft**
   - Project created but not submitted.

2. **Requested**
   - Contractor/homeowner submitted project for Wehrung's review.

3. **Received**
   - Wehrung's received the request internally.

4. **Confirmed**
   - Wehrung's reviewed pricing, availability, and order details.

5. **Scheduled**
   - Delivery/pickup has been scheduled.

6. **Complete**
   - Order/project fulfilled.

Optional future stages:
- Needs Revision
- Awaiting Customer Approval
- Awaiting Deposit/Payment
- Backordered
- Partially Delivered
- Cancelled

## MVP principle

The first version should prioritize:
- Clear user experience.
- Reliable structured inputs.
- Useful BOM output.
- Admin review workflow.
- Contractor/homeowner lead capture.

It should not try to fully automate every framing condition, code condition, or ERP function on day one.
