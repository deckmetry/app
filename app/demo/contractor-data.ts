// ─────────────────────────────────────────────────────────────────────────────
// Deckmetry — CONTRACTOR PORTAL demo data (Concept Design + Build)
//
// Self-contained mock data for the contractor-side demo. Reuses shared helpers
// and the Smith Residence config/BOM from demo-data so the same project reads
// identically across the supplier and contractor portals.
// ─────────────────────────────────────────────────────────────────────────────

export { formatCurrency, statusBadgeClass, smithResidence } from "./demo-data";

export const CONTRACTOR_NAME = "Concept Design + Build";
export const CONTRACTOR_REP = "John Miller";
export const CONTRACTOR_DISCOUNT = 18;

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardMetrics = {
  activeProjects: 8,
  draftEstimates: 3,
  ordersWaitingReview: 2,
  scheduledDeliveries: 4,
  openBalance: 18737,
  leadsReceived: 5,
};

export const recentProjects = [
  { id: "smith-residence", name: "Smith Residence", status: "Waiting Wehrung's Review", total: 18737, updated: "Today" },
  { id: "johnson-deck", name: "Johnson Deck", status: "Confirmed", total: 24800, updated: "Yesterday" },
  { id: "miller-outdoor-living", name: "Miller Outdoor Living", status: "Scheduled", total: 41200, updated: "May 28, 2026" },
  { id: "brown-deck-replacement", name: "Brown Deck Replacement", status: "Delivered", total: 13900, updated: "May 22, 2026" },
];

export const upcomingDeliveries = [
  { id: "johnson-deck", name: "Johnson Deck", date: "June 14, 2026", status: "Confirmed" },
  { id: "miller-outdoor-living", name: "Miller Outdoor Living", date: "June 21, 2026", status: "Scheduled" },
];

export const dashboardLeads = [
  { id: "amanda-smith", name: "Amanda Smith", city: "Bethlehem, PA", type: "16x20 Deck", status: "New" },
  { id: "brian-johnson", name: "Brian Johnson", city: "Macungie, PA", type: "Deck + Stairs", status: "Contacted" },
];

export const ordersNeedingAction = [
  { id: "smith-residence", name: "Smith Residence", note: "Waiting for Wehrung's review" },
  { id: "johnson-deck", name: "Johnson Deck", note: "Balance payment due" },
];

// ── Projects ──────────────────────────────────────────────────────────────────
export interface ContractorProject {
  id: string;
  name: string;
  homeowner: string;
  city: string;
  status: string;
  total: number;
  requestedDelivery: string;
  updated: string;
  actions: string[];
}

export const contractorProjects: ContractorProject[] = [
  { id: "smith-residence", name: "Smith Residence", homeowner: "Amanda Smith", city: "Bethlehem, PA", status: "Wehrung's Reviewing", total: 18737, requestedDelivery: "June 21, 2026", updated: "Today", actions: ["View", "Clone"] },
  { id: "johnson-deck", name: "Johnson Deck", homeowner: "Brian Johnson", city: "Macungie, PA", status: "Confirmed", total: 24800, requestedDelivery: "June 14, 2026", updated: "Yesterday", actions: ["View", "Pay Balance"] },
  { id: "miller-outdoor-living", name: "Miller Outdoor Living", homeowner: "David Miller", city: "Center Valley, PA", status: "Scheduled", total: 41200, requestedDelivery: "June 21, 2026", updated: "May 28, 2026", actions: ["View"] },
  { id: "brown-deck-replacement", name: "Brown Deck Replacement", homeowner: "Michael Brown", city: "Easton, PA", status: "Delivered", total: 13900, requestedDelivery: "Delivered", updated: "May 22, 2026", actions: ["View", "Clone"] },
  { id: "anderson-backyard-deck", name: "Anderson Backyard Deck", homeowner: "Lisa Anderson", city: "Allentown, PA", status: "Draft", total: 21600, requestedDelivery: "Not requested", updated: "Today", actions: ["Edit", "Clone"] },
];

export function getContractorProject(id: string) {
  return contractorProjects.find((p) => p.id === id);
}

// Smith Residence project-detail summary (config/BOM/pricing reused from smithResidence)
export const projectDetail = {
  summary: {
    "Project Name": "Smith Residence",
    Homeowner: "Amanda Smith",
    Location: "Bethlehem, PA",
    Contractor: "Concept Design + Build",
    "Assigned Wehrung's Rep": "John Miller",
    Status: "Waiting for Wehrung's Review",
    "Requested Delivery Date": "June 21, 2026",
    "Material Total": "$18,737",
  } as Record<string, string>,
  timeline: [
    { label: "Draft Created", done: true },
    { label: "Estimate Completed", done: true },
    { label: "Submitted to Wehrung's", done: true },
    { label: "Wehrung's Reviewing", done: true, current: true },
    { label: "Delivery Date Pending", done: false },
    { label: "Confirmed", done: false },
    { label: "Scheduled", done: false },
    { label: "Delivered", done: false },
    { label: "Completed", done: false },
  ],
  actions: [
    "Request Wehrung's Review",
    "Request Delivery Date",
    "Clone Project",
    "Download BOM",
    "Download Quote",
    "Pay Deposit / Pay Balance",
    "Message Wehrung's Rep",
  ],
  paymentStatus: "Pending",
};

// ── Orders ─────────────────────────────────────────────────────────────────────
export interface ContractorOrder {
  number: string;
  projectId: string;
  project: string;
  status: string;
  total: number;
  deliveryDate: string;
  paymentStatus: string;
  actions: string[];
}

export const contractorOrders: ContractorOrder[] = [
  { number: "ORD-1042", projectId: "smith-residence", project: "Smith Residence", status: "Wehrung's Review", total: 18737, deliveryDate: "Requested", paymentStatus: "Pending", actions: ["View"] },
  { number: "ORD-1038", projectId: "johnson-deck", project: "Johnson Deck", status: "Confirmed", total: 24800, deliveryDate: "June 14, 2026", paymentStatus: "Deposit Paid", actions: ["View", "Pay Balance"] },
  { number: "ORD-1027", projectId: "miller-outdoor-living", project: "Miller Outdoor Living", status: "Scheduled", total: 41200, deliveryDate: "June 21, 2026", paymentStatus: "Paid", actions: ["View Receipt"] },
  { number: "ORD-1019", projectId: "brown-deck-replacement", project: "Brown Deck Replacement", status: "Delivered", total: 13900, deliveryDate: "Delivered", paymentStatus: "Paid", actions: ["View", "Clone Project"] },
];

// ── Leads from Wehrung's ─────────────────────────────────────────────────────
export interface ContractorLead {
  id: string;
  name: string;
  city: string;
  projectType: string;
  estimatedValue: number;
  timeline: string;
  status: string;
  actions: string[];
}

export const contractorLeads: ContractorLead[] = [
  { id: "amanda-smith", name: "Amanda Smith", city: "Bethlehem, PA", projectType: "16x20 Composite Deck", estimatedValue: 18500, timeline: "30-60 days", status: "New", actions: ["View", "Mark Contacted", "Convert to Project"] },
  { id: "lisa-anderson", name: "Lisa Anderson", city: "Allentown, PA", projectType: "Deck + Stairs", estimatedValue: 21600, timeline: "Spring 2026", status: "Contacted", actions: ["View", "Convert to Project"] },
  { id: "robert-wilson", name: "Robert Wilson", city: "Nazareth, PA", projectType: "Deck Replacement", estimatedValue: 16750, timeline: "60-90 days", status: "Estimate Sent", actions: ["View", "Mark Won", "Mark Lost"] },
];

// ── Payments ─────────────────────────────────────────────────────────────────
export const paymentSummary = {
  openBalance: 18737,
  depositsDue: 6000,
  paidThisMonth: 42300,
  upcomingDue: "Smith Residence",
};

export interface PaymentRow {
  projectId: string;
  project: string;
  order: string;
  amount: number;
  status: string;
  dueDate: string;
  action: string;
}

export const payments: PaymentRow[] = [
  { projectId: "smith-residence", project: "Smith Residence", order: "ORD-1042", amount: 18737, status: "Pending", dueDate: "After Wehrung's confirmation", action: "Pay Now" },
  { projectId: "johnson-deck", project: "Johnson Deck", order: "ORD-1038", amount: 24800, status: "Deposit Paid", dueDate: "June 12, 2026", action: "Pay Balance" },
  { projectId: "miller-outdoor-living", project: "Miller Outdoor Living", order: "ORD-1027", amount: 41200, status: "Paid", dueDate: "Paid", action: "View Receipt" },
  { projectId: "brown-deck-replacement", project: "Brown Deck Replacement", order: "ORD-1019", amount: 13900, status: "Paid", dueDate: "Paid", action: "View Receipt" },
];

// ── Catalog / Pricing (contractor view) ──────────────────────────────────────
export interface ContractorCatalogItem {
  name: string;
  brand: string;
  category: string;
  color: string;
  unit: string;
  retail: string;
  contractor: string;
  availability: "Available";
}

// Trex first to reinforce the Trex emphasis, then the rest.
export const contractorCatalog: ContractorCatalogItem[] = [
  { name: "Trex Transcend Decking — Island Mist", brand: "Trex", category: "Decking", color: "Island Mist", unit: "Linear Foot", retail: "$5.25 / LF", contractor: "$4.31 / LF", availability: "Available" },
  { name: "Deckorators Voyage Decking — Costa", brand: "Deckorators", category: "Decking", color: "Costa", unit: "Linear Foot", retail: "$4.95 / LF", contractor: "$4.06 / LF", availability: "Available" },
  { name: "Deckorators Voyage Decking — Sierra", brand: "Deckorators", category: "Decking", color: "Sierra", unit: "Linear Foot", retail: "$4.95 / LF", contractor: "$4.06 / LF", availability: "Available" },
  { name: "Black Aluminum Rail Kit", brand: "RDI", category: "Railing", color: "Black", unit: "Kit", retail: "$189.00", contractor: "$154.98", availability: "Available" },
  { name: "Hidden Fasteners", brand: "CAMO", category: "Fasteners", color: "—", unit: "Box", retail: "$89.00", contractor: "$72.98", availability: "Available" },
];

// ── Company Settings ──────────────────────────────────────────────────────────
export const companySettings = {
  companyName: "Concept Design + Build",
  contact: "Renan Maia",
  email: "renan@conceptdesignbuild.com",
  phone: "484-403-6436",
  address: "Lehigh Valley, PA",
  preferredLocation: "Main Location",
  rep: "John Miller",
  discountLevel: "18%",
  paymentTerms: "Due before scheduled delivery",
};

export const teamMembers = [
  { name: "Renan Maia", role: "Owner / Admin", email: "renan@conceptdesignbuild.com" },
  { name: "Carlos Mendes", role: "Project Manager", email: "carlos@conceptdesignbuild.com" },
  { name: "Tyler Brooks", role: "Estimator", email: "tyler@conceptdesignbuild.com" },
];

// ── New Estimate — field definitions + sample result ─────────────────────────
export const estimatorProjectFields = [
  { key: "projectName", label: "Project Name", value: "Smith Residence" },
  { key: "homeowner", label: "Homeowner Name", value: "Amanda Smith" },
  { key: "address", label: "Address", value: "1420 Linden St" },
  { key: "city", label: "City", value: "Bethlehem, PA" },
  { key: "deliveryDate", label: "Desired Delivery Date", value: "June 21, 2026" },
  { key: "notes", label: "Internal Notes", value: "Back-of-house build. Confirm grade before footings." },
];

export const estimatorDeckFields = [
  { key: "deckSize", label: "Deck Size", value: "16' x 20'" },
  { key: "deckHeight", label: "Deck Height", value: "36\"" },
  { key: "deckShape", label: "Deck Shape", value: "Rectangular" },
  { key: "stairs", label: "Stairs", value: "Open concept stairs" },
  { key: "landing", label: "Landing", value: "Ground-level landing" },
  { key: "railing", label: "Railing Type", value: "Trex Signature aluminum — Charcoal Black" },
  { key: "skirting", label: "Skirting", value: "Horizontal deck board skirt" },
  { key: "fascia", label: "Fascia", value: "Matching Trex Transcend fascia" },
  { key: "lighting", label: "Lighting", value: "Low voltage stair and post lights" },
  { key: "deckingBrand", label: "Decking Brand", value: "Trex" },
  { key: "deckingLine", label: "Decking Line", value: "Transcend" },
  { key: "deckingColor", label: "Decking Color", value: "Island Mist" },
  { key: "fastener", label: "Fastener Type", value: "Trex Hideaway hidden fasteners" },
  { key: "waste", label: "Waste Factor", value: "10%" },
];
