// ─────────────────────────────────────────────────────────────────────────────
// Deckmetry × Wehrung's — DEMO DATA
//
// Self-contained mock data for the supplier sales-enablement demo presented to
// Wehrung's. No backend, no Supabase — everything here renders the presentation
// flow deterministically so the live demo never depends on network/auth state.
// ─────────────────────────────────────────────────────────────────────────────

export const SUPPLIER_NAME = "Wehrung's";

// ── Currency / format helpers ───────────────────────────────────────────────
export function formatCurrency(n: number, opts: { cents?: boolean } = {}) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  });
}

// ── Status palette ───────────────────────────────────────────────────────────
// Maps every project / lead / order status to a tailwind badge className.
export type ProjectStatus =
  | "Draft"
  | "Quote Created"
  | "Requested"
  | "Wehrung's Review"
  | "Confirmed"
  | "Scheduled"
  | "Shipped"
  | "Delivered"
  | "Paid / Completed";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Draft",
  "Quote Created",
  "Requested",
  "Wehrung's Review",
  "Confirmed",
  "Scheduled",
  "Shipped",
  "Delivered",
  "Paid / Completed",
];

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700 border-gray-200",
    "Quote Created": "bg-sky-100 text-sky-800 border-sky-200",
    Requested: "bg-amber-100 text-amber-800 border-amber-200",
    "Wehrung's Review": "bg-violet-100 text-violet-800 border-violet-200",
    "Pending Wehrung's Review": "bg-violet-100 text-violet-800 border-violet-200",
    Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    Scheduled: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Shipped: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Paid / Completed": "bg-green-100 text-green-800 border-green-200",
    // Lead statuses
    "New Lead": "bg-amber-100 text-amber-800 border-amber-200",
    "Assigned to Contractor": "bg-blue-100 text-blue-800 border-blue-200",
    "Contractor Contacted": "bg-violet-100 text-violet-800 border-violet-200",
    "Closed Won": "bg-emerald-100 text-emerald-800 border-emerald-200",
    Lost: "bg-rose-100 text-rose-800 border-rose-200",
    // Account / catalog
    Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Inactive: "bg-gray-100 text-gray-600 border-gray-200",
    Available: "bg-emerald-100 text-emerald-800 border-emerald-200",
    // Contractor-portal project / order statuses
    "Estimate Created": "bg-sky-100 text-sky-800 border-sky-200",
    Submitted: "bg-sky-100 text-sky-800 border-sky-200",
    "Requested Wehrung's Review": "bg-amber-100 text-amber-800 border-amber-200",
    "Waiting Wehrung's Review": "bg-violet-100 text-violet-800 border-violet-200",
    "Waiting for Wehrung's Review": "bg-violet-100 text-violet-800 border-violet-200",
    "Wehrung's Reviewing": "bg-violet-100 text-violet-800 border-violet-200",
    "Changes Requested": "bg-orange-100 text-orange-800 border-orange-200",
    "Payment Required": "bg-amber-100 text-amber-800 border-amber-200",
    "Payment Pending": "bg-amber-100 text-amber-800 border-amber-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-gray-100 text-gray-600 border-gray-200",
    // Payment statuses
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    "Deposit Required": "bg-amber-100 text-amber-800 border-amber-200",
    "Deposit Paid": "bg-blue-100 text-blue-800 border-blue-200",
    "Balance Due": "bg-amber-100 text-amber-800 border-amber-200",
    Paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Overdue: "bg-rose-100 text-rose-800 border-rose-200",
    // Contractor lead statuses
    New: "bg-amber-100 text-amber-800 border-amber-200",
    Contacted: "bg-violet-100 text-violet-800 border-violet-200",
    "Estimate Sent": "bg-sky-100 text-sky-800 border-sky-200",
    Won: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

// ── Contractors ───────────────────────────────────────────────────────────────
export interface Contractor {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  rep: string;
  discount: number;
  activeProjects: number;
  quotedValue: number;
  orderedValue: number;
  lastActivity: string;
  status: "Active" | "Inactive";
  notes: string;
  // Extended profile summary
  summary: {
    totalProjects: number;
    quotesCreated: number;
    ordersRequested: number;
    approvedOrders: number;
    ytdRevenue: number;
    avgProjectSize: number;
    topProductLine: string;
  };
}

export const contractors: Contractor[] = [
  {
    id: "concept-design-build",
    company: "Concept Design + Build",
    contact: "Renan Maia",
    email: "renan@conceptdesignandbuild.com",
    phone: "(610) 555-0142",
    rep: "John Miller",
    discount: 18,
    activeProjects: 6,
    quotedValue: 142850,
    orderedValue: 87320,
    lastActivity: "Today",
    status: "Active",
    notes:
      "Top-performing contractor in the Lehigh Valley. High close rate on composite decks. Prefers Deckorators Voyage. Net-30 terms approved.",
    summary: {
      totalProjects: 18,
      quotesCreated: 14,
      ordersRequested: 8,
      approvedOrders: 6,
      ytdRevenue: 214800,
      avgProjectSize: 23866,
      topProductLine: "Trex Transcend",
    },
  },
  {
    id: "elite-outdoor-living",
    company: "Elite Outdoor Living",
    contact: "Mark Reynolds",
    email: "mark@eliteoutdoorliving.com",
    phone: "(610) 555-0178",
    rep: "Sarah Thompson",
    discount: 15,
    activeProjects: 4,
    quotedValue: 96400,
    orderedValue: 54100,
    lastActivity: "Yesterday",
    status: "Active",
    notes: "Strong on railing upgrades and lighting packages. Growing account.",
    summary: {
      totalProjects: 12,
      quotesCreated: 9,
      ordersRequested: 5,
      approvedOrders: 4,
      ytdRevenue: 138500,
      avgProjectSize: 19400,
      topProductLine: "Trex Transcend",
    },
  },
  {
    id: "keystone-deck-builders",
    company: "Keystone Deck Builders",
    contact: "David Miller",
    email: "david@keystonedecks.com",
    phone: "(484) 555-0203",
    rep: "Mike Davis",
    discount: 12,
    activeProjects: 3,
    quotedValue: 71900,
    orderedValue: 38250,
    lastActivity: "3 days ago",
    status: "Active",
    notes: "Volume builder. Price-sensitive — competes on Trex Select.",
    summary: {
      totalProjects: 9,
      quotesCreated: 7,
      ordersRequested: 4,
      approvedOrders: 3,
      ytdRevenue: 92300,
      avgProjectSize: 16100,
      topProductLine: "Trex Select",
    },
  },
  {
    id: "valley-outdoor-concepts",
    company: "Valley Outdoor Concepts",
    contact: "Jason Carter",
    email: "jason@valleyoutdoor.com",
    phone: "(610) 555-0259",
    rep: "John Miller",
    discount: 10,
    activeProjects: 2,
    quotedValue: 38700,
    orderedValue: 19600,
    lastActivity: "5 days ago",
    status: "Active",
    notes: "Newer account. Onboarding in progress. Interested in Deckorators Vista.",
    summary: {
      totalProjects: 5,
      quotesCreated: 4,
      ordersRequested: 2,
      approvedOrders: 1,
      ytdRevenue: 41200,
      avgProjectSize: 14800,
      topProductLine: "Deckorators Vista",
    },
  },
];

export function getContractor(id: string) {
  return contractors.find((c) => c.id === id);
}

// ── Projects / Orders ─────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  homeowner: string;
  city: string;
  contractorId: string;
  contractor: string;
  rep: string;
  status: ProjectStatus | "Pending Wehrung's Review";
  materialValue: number;
  requestedDelivery?: string;
  lastUpdated: string;
}

export const projects: Project[] = [
  {
    id: "smith-residence",
    name: "Smith Residence",
    homeowner: "Amanda Smith",
    city: "Bethlehem, PA",
    contractorId: "concept-design-build",
    contractor: "Concept Design + Build",
    rep: "John Miller",
    status: "Pending Wehrung's Review",
    materialValue: 18450,
    requestedDelivery: "June 21, 2026",
    lastUpdated: "Today",
  },
  {
    id: "johnson-deck",
    name: "Johnson Deck",
    homeowner: "Brian Johnson",
    city: "Macungie, PA",
    contractorId: "concept-design-build",
    contractor: "Concept Design + Build",
    rep: "John Miller",
    status: "Confirmed",
    materialValue: 24800,
    requestedDelivery: "June 18, 2026",
    lastUpdated: "Yesterday",
  },
  {
    id: "miller-outdoor-living",
    name: "Miller Outdoor Living",
    homeowner: "David Miller",
    city: "Center Valley, PA",
    contractorId: "concept-design-build",
    contractor: "Concept Design + Build",
    rep: "John Miller",
    status: "Scheduled",
    materialValue: 41200,
    requestedDelivery: "June 12, 2026",
    lastUpdated: "May 28, 2026",
  },
  {
    id: "brown-deck-replacement",
    name: "Brown Deck Replacement",
    homeowner: "Michael Brown",
    city: "Easton, PA",
    contractorId: "concept-design-build",
    contractor: "Concept Design + Build",
    rep: "John Miller",
    status: "Delivered",
    materialValue: 13900,
    requestedDelivery: "May 20, 2026",
    lastUpdated: "May 22, 2026",
  },
  {
    id: "anderson-backyard-deck",
    name: "Anderson Backyard Deck",
    homeowner: "Lisa Anderson",
    city: "Allentown, PA",
    contractorId: "concept-design-build",
    contractor: "Concept Design + Build",
    rep: "John Miller",
    status: "Draft",
    materialValue: 21600,
    lastUpdated: "Today",
  },
  {
    id: "wilson-composite-deck",
    name: "Wilson Composite Deck",
    homeowner: "Robert Wilson",
    city: "Nazareth, PA",
    contractorId: "concept-design-build",
    contractor: "Concept Design + Build",
    rep: "John Miller",
    status: "Wehrung's Review",
    materialValue: 16750,
    requestedDelivery: "June 25, 2026",
    lastUpdated: "Today",
  },
  // A few cross-contractor projects so the global Projects/Orders page looks full
  {
    id: "reynolds-poolside-deck",
    name: "Poolside Deck — Reynolds",
    homeowner: "Karen Reynolds",
    city: "Emmaus, PA",
    contractorId: "elite-outdoor-living",
    contractor: "Elite Outdoor Living",
    rep: "Sarah Thompson",
    status: "Confirmed",
    materialValue: 28900,
    requestedDelivery: "June 19, 2026",
    lastUpdated: "Yesterday",
  },
  {
    id: "garcia-rooftop-deck",
    name: "Garcia Rooftop Deck",
    homeowner: "Luis Garcia",
    city: "Bethlehem, PA",
    contractorId: "elite-outdoor-living",
    contractor: "Elite Outdoor Living",
    rep: "Sarah Thompson",
    status: "Shipped",
    materialValue: 22300,
    requestedDelivery: "June 10, 2026",
    lastUpdated: "May 30, 2026",
  },
  {
    id: "thompson-deck",
    name: "Thompson Deck",
    homeowner: "Greg Thompson",
    city: "Whitehall, PA",
    contractorId: "keystone-deck-builders",
    contractor: "Keystone Deck Builders",
    rep: "Mike Davis",
    status: "Requested",
    materialValue: 15400,
    requestedDelivery: "June 28, 2026",
    lastUpdated: "3 days ago",
  },
  {
    id: "patel-deck",
    name: "Patel Backyard Deck",
    homeowner: "Anil Patel",
    city: "Coopersburg, PA",
    contractorId: "valley-outdoor-concepts",
    contractor: "Valley Outdoor Concepts",
    rep: "John Miller",
    status: "Quote Created",
    materialValue: 19200,
    lastUpdated: "5 days ago",
  },
];

export function projectsForContractor(contractorId: string) {
  return projects.filter((p) => p.contractorId === contractorId);
}

export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}

// ── Project detail (Smith Residence — the hero demo project) ───────────────────
export interface BomLine {
  category: string;
  item: string;
  qty: string;
  qtyNum?: number;     // numeric quantity for pricing math
  unitPrice?: number;  // retail unit price; omit for informational lines (e.g. waste)
  sku?: string;        // catalog SKU (for the Wehrung's order/invoice view)
  um?: string;         // unit of measure (EA, BX, KIT, LOT…)
}

// Wehrung's branch that fulfills the order (matches the real Macungie invoice).
export const WEHRUNGS_LOCATION = {
  name: "Wehrung's Macungie LLC",
  address: "3580 Brookside Rd, PO Box 7",
  cityZip: "Macungie, PA 18062",
  phone: "(610) 966-5555",
};

// Retail line total for a BOM line (0 for informational lines without pricing).
export function bomLineTotal(line: BomLine): number {
  return line.qtyNum != null && line.unitPrice != null ? line.qtyNum * line.unitPrice : 0;
}

// Sum of all priced BOM lines (retail).
export function bomRetailTotal(bom: BomLine[]): number {
  return bom.reduce((sum, l) => sum + bomLineTotal(l), 0);
}

export const smithResidence = {
  id: "smith-residence",
  config: {
    "Deck Size": "16' x 20' (320 sq ft)",
    "Decking Brand": "Trex",
    "Decking Line": "Transcend",
    "Decking Color": "Island Mist",
    Railing: "Trex Signature aluminum railing — Charcoal Black",
    Fascia: "Matching Trex Transcend fascia",
    Stairs: "Open concept stairs",
    Skirting: "Horizontal deck board skirt",
    Lighting: "Low voltage stair and post lights",
    Accessories: "Hidden fasteners, structural hardware, post sleeves",
  } as Record<string, string>,
  bom: [
    { category: "Decking", item: "Trex Transcend Decking — Island Mist, 20' (Grooved)", qty: "42 boards", qtyNum: 42, unitPrice: 165, sku: "TRXTRGPIM20", um: "EA" },
    { category: "Decking", item: "Trex Transcend Decking — Island Mist, 16' (Grooved)", qty: "6 boards", qtyNum: 6, unitPrice: 132, sku: "TRXTRGPIM16", um: "EA" },
    { category: "Fascia", item: "Trex Transcend Fascia — Island Mist, 1x12, 12'", qty: "8 boards", qtyNum: 8, unitPrice: 74, sku: "TRXFAS112IM", um: "EA" },
    { category: "Stairs — Treads", item: "Trex Transcend Stair Treads — Island Mist", qty: "6 treads", qtyNum: 6, unitPrice: 92, sku: "TRXTRDIM", um: "EA" },
    { category: "Skirting", item: "Trex Transcend Deck-Board Skirt — Island Mist, 20'", qty: "22 boards", qtyNum: 22, unitPrice: 165, sku: "TRXSKIRTIM20", um: "EA" },
    { category: "Railing", item: "Trex Signature Aluminum Level Rail 6' — Charcoal Black", qty: "9 sections", qtyNum: 9, unitPrice: 198, sku: "TRXSIGLR6CB", um: "EA" },
    { category: "Railing", item: "Trex Signature Aluminum Stair Rail 6' — Charcoal Black", qty: "3 sections", qtyNum: 3, unitPrice: 214, sku: "TRXSIGSR6CB", um: "EA" },
    { category: "Railing", item: "Trex Signature Rail Posts 45\" — Charcoal Black", qty: "8 posts", qtyNum: 8, unitPrice: 56, sku: "TRXSIGP45CB", um: "EA" },
    { category: "Railing", item: "Trex Signature Gate Kit — Charcoal Black", qty: "1 gate", qtyNum: 1, unitPrice: 289, sku: "TRXSIGGATE", um: "EA" },
    { category: "Hidden Fasteners", item: "Trex Hideaway Hidden Fastener System", qty: "4 boxes", qtyNum: 4, unitPrice: 72.5, sku: "TRXHIDE90", um: "BX" },
    { category: "Lighting", item: "TrueScapes LV Lighting Package — transformer + 8 step + 6 post-cap", qty: "1 kit", qtyNum: 1, unitPrice: 2250, sku: "TSLVPKG", um: "KIT" },
    { category: "Framing — Joists", item: "2X8X16 #2 PT SYP JOIST", qty: "26 pcs", qtyNum: 26, unitPrice: 24.5, sku: "2816T", um: "EA" },
    { category: "Framing — Beams", item: "2X10X16 #2 PT SYP BEAM", qty: "6 pcs", qtyNum: 6, unitPrice: 33, sku: "21016T", um: "EA" },
    { category: "Framing — Posts", item: "6X6X8 #2 TREATED UC4B POST", qty: "5 pcs", qtyNum: 5, unitPrice: 42, sku: "6608T", um: "EA" },
    { category: "Footings", item: "12\" SONOTUBE + 80LB CONCRETE (footing set)", qty: "5 sets", qtyNum: 5, unitPrice: 58, sku: "SONO12", um: "EA" },
    { category: "Hardware / Connectors", item: "SIMPSON LUS28 2X8 JOIST HANGER 18GA", qty: "40 ea", qtyNum: 40, unitPrice: 2.55, sku: "LUS28", um: "EA" },
    { category: "Hardware / Connectors", item: "SIMPSON ABU66Z POST BASE 6X6", qty: "5 ea", qtyNum: 5, unitPrice: 24.5, sku: "ABU66Z", um: "EA" },
    { category: "Hardware / Connectors", item: "SIMPSON AC6Z POST CAP", qty: "5 ea", qtyNum: 5, unitPrice: 17.5, sku: "AC6Z", um: "EA" },
    { category: "Hardware / Connectors", item: "LEDGER FLASHING + STRUCTURAL LAG KIT", qty: "1 lot", qtyNum: 1, unitPrice: 245, sku: "LEDGRKIT", um: "LOT" },
    { category: "Accessories", item: "Trex Post Sleeves + Sleeve Caps & Skirt", qty: "8 ea", qtyNum: 8, unitPrice: 89, sku: "TRXSLV", um: "EA" },
    { category: "Accessories", item: "Trex Protect Joist & Beam Tape", qty: "4 rolls", qtyNum: 4, unitPrice: 42, sku: "TRXPROT", um: "EA" },
    { category: "Accessories", item: "Misc — screws, sealant, blocking, flashing tape", qty: "1 lot", qtyNum: 1, unitPrice: 1801, sku: "MISCKIT", um: "LOT" },
    { category: "Delivery", item: "FUEL SURCHARGE", qty: "1 ea", qtyNum: 1, unitPrice: 25, sku: "FUELSC", um: "EA" },
    { category: "Delivery", item: "DELIVERY SERVICE", qty: "1 ea", qtyNum: 1, unitPrice: 55, sku: "DELIVERY", um: "EA" },
    { category: "Waste Factor", item: "10% — already included in board & framing quantities", qty: "+10%" },
  ] as BomLine[],
  order: {
    orderNo: "ORD-1042",
    custNo: "659190",
    jobNo: "001",
    po: "Smith Residence",
    reference: "DECK",
    terms: "1% 10TH / NET 30",
    clerk: "TEF",
    date: "Jun 6, 2026",
    dueDate: "Jun 21, 2026",
    salesperson: "31  John Miller",
    taxRate: 0.06,
    soldTo: ["Concept Design + Build", "1131 Trexlertown Rd", "Trexlertown, PA 18087"],
    shipTo: ["Smith Residence — Amanda Smith", "1420 Linden St", "Bethlehem, PA 18018"],
  },
  pricing: {
    retailTotal: 22850,
    discountPct: 18,
    contractorPrice: 18737,
    // internal-only placeholder
    estimatedMargin: "Internal only",
  },
  timeline: [
    { label: "Contractor created quote", at: "Jun 6, 2026 · 9:14 AM", done: true },
    { label: "Contractor requested Wehrung's review", at: "Jun 6, 2026 · 9:21 AM", done: true },
    { label: "Wehrung's sales rep opened project", at: "Jun 9, 2026 · 8:02 AM", done: true },
    { label: "Waiting for delivery confirmation", at: "Pending", done: false },
  ],
  actions: [
    "Review Order",
    "Adjust Material List",
    "Confirm Availability",
    "Confirm Delivery Date",
    "Send Confirmation to Contractor",
    "Mark as Scheduled",
    "Mark as Shipped",
    "Mark as Delivered",
  ],
};

// ── Homeowner Leads ─────────────────────────────────────────────────────────
export interface Lead {
  id: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  projectType: string;
  preferredMaterial: string;
  estimatedValue: number;
  timeline: string;
  status: "New Lead" | "Assigned to Contractor" | "Contractor Contacted" | "Closed Won" | "Lost";
  assignedContractor: string | null;
  deckSize: string;
  budgetRange: string;
  notes: string;
  source: string;
}

export const leads: Lead[] = [
  {
    id: "amanda-smith",
    name: "Amanda Smith",
    city: "Bethlehem, PA",
    email: "amanda.smith@gmail.com",
    phone: "(610) 555-0311",
    projectType: "16x20 composite deck",
    preferredMaterial: "Trex Transcend",
    estimatedValue: 18500,
    timeline: "30-60 days",
    status: "New Lead",
    assignedContractor: null,
    deckSize: "16' x 20' (320 sq ft)",
    budgetRange: "$18,000 - $22,000",
    notes:
      "Wants a low-maintenance composite deck off the back of the house. Interested in black aluminum railing and stair lighting.",
    source: "Wehrung's Website Deck Estimator",
  },
  {
    id: "brian-johnson",
    name: "Brian Johnson",
    city: "Macungie, PA",
    email: "brian.johnson@gmail.com",
    phone: "(610) 555-0347",
    projectType: "Deck + stairs + railing",
    preferredMaterial: "Trex Transcend",
    estimatedValue: 24200,
    timeline: "ASAP",
    status: "Assigned to Contractor",
    assignedContractor: "Concept Design + Build",
    deckSize: "18' x 22' (396 sq ft)",
    budgetRange: "$22,000 - $28,000",
    notes: "Ready to move quickly. Existing deck being torn out.",
    source: "Wehrung's Website Deck Estimator",
  },
  {
    id: "michael-brown",
    name: "Michael Brown",
    city: "Easton, PA",
    email: "michael.brown@gmail.com",
    phone: "(484) 555-0388",
    projectType: "Backyard deck replacement",
    preferredMaterial: "Trex Select",
    estimatedValue: 13800,
    timeline: "60-90 days",
    status: "Contractor Contacted",
    assignedContractor: "Keystone Deck Builders",
    deckSize: "14' x 16' (224 sq ft)",
    budgetRange: "$12,000 - $16,000",
    notes: "Replacing an aging wood deck. Budget-conscious.",
    source: "Wehrung's Website Deck Estimator",
  },
  {
    id: "lisa-anderson",
    name: "Lisa Anderson",
    city: "Allentown, PA",
    email: "lisa.anderson@gmail.com",
    phone: "(610) 555-0402",
    projectType: "New deck with stairs",
    preferredMaterial: "Deckorators Vista",
    estimatedValue: 21600,
    timeline: "Spring 2026",
    status: "New Lead",
    assignedContractor: null,
    deckSize: "16' x 18' (288 sq ft)",
    budgetRange: "$20,000 - $24,000",
    notes: "Planning ahead for spring. Wants multi-level design with stairs.",
    source: "Wehrung's Website Deck Estimator",
  },
];

export function getLead(id: string) {
  return leads.find((l) => l.id === id);
}

// ── Catalog ───────────────────────────────────────────────────────────────────
// One shared Wehrung's catalog, organized by material section. Contractor
// discount tiers are applied per-contractor (see contractor profile) and are
// intentionally NOT shown here — this is the single source-of-truth price book.
export interface CatalogSection {
  key: string;
  label: string;
  description: string;
  columns: string[];        // header labels (price column added automatically)
  priceLabel: string;       // label for the price column
  filterColumns?: string[]; // column labels to expose as dropdown filters
  rows: { cells: string[]; price: string }[];
}

// PT dimensional lumber — one row per length, priced per piece.
const LUMBER_LENGTHS = ["8'", "10'", "12'", "14'", "16'", "18'", "20'"];
const LUMBER_PRICES: Record<string, number[]> = {
  "2x4": [5, 7, 10, 12, 15, 20, 25],
  "2x6": [8, 10, 13, 16, 19, 24, 30],
  "2x8": [11, 14, 17, 21, 25, 31, 38],
  "2x10": [15, 19, 23, 28, 33, 40, 48],
  "2x12": [19, 24, 29, 35, 42, 50, 60],
};
const lumberDimRows = Object.entries(LUMBER_PRICES).flatMap(([dim, prices]) =>
  prices.map((p, i) => ({
    cells: [dim, "PT Southern Yellow Pine", LUMBER_LENGTHS[i]],
    price: `$${p}`,
  }))
);

export const catalogSections: CatalogSection[] = [
  {
    key: "lumber",
    filterColumns: ["Product", "Species / Material"],
    label: "Lumber",
    description: "Pressure-treated framing (priced per piece by length), LVL engineered beams (per lin ft by thickness), and specialty woods.",
    columns: ["Product", "Species / Material", "Size"],
    priceLabel: "Retail",
    rows: [
      ...lumberDimRows,
      { cells: ["4x4 Post", "PT Southern Yellow Pine", "8'"], price: "$18" },
      { cells: ["4x4 Post", "PT Southern Yellow Pine", "10'"], price: "$24" },
      { cells: ["4x4 Post", "PT Southern Yellow Pine", "12'"], price: "$30" },
      { cells: ["6x6 Post", "PT Southern Yellow Pine", "8'"], price: "$42" },
      { cells: ["6x6 Post", "PT Southern Yellow Pine", "10'"], price: "$55" },
      { cells: ["6x6 Post", "PT Southern Yellow Pine", "12'"], price: "$68" },
      { cells: ["LVL Beam", "Laminated Veneer Lumber", "1¾\" thick (1-ply)"], price: "$7.40 / lin ft" },
      { cells: ["LVL Beam", "Laminated Veneer Lumber", "3½\" thick (2-ply)"], price: "$14.50 / lin ft" },
      { cells: ["LVL Beam", "Laminated Veneer Lumber", "5¼\" thick (3-ply)"], price: "$21.50 / lin ft" },
      { cells: ["LVL Beam", "Laminated Veneer Lumber", "7\" thick (4-ply)"], price: "$28.50 / lin ft" },
      { cells: ["Western Red Cedar", "Specialty Softwood", "5/4 x 6"], price: "$4.95 / lin ft" },
      { cells: ["Ipe Hardwood", "Specialty Hardwood", "5/4 x 6"], price: "$8.75 / lin ft" },
    ],
  },
  {
    key: "hardware",
    filterColumns: ["Finish"],
    label: "Hardware",
    description: "Simpson Strong-Tie metal connectors and structural hardware.",
    columns: ["Product", "Type", "Finish"],
    priceLabel: "Retail",
    rows: [
      { cells: ["LUS28 Joist Hanger", "Joist Hanger (2x8)", "G90 Galvanized"], price: "$1.65 ea" },
      { cells: ["LUS210 Joist Hanger", "Joist Hanger (2x10)", "G90 Galvanized"], price: "$2.10 ea" },
      { cells: ["ABU66 Post Base", "Standoff Post Base (6x6)", "ZMAX Galvanized"], price: "$18.40 ea" },
      { cells: ["ABU44 Post Base", "Standoff Post Base (4x4)", "ZMAX Galvanized"], price: "$12.75 ea" },
      { cells: ["H1 Hurricane Tie", "Rafter / Hurricane Tie", "G90 Galvanized"], price: "$0.62 ea" },
      { cells: ["LSSU Stair Stringer Connector", "Adjustable Stringer Hanger", "G90 Galvanized"], price: "$5.95 ea" },
      { cells: ["DTT2Z Deck Tension Tie", "Lateral Load Connector", "ZMAX Galvanized"], price: "$9.80 ea" },
      { cells: ["½\" Carriage Bolt Kit", "Bolt / Nut / Washer", "Hot-Dip Galvanized"], price: "$1.85 ea" },
    ],
  },
  {
    key: "decking",
    filterColumns: ["Brand", "Collection", "Profile"],
    label: "Decking",
    description: "Composite & PVC decking by brand, collection, color, profile, and length.",
    columns: ["Brand", "Collection", "Color", "Profile", "Lengths"],
    priceLabel: "Retail",
    rows: [
      { cells: ["Trex", "Transcend Lineage", "Island Mist", "Grooved", "12' · 16' · 20'"], price: "$5.20 / lin ft" },
      { cells: ["Trex", "Transcend", "Island Mist", "Grooved", "12' · 16' · 20'"], price: "$4.80 / lin ft" },
      { cells: ["Trex", "Transcend", "Island Mist", "Solid", "12' · 16' · 20'"], price: "$4.80 / lin ft" },
      { cells: ["Trex", "Transcend", "Spiced Rum", "Grooved", "12' · 16' · 20'"], price: "$4.80 / lin ft" },
      { cells: ["Trex", "Transcend", "Tiki Torch", "Grooved", "12' · 16' · 20'"], price: "$4.80 / lin ft" },
      { cells: ["Trex", "Select", "Saddle", "Grooved", "12' · 16' · 20'"], price: "$2.95 / lin ft" },
      { cells: ["Trex", "Select", "Pebble Grey", "Grooved", "12' · 16' · 20'"], price: "$2.95 / lin ft" },
      { cells: ["Trex", "Enhance Naturals", "Toasted Sand", "Grooved", "12' · 16' · 20'"], price: "$2.65 / lin ft" },
      { cells: ["Trex", "Enhance Basics", "Clam Shell", "Grooved", "12' · 16' · 20'"], price: "$2.40 / lin ft" },
      { cells: ["Deckorators", "Voyage", "Costa", "Grooved", "12' · 16' · 20'"], price: "$4.45 / lin ft" },
      { cells: ["Deckorators", "Vista", "Mesa", "Grooved", "12' · 16' · 20'"], price: "$3.85 / lin ft" },
      { cells: ["TimberTech", "AZEK Vintage", "Coastline", "Grooved", "12' · 16' · 20'"], price: "$5.35 / lin ft" },
    ],
  },
  {
    key: "fascia",
    filterColumns: ["Brand", "Size"],
    label: "Fascia",
    description: "Composite fascia by brand, collection, and color. Available in 12' only.",
    columns: ["Brand", "Collection", "Color", "Size", "Length"],
    priceLabel: "Retail",
    rows: [
      { cells: ["Trex", "Transcend", "Island Mist", "1x8", "12'"], price: "$3.45 / lin ft" },
      { cells: ["Trex", "Transcend", "Island Mist", "1x12", "12'"], price: "$4.95 / lin ft" },
      { cells: ["Trex", "Transcend", "Spiced Rum", "1x12", "12'"], price: "$4.95 / lin ft" },
      { cells: ["Trex", "Select", "Saddle", "1x8", "12'"], price: "$2.55 / lin ft" },
      { cells: ["Trex", "Select", "Pebble Grey", "1x12", "12'"], price: "$3.65 / lin ft" },
      { cells: ["Deckorators", "Voyage", "Costa", "1x8", "12'"], price: "$3.20 / lin ft" },
      { cells: ["TimberTech", "AZEK Vintage", "Coastline", "1x12", "12'"], price: "$5.10 / lin ft" },
    ],
  },
  {
    key: "fasteners",
    filterColumns: ["Type"],
    label: "Deck Screws / Fasteners",
    description: "Hidden fastener systems, color-matched face screws, and structural screws.",
    columns: ["Product", "Type", "Coverage"],
    priceLabel: "Retail",
    rows: [
      { cells: ["Trex Hideaway Hidden Fastener", "Grooved-board hidden clip system", "~100 sq ft / box"], price: "$72.50 / box" },
      { cells: ["Trex Hideaway Universal Clip", "Start/finish + universal clips", "~50 sq ft / box"], price: "$39.00 / box" },
      { cells: ["Trex Color-Matched Face Screw", "#10 composite face screw", "350 ct / box"], price: "$44.00 / box" },
      { cells: ["Cortex Hidden Plug System (Trex)", "Plug + screw, color matched", "~100 sq ft / kit"], price: "$64.00 / kit" },
      { cells: ["Deckorators Hidden Fastener", "Hidden clip system", "~100 sq ft / box"], price: "$78.00 / box" },
      { cells: ["Composite Deck Screw", "#10 epoxy-coated", "1,750 ct / bucket"], price: "$128.00 / bucket" },
      { cells: ["Structural Wood Screw (SDWS)", "Simpson SDWS22 4\"", "50 ct / box"], price: "$34.50 / box" },
    ],
  },
  {
    key: "railing",
    filterColumns: ["Brand", "Material", "Component"],
    label: "Railing",
    description: "Railing by material, brand, color. Level & stair sections (6'/8') and 30\"/45\" posts.",
    columns: ["Brand", "Material", "Color", "Component"],
    priceLabel: "Retail",
    rows: [
      { cells: ["Trex", "Signature Aluminum", "Charcoal Black", "Level Section 6'"], price: "$138.00 ea" },
      { cells: ["Trex", "Signature Aluminum", "Charcoal Black", "Level Section 8'"], price: "$174.00 ea" },
      { cells: ["Trex", "Signature Aluminum", "Charcoal Black", "Stair Section 6'"], price: "$152.00 ea" },
      { cells: ["Trex", "Signature Aluminum", "Charcoal Black", "Stair Section 8'"], price: "$189.00 ea" },
      { cells: ["Trex", "Signature Aluminum", "Charcoal Black", "Post 30\""], price: "$42.00 ea" },
      { cells: ["Trex", "Signature Aluminum", "Charcoal Black", "Post 45\""], price: "$56.00 ea" },
      { cells: ["Trex", "Transcend Composite", "Classic White", "Level Section 6'"], price: "$124.00 ea" },
      { cells: ["Trex", "Transcend Composite", "Classic White", "Stair Section 6'"], price: "$139.00 ea" },
      { cells: ["Deckorators", "Aluminum", "Textured Black", "Level Section 6'"], price: "$132.00 ea" },
      { cells: ["Deckorators", "Aluminum", "Textured Black", "Post 45\""], price: "$52.00 ea" },
      { cells: ["Feeney", "CableRail / Aluminum", "Black", "Level Section 8'"], price: "$246.00 ea" },
    ],
  },
  {
    key: "lighting",
    filterColumns: ["Type"],
    label: "Lighting",
    description: "TrueScapes low-voltage deck lighting collection.",
    columns: ["Product", "Type", "Voltage"],
    priceLabel: "Retail",
    rows: [
      { cells: ["TrueScapes Step Light", "Recessed riser / step light", "12V LED"], price: "$28.50 ea" },
      { cells: ["TrueScapes Railing Post Cap Light", "Post cap light", "12V LED"], price: "$34.00 ea" },
      { cells: ["TrueScapes Under-Rail Light Strip", "Linear accent strip (4')", "12V LED"], price: "$46.00 ea" },
      { cells: ["TrueScapes Path / Riser Light", "Surface stair light", "12V LED"], price: "$31.50 ea" },
      { cells: ["TrueScapes Low-Voltage Fan / Transformer", "100W multi-tap transformer", "120V → 12V"], price: "$96.00 ea" },
      { cells: ["TrueScapes Wireless Dimmer + Timer", "Control module", "12V"], price: "$58.00 ea" },
    ],
  },
];

export const catalogTotalProducts = catalogSections.reduce((n, s) => n + s.rows.length, 0);

// ── Reports ─────────────────────────────────────────────────────────────────
export const reports = {
  kpis: {
    quotesCreated: 68,
    ordersRequested: 17,
    confirmedOrders: 11,
    leadsGenerated: 31,
    leadsAssigned: 18,
    estimatedRevenue: 428000,
    topProductLine: "Trex Transcend",
    topContractor: "Concept Design + Build",
    conversionRate: 22,
  },
  quotesByMonth: [
    { month: "Jan", quotes: 6, value: 138000 },
    { month: "Feb", quotes: 8, value: 176000 },
    { month: "Mar", quotes: 11, value: 241000 },
    { month: "Apr", quotes: 14, value: 312000 },
    { month: "May", quotes: 16, value: 358000 },
    { month: "Jun", quotes: 13, value: 428000 },
  ],
  topContractors: [
    { name: "Concept Design + Build", quoted: 142850, ordered: 87320 },
    { name: "Elite Outdoor Living", quoted: 96400, ordered: 54100 },
    { name: "Keystone Deck Builders", quoted: 71900, ordered: 38250 },
    { name: "Valley Outdoor Concepts", quoted: 38700, ordered: 19600 },
  ],
  topProductLines: [
    { line: "Trex Transcend", quotes: 26 },
    { line: "Trex Select", quotes: 18 },
    { line: "Trex Enhance", quotes: 11 },
    { line: "Deckorators Voyage", quotes: 8 },
    { line: "TimberTech AZEK Vintage", quotes: 5 },
  ],
};

// ── Dashboard home ────────────────────────────────────────────────────────────
export const dashboardMetrics = {
  activeContractors: 24,
  quotesThisMonth: 68,
  ordersRequested: 17,
  homeownerLeads: 31,
  estimatedRevenue: 428000,
  pendingReview: 9,
};

export const recentContractorActivity = [
  { contractor: "Concept Design + Build", action: "Requested Wehrung's review on Smith Residence", when: "10 min ago" },
  { contractor: "Elite Outdoor Living", action: "Created quote for Poolside Deck — Reynolds", when: "1 hr ago" },
  { contractor: "Concept Design + Build", action: "Updated material list on Anderson Backyard Deck", when: "2 hrs ago" },
  { contractor: "Keystone Deck Builders", action: "Submitted order request for Thompson Deck", when: "Yesterday" },
  { contractor: "Valley Outdoor Concepts", action: "Created quote for Patel Backyard Deck", when: "5 days ago" },
];

export const ordersPendingReview = projects.filter(
  (p) => p.status === "Pending Wehrung's Review" || p.status === "Wehrung's Review" || p.status === "Requested"
);

export const topContractorsByActivity = [...contractors].sort(
  (a, b) => b.quotedValue - a.quotedValue
);
