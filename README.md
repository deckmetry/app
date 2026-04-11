# Deckmetry

SaaS platform for the deck-building supply chain serving homeowners, contractors, and suppliers.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v10+
- A [Supabase](https://supabase.com/) project (for auth, database, and storage)
- A [Stripe](https://stripe.com/) account (for subscriptions and payments)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `NEXT_PUBLIC_APP_URL` | App URL (`http://localhost:3000` for local dev) |

See `.env.example` for the full list including Stripe price IDs and optional services.

### 3. Set up the database

Apply all Supabase migrations in order:

```bash
supabase db push
```

Or apply them manually from `supabase/migrations/` via the Supabase SQL editor.

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** Next.js 16 uses Turbopack by default. If you encounter the `Performance.measure` error in dev mode, it's a known Turbopack bug and doesn't affect production. You can use `pnpm dev --webpack` as a workaround.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (Turbopack) |
| `pnpm dev --webpack` | Start development server (Webpack) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Tailwind CSS v4, shadcn/ui
- **Database:** Supabase (PostgreSQL + RLS + Realtime)
- **Auth:** Supabase Auth (PKCE flow via `@supabase/ssr`)
- **Payments:** Stripe (Subscriptions + Connect)
- **Email:** Resend + React Email
- **State:** Zustand (client), TanStack Query (server)
- **PDF:** @react-pdf/renderer
- **Background Jobs:** Inngest

## Project Structure

```
app/
  (marketing)/        # Public pages (landing, pricing)
  (auth)/             # Login, signup, onboarding
  (dashboard)/
    homeowner/        # Homeowner dashboard
    contractor/       # Contractor dashboard
    supplier/         # Supplier dashboard
    admin/            # Admin panel
  api/                # Route handlers (webhooks, PDF, SSE)
components/
  ui/                 # shadcn/ui components
  deck-estimator/     # BOM wizard (steps + drawing views)
  project/            # Project management components
lib/
  actions/            # Server actions
  stores/             # Zustand stores
  supabase/           # Supabase client setup
  calculations.ts     # BOM calculation engine
  catalog.ts          # Product catalog data
  types.ts            # Domain types
supabase/
  migrations/         # SQL migration files
```
