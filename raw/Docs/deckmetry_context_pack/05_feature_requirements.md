# 05 — Feature Requirements

## MVP feature list

### Public/homeowner experience

- Embedded or linked experience from Wehrung's website.
- Homeowner/contractor path selection.
- Guided deck input form.
- Material selection by category:
  - Decking
  - Fascia
  - Framing
  - Railing
  - Stairs
  - Fasteners
  - Foundation
  - Optional lighting/skirting
- BOM generation.
- Estimated material price.
- Lead capture before final BOM delivery or before price reveal.
- Email delivery of BOM.
- Request professional labor pricing.
- Admin notification when lead is submitted.

### Contractor portal

- Contractor login.
- Contractor dashboard.
- New project creation.
- Saved draft projects.
- Material selection.
- Contractor-specific pricing.
- BOM generation.
- Submit project/order request.
- Request delivery date.
- Project status tracking.
- Download/export BOM.
- Email confirmation.

### Admin/sales portal

- Admin login.
- Dashboard of homeowner leads and contractor requests.
- Filter by status.
- View project details.
- View/edit BOM.
- View pricing.
- Mark availability confirmed.
- Confirm/propose delivery date.
- Change status.
- Add internal notes.
- Export BOM as PDF/CSV.
- Send email notification.

## Important system disclaimers

Deckmetry should display language similar to:

> Material quantities and pricing are generated based on the information provided and standard estimating assumptions. Final quantities, pricing, availability, and delivery dates are subject to Wehrung's review and confirmation.

This protects Wehrung's from liability and prevents the tool from being treated as final engineering/design approval.

## Pricing rules

The system should support separate pricing modes:

### Homeowner pricing
- Estimated material pricing.
- Could be retail or approximate retail.
- Should be clearly marked as estimated.

### Contractor pricing
- Contractor-specific pricing.
- Pricing may vary by contractor account.
- Could be based on customer group, discount tier, or manually assigned pricing table.

### Admin pricing
- Admin can see and adjust pricing.
- Admin may override price before confirmation.

## Account roles

Recommended roles:

### Homeowner
- No full account required initially.
- Can create/save project through email link in future version.

### Contractor
- Can log in.
- Can create and save projects.
- Can see contractor pricing.
- Can submit requests.

### Wehrung's Sales/Admin
- Can review leads and contractor requests.
- Can edit BOMs and statuses.
- Can confirm requests.

### Wehrung's Super Admin
- Can manage products, pricing, users, and system settings.

## Product catalog requirements

Each product should include:
- SKU
- Product name
- Brand
- Category
- Collection
- Color
- Length
- Unit of measure
- Price
- Availability status if available
- Contractor pricing tier if applicable
- Related products

## Future feature ideas

- Full Epicor API integration.
- Real-time inventory availability.
- Real-time delivery calendar.
- Contractor order history.
- Saved templates for common deck sizes.
- Photo upload.
- 3D preview.
- AI assistant for deck configuration.
- Homeowner-to-contractor lead assignment.
- Approval/payment collection.
- Brand-specific upsell logic.
- CRM integration.
- Analytics dashboard.
