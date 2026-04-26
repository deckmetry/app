# 07 — Data Model

## Main entities

### User
Fields:
- id
- name
- email
- phone
- role
- company_id
- created_at
- last_login_at

Roles:
- homeowner
- contractor
- admin
- super_admin

### Company
For contractors or supplier accounts.

Fields:
- id
- company_name
- account_type
- contact_name
- email
- phone
- address
- pricing_tier_id
- epicor_customer_id
- status

### Project
Fields:
- id
- project_name
- project_type
- created_by_user_id
- company_id
- homeowner_name
- homeowner_email
- homeowner_phone
- jobsite_address
- width
- length
- height
- attached_or_freestanding
- joist_spacing
- railing_sides
- stair_count_category
- status
- requested_delivery_date
- confirmed_delivery_date
- notes
- created_at
- updated_at

### ProjectStatus

Recommended statuses:
- draft
- requested
- received
- confirmed
- scheduled
- complete
- needs_revision
- cancelled
- backordered

### MaterialSelection
Fields:
- id
- project_id
- category
- brand
- collection
- color
- sku
- product_id
- selected_option_label

Categories:
- decking
- fascia
- railing
- framing
- fasteners
- foundation
- stairs
- lighting
- skirting
- accessories

### Product
Fields:
- id
- sku
- name
- category
- brand
- collection
- color
- length
- width
- unit_of_measure
- retail_price
- contractor_price
- cost
- active
- epicor_product_id
- availability_status
- notes

### BOM
Fields:
- id
- project_id
- version
- generated_at
- generated_by
- subtotal
- tax
- delivery_fee
- total
- pricing_mode
- status

### BOMLineItem
Fields:
- id
- bom_id
- product_id
- sku
- product_name
- category
- quantity
- unit
- unit_price
- line_total
- calculation_note
- is_manual_override
- availability_status

### Lead
Fields:
- id
- source
- name
- email
- phone
- address
- project_id
- requested_labor_pricing
- assigned_to
- status
- created_at

Lead sources:
- homeowner_tool
- contractor_portal
- admin_entry
- website
- referral

### OrderRequest
Fields:
- id
- project_id
- bom_id
- requested_by_user_id
- requested_delivery_date
- confirmed_delivery_date
- status
- admin_notes
- customer_notes
- epicor_order_id
- created_at
- updated_at

### Notification
Fields:
- id
- user_id
- project_id
- notification_type
- recipient_email
- subject
- body
- sent_at
- status

### PricingTier
Fields:
- id
- name
- description
- discount_rules
- contractor_company_ids

### AuditLog
Fields:
- id
- entity_type
- entity_id
- action
- changed_by_user_id
- previous_value
- new_value
- created_at

## Data relationships

- A User can belong to a Company.
- A Company can have many Users.
- A User can create many Projects.
- A Project has many MaterialSelections.
- A Project can have many BOM versions.
- A BOM has many BOMLineItems.
- A Project can become a Lead.
- A Project can become an OrderRequest.
- An OrderRequest may eventually map to an Epicor order.
- Products may map to Epicor product IDs or SKUs.

## MVP data priorities

For the pilot, the most important data to get right:
- Project specs
- User/contact info
- Material selections
- BOM line items
- Pricing mode
- Status history
- Delivery request
- Admin notes
- Exportable SKU/quantity list

## Admin editing requirements

Admin should be able to:
- Edit project status.
- Edit BOM quantities.
- Substitute SKUs.
- Add notes.
- Confirm or change delivery date.
- Mark items as unavailable/backordered.
- Export current BOM.

## Future analytics

Potential metrics:
- Number of homeowner leads
- Number of contractor projects
- BOMs generated
- Submitted order requests
- Confirmed orders
- Average material value
- Top brands/colors
- Conversion rate by user type
- Contractor usage frequency
- Time from request to confirmed
- Delivery demand by date
