// Deckmetry Database Types — mirrors Supabase schema
// Auto-generated version: run `supabase gen types typescript` to regenerate

export type OrgType = "homeowner" | "contractor" | "supplier";
export type OrgRole = "owner" | "admin" | "member" | "viewer";
export type EstimateStatus = "draft" | "completed" | "shared" | "archived";

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  slug: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  default_organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  updated_at: string;
}

export interface EstimateRow {
  id: string;
  organization_id: string;
  created_by: string;
  status: EstimateStatus;
  project_name: string;
  project_address: string | null;
  delivery_address: string | null;
  requested_delivery_date: string | null;
  contractor_name: string | null;
  email: string | null;
  phone: string | null;
  deck_type: "attached" | "freestanding";
  deck_width_ft: number;
  deck_projection_ft: number;
  deck_height_in: number;
  joist_spacing_in: number;
  decking_brand: string | null;
  decking_collection: string | null;
  decking_color: string | null;
  picture_frame_color: string | null;
  picture_frame_enabled: boolean;
  railing_required_override: boolean | null;
  railing_material: "vinyl" | "composite" | "aluminum" | "cable" | null;
  railing_color: string | null;
  open_sides: string[];
  lattice_skirt: boolean;
  horizontal_skirt: boolean;
  post_cap_lights: boolean;
  stair_lights: boolean;
  accent_lights: boolean;
  total_area_sf: number | null;
  total_bom_items: number | null;
  share_token: string | null;
  shared_with_org_id: string | null;
  assumptions: string[];
  warnings: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EstimateLineItemRow {
  id: string;
  estimate_id: string;
  category: string;
  description: string;
  size: string | null;
  quantity: number;
  unit: string;
  notes: string | null;
  sort_order: number;
  is_manual_override: boolean;
  created_at: string;
}

export interface EstimateStairSectionRow {
  id: string;
  estimate_id: string;
  location: "left" | "front" | "right";
  width_ft: number;
  step_count: number;
  sort_order: number;
  created_at: string;
}

// Phase 2 — Quotes & Approvals

export type QuoteStatus = "draft" | "sent" | "viewed" | "approved" | "rejected" | "expired";

export interface QuoteRow {
  id: string;
  organization_id: string;
  estimate_id: string;
  created_by: string;
  status: QuoteStatus;
  quote_number: string;
  title: string;
  cover_note: string | null;
  valid_until: string | null;
  payment_terms: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  share_token: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface QuoteLineItemRow {
  id: string;
  quote_id: string;
  category: string;
  description: string;
  size: string | null;
  quantity: number;
  unit: string;
  unit_cost: number;
  markup_pct: number;
  unit_price: number;
  line_total: number;
  notes: string | null;
  sort_order: number;
  visible_to_customer: boolean;
  created_at: string;
}

export interface ApprovalRow {
  id: string;
  quote_id: string;
  organization_id: string;
  signer_name: string;
  signer_email: string;
  signer_ip: string | null;
  signature_data: string;
  approved_at: string;
  approved_total: number;
  approved_quote_number: string;
  created_at: string;
}

// Phase 3 — Stripe Products, Prices & Subscriptions

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "unpaid"
  | "paused";

export type PricingType = "one_time" | "recurring";
export type PricingInterval = "day" | "week" | "month" | "year";

export interface ProductRow {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  image: string | null;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface PriceRow {
  id: string;
  product_id: string;
  active: boolean;
  description: string | null;
  unit_amount: number;
  currency: string;
  type: PricingType;
  interval: PricingInterval | null;
  interval_count: number | null;
  trial_period_days: number | null;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  organization_id: string;
  status: SubscriptionStatus;
  price_id: string | null;
  quantity: number;
  cancel_at_period_end: boolean;
  cancel_at: string | null;
  canceled_at: string | null;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  ended_at: string | null;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// Phase 4 — Orders, Invoices, Payments & Deliveries

export type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "void"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded";

export type DeliveryStatus =
  | "pending"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed";

export interface OrderRow {
  id: string;
  organization_id: string;
  supplier_org_id: string | null;
  quote_id: string | null;
  created_by: string;
  status: OrderStatus;
  order_number: string;
  title: string;
  notes: string | null;
  shipping_address: string | null;
  requested_delivery_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  submitted_at: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OrderLineItemRow {
  id: string;
  order_id: string;
  category: string;
  description: string;
  size: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface InvoiceRow {
  id: string;
  organization_id: string;
  contractor_org_id: string | null;
  order_id: string | null;
  created_by: string;
  status: InvoiceStatus;
  invoice_number: string;
  title: string;
  notes: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  due_date: string | null;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  sent_at: string | null;
  voided_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PaymentRow {
  id: string;
  invoice_id: string | null;
  organization_id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  stripe_payment_id: string | null;
  stripe_transfer_id: string | null;
  payment_method: string | null;
  notes: string | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryRow {
  id: string;
  order_id: string;
  organization_id: string;
  status: DeliveryStatus;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_date: string | null;
  actual_date: string | null;
  pod_photo_url: string | null;
  pod_signer_name: string | null;
  notes: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

// Phase 5 — Notifications

export type NotificationType =
  | "quote_sent"
  | "quote_viewed"
  | "quote_approved"
  | "quote_rejected"
  | "order_submitted"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "invoice_sent"
  | "invoice_paid"
  | "delivery_shipped"
  | "delivery_delivered"
  | "estimate_shared"
  | "review_requested"
  | "system";

export interface NotificationRow {
  id: string;
  organization_id: string;
  user_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}
