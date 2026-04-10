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
