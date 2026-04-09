# Deckmetry — Claude Code Context

## Project Overview

Deckmetry is a **SaaS platform for the deck-building supply chain** serving three personas:
- **Homeowners** — Generate accurate BOMs, get professional drawings, request contractor reviews
- **Contractors** — Quote materials, build professional proposals, manage the order-to-delivery workflow
- **Suppliers** — Receive and track the full sales cycle: BOM → Quote → Approval → Invoice → Payment → Delivery

**North Star Metric**: "Projects Fully Completed Through Deckmetry" — estimate created + proposal signed + order submitted + delivery confirmed.

---

## Current State (as of April 2026)

The app is a **fully client-side Next.js 16 wizard** — no backend, no auth, no persistence.

What exists and works:
- 6-step deck estimator wizard: Job Info → Geometry → Surface → Railing/Stairs → Add-ons → Review/BOM
- Complete BOM calculation engine (`app/lib/calculations.ts`)
- SVG-based deck floor plan visualization with layer toggles
- Full shadcn/ui component library (50+ components already installed)
- Supports brands: Trex, TimberTech, Deckorators (hardcoded in `app/lib/catalog.ts`)

What does NOT exist yet:
- Auth / user accounts
- Any backend or database
- Multi-tenant data model
- Stripe subscriptions
- PDF generation
- Real-time order tracking

---

## Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | **Next.js 16 App Router** | Server Actions + Route Handlers + RSC |
| Frontend UI | **React 19** + Tailwind v4 + shadcn/ui | Already in use |
| Database | **Supabase** (PostgreSQL) | Auth + RLS + Realtime + Storage |
| Auth | **Supabase Auth** (PKCE) | Cookie-based, App Router compatible via `@supabase/ssr` |
| Payments | **Stripe** (Subscriptions + Connect) | Subscriptions + supplier payouts via Connect |
| Email | **Resend** + React Email | Transactional emails |
| PDF | **@react-pdf/renderer** | Server-side, no Chrome/Puppeteer needed on Vercel |
| Background jobs | **Inngest** | Order pipeline, invoice generation, email sequences |
| Server state | **TanStack Query v5** | Caching, mutations, invalidation |
| Client state | **Zustand v5** | Wizard form state, drawing layers, UI state |
| Deployment | **Vercel** | Next.js hosting, Preview per PR |
| Forms | React Hook Form + Zod | Already installed |

---

## Architecture Decisions

### State Management
- **TanStack Query** for server state (estimates, orders, quotes) — replace current absence of caching
- **Zustand** for UI state (wizard form, drawing layers, sidebar) — replace prop-drilling in `wizard-shell.tsx`
- **React Hook Form + Zod** for forms (login, signup, quote builder, profiles)
- **Supabase Realtime** for live updates (order status, notifications, activity feeds)

### Server Actions vs Route Handlers
- **Server Actions**: all mutations triggered from UI (save estimate, create proposal, update status)
- **Route Handlers**: webhooks (Stripe), binary responses (PDF streaming), SSE (notifications), public token-based URLs (proposal approval links)

### Multi-Tenancy Model
Every entity is scoped to an `organization_id`. Users belong to organizations via `organization_members` with roles (owner/admin/member/viewer). A user can belong to multiple orgs (e.g., both a homeowner and a contractor).

### Calculation Engine
`lib/calculations.ts` runs **both client-side** (real-time wizard preview) AND server-side (Server Actions call it authoritatively). No duplication — just shared from `lib/`.

### Catalog Migration
`catalog.ts` hardcoded data → `catalog_brands`, `catalog_collections`, `catalog_colors`, `catalog_railing_systems`, `jurisdiction_profiles` tables in Supabase. Allows product updates without code deploys.

---

## App Router Structure

```
app/
  (marketing)/          # Public landing, pricing, features
  (auth)/               # Login, signup, role-based onboarding
  (dashboard)/
    homeowner/          # Estimates, drawings, review requests
    contractor/         # Pipeline, quote builder, proposals, orders
    supplier/           # Order inbox, quotes, invoices, deliveries
    admin/              # User management, catalog
  api/
    webhooks/stripe/    # Stripe webhook handler (raw body)
    estimates/[id]/bom/export/  # PDF streaming
    notifications/      # SSE stream
    auth/callback/      # Supabase PKCE exchange
```

---

## Database Schema (Supabase/PostgreSQL)

### Core Tables
- `organizations` — multi-tenant root (homeowner/contractor/supplier types)
- `users` — mirrors `auth.users`, extended profile
- `organization_members` — user ↔ org join with roles

### Stripe Sync Tables (nextjs-subscription-payments pattern)
- `products` — synced from Stripe via webhook
- `prices` — synced from Stripe via webhook
- `subscriptions` — org-level Stripe subscription state

### Catalog Tables (replaces hardcoded catalog.ts)
- `catalog_brands`, `catalog_collections`, `catalog_colors`
- `catalog_railing_systems`, `catalog_railing_colors`
- `catalog_stock` — framing lengths, waste factors, lighting watts
- `jurisdiction_profiles` — soil bearing, frost depth per region

### Estimation Tables
- `estimates` — the wizard output; stores both FK refs and name snapshots (for history)
- `estimate_line_items` — normalized BOM rows (replaces JSON blob)
- `estimate_stair_sections` — normalized stair configs
- `deck_drawings` — SVG/PDF drawing files in Supabase Storage

### Sales Workflow Tables
- `quotes` — contractor → homeowner proposals
- `quote_line_items` — with GENERATED computed totals
- `approvals` — homeowner e-signature records
- `orders` — contractor → supplier purchase orders
- `order_line_items` — with GENERATED computed totals
- `invoices` — supplier → contractor invoices (Stripe invoice sync)
- `payments` — payment records linked to Stripe
- `deliveries` — shipment tracking with POD

### Communication & Audit
- `notifications` — in-app, Supabase Realtime subscribed
- `reviews` — professional engineer review requests
- `comments` — threaded, polymorphic per entity
- `activity_log` — **immutable** audit trail, no deletes

### Key Design Patterns
- **Soft deletes** everywhere (`deleted_at TIMESTAMPTZ`)
- **Snapshot denormalization** on estimates (store product name alongside FK — essential for legal documents)
- **Auto-generated numbers** via sequences: `Q-2026-00042`, `PO-2026-00099`, `INV-2026-00155`
- **Generated columns** for line totals: `quantity * unit_price` computed at DB level
- **Share tokens** on estimates: hex-encoded random bytes, no auth required

### RLS Policy Summary
- Homeowners: see only their own org's estimates/quotes
- Contractors: see their estimates + estimates shared with their org (via `shared_with_org_id`) + their quotes/orders
- Suppliers: see ONLY orders directed to them (`supplier_org_id`) and only after submission (not drafts)
- All users: see their own notifications only
- Catalog tables: public SELECT (no auth required)

---

## Subscription Pricing

| Persona | Free | Entry Paid | Growth |
|---------|------|-----------|--------|
| Homeowner | Always free | — | — |
| Contractor | Starter (3 projects/mo) | **Pro: $79/mo** | Team: $199/mo |
| Supplier | Directory listing only | **Connected: $199/mo** | Enterprise: custom |

Plus: 1.5% transaction fee on homeowner deposits collected via Deckmetry (capped $150).

Target Month 12 ARR: ~$168K

---

## Implementation Roadmap

### Phase 1 — Auth + Persistence (2 weeks)
1. Install `@supabase/supabase-js`, `@supabase/ssr`, configure client/server clients
2. Auth pages (login, signup with role selection, onboarding per role)
3. Middleware: route protection + role-based redirects
4. Create `profiles`, `organizations`, `organization_members` tables with RLS
5. Server Action: `saveEstimate()` — wizard saves to DB, revalidates dashboard
6. Refactor `wizard-shell.tsx` → Zustand stores (`wizard-store.ts`, `drawing-store.ts`)

### Phase 2 — Contractor Workflow + Proposals (2 weeks)
7. `(dashboard)/contractor/` — pipeline page, estimates list
8. Quote builder page (`/contractor/estimates/[id]/quote`)
9. Proposal builder + PDF generation via `@react-pdf/renderer`
10. Share token system + proposal review URL (public, no auth)
11. Resend integration — proposal sent/approved emails via Inngest

### Phase 3 — Stripe Subscriptions (1 week)
12. Supabase webhook sync for `products` and `prices` tables
13. Checkout flow for contractor/supplier plans
14. Stripe webhook handler for subscription events
15. Feature gating in Server Actions based on plan

### Phase 4 — Supplier Workflow + Orders (3 weeks)
16. `(dashboard)/supplier/` — order inbox, quote workflow
17. Order creation from approved quote
18. Invoice generation + Stripe Connect for supplier payouts
19. Inngest order pipeline workflow

### Phase 5 — Realtime + Notifications (1 week)
20. Enable Supabase Realtime on `orders`, `notifications`, `quotes`, `deliveries`
21. SSE notification endpoint (`/api/notifications`)
22. In-app notification inbox + bell icon

---

## File Structure (Current)

```
app/
  app/
    layout.tsx          # Root layout (needs Supabase provider + nav shell)
    page.tsx            # Single page → WizardShell (the whole current app)
    globals.css
  components/
    ui/                 # Full shadcn/ui library (50+ components, ready to use)
    deck-estimator/
      wizard-shell.tsx  # MONOLITH — 1,400+ lines, must be split in Phase 1
      deck-views.tsx    # Clean SVG views (TopView, FrontView, etc.) — keep this
      steps/
        job-info-step.tsx
        geometry-step.tsx
        surface-step.tsx
        railing-stairs-step.tsx
        add-ons-step.tsx
        review-step.tsx  # Contains BOM edit state — needs lifting to Zustand
    theme-provider.tsx
  lib/
    types.ts            # Canonical domain types — extend, never shrink
    calculations.ts     # BOM engine — lift to shared server+client path
    catalog.ts          # Hardcoded product data — migrate to DB in Phase 1+
    store.ts            # NOT a store — just constants; replace with Zustand
    utils.ts            # cn() and helpers
  hooks/
    use-toast.ts
    use-mobile.ts
  styles/
    globals.css
```

---

## New Components to Build

### Shared (all dashboards)
- `StatusBadge` — maps order/quote/estimate status to colors
- `DataTable` — generic table with TanStack Table (sort, filter, pagination, empty state)
- `EntityCard` — card for listing estimates/orders/quotes in grid view
- `ActivityFeed` — Supabase Realtime event stream
- `PageHeader` — consistent page-level header with breadcrumbs + actions
- `MetricCard` — KPI display with optional sparkline
- `OrderTimeline` — horizontal stepper: BOM → Quoted → Approved → Invoiced → Paid → Delivered
- `BomTable` — extracted from `review-step.tsx`, standalone editable BOM component
- `DrawingPanel` — extracted from `wizard-shell.tsx`, standalone SVG panel

### Wizard Refactor
- `WizardShell` — thin container (reads Zustand, renders layout)
- `WizardNavigation` — prev/next + step indicator bar
- `DeckDrawingPanel` — right panel with layer toggles
- `DeckDrawingCanvas` — pure SVG, `React.memo`, selector-based re-render

---

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server-only

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONTRACTOR_PRO_PRICE_ID=
STRIPE_CONTRACTOR_TEAM_PRICE_ID=
STRIPE_SUPPLIER_CONNECTED_PRICE_ID=

# Resend
RESEND_API_KEY=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# App
NEXT_PUBLIC_APP_URL=https://app.deckmetry.com
```

---

## Deployment

- **Vercel** for Next.js (use Vercel Supabase integration for env var sync)
- **Supabase Cloud Pro** ($25/mo) — do NOT use free tier (auto-pauses)
- **Inngest Cloud** — free tier covers early launch volume
- Two environments: `staging` (Preview deploys on PRs) + `production` (deploys from `main`)
- GitHub Actions CI: lint → typecheck → test → deploy

---

## Key Dependencies to Add

```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add @tanstack/react-query @tanstack/react-table
pnpm add zustand
pnpm add stripe @stripe/stripe-js
pnpm add resend @react-email/components
pnpm add inngest
pnpm add @react-pdf/renderer
pnpm add @dnd-kit/core @dnd-kit/sortable
pnpm add framer-motion
pnpm add react-dropzone
```

---

## Supabase Realtime Tables

Enable realtime publication on: `notifications`, `orders`, `deliveries`, `invoices`, `quotes`, `reviews`

---

## Storage Buckets

| Bucket | Public | Contents |
|--------|--------|---------|
| `deck-drawings` | No | SVG/PNG deck drawings |
| `quote-pdfs` | No | Proposal PDFs |
| `invoice-pdfs` | No | Invoice PDFs |
| `review-attachments` | No | PE review docs |
| `delivery-photos` | No | Proof of delivery photos |
| `org-assets` | Yes | Contractor/supplier logos |

---

## Critical Warnings

1. **Do not refactor `wizard-shell.tsx` partially** — Zustand migration must be done atomically or the wizard breaks
2. **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client** — only use in Server Actions and Route Handlers
3. **Stripe webhooks require raw body** — use `request.text()`, not `request.json()`
4. **Supabase Auth PKCE requires `@supabase/ssr`** — not the older `auth-helpers-nextjs`
5. **`catalog.ts` is seed data** — the DB tables are the source of truth; catalog.ts becomes a migration script
6. **`activity_log` is immutable** — never add `updated_at` or `deleted_at`; inserts via service role only
