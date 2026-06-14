# lumen-crm-frontend

Frontend for Lumen, an AI-native mini CRM for D2C brands. The product bet is
explainable AI: every AI output is shown next to the reasoning that produced it,
so a marketer can verify before acting. This app is the surface for that bet:
live campaign funnels, per-rule audience impact, AI rationale panels, a
propose-and-approve campaign flow, and a natural-language segment builder.

It talks to the `xeno-crm-backend` CRM API over HTTP. It does not contain
business logic for segments, dispatch, or the receipt loop; those live in the
backend.

## Stack

- Next.js (App Router) on React 19, deployed on Vercel.
- TypeScript, Tailwind CSS v4 (design tokens in `src/app/globals.css`).
- shadcn-style owned UI wrappers over Base UI primitives.
- TanStack Query for server state and polling, TanStack Table for data grids.
- recharts for the funnel and tier charts.
- framer-motion for the motion language (count-up tweens, staged entrances),
  gated on `prefers-reduced-motion`.
- Supabase SSR client for Google OAuth.
- zod plus react-hook-form for typed forms that mirror backend Pydantic.
- mermaid for the static diagrams on the architecture page.

## Pages

All app routes live under `src/app/(app)` behind the server auth guard.

| Route | What it shows |
|---|---|
| `/login` | Google OAuth sign-in plus the value proposition |
| `/dashboard` | KPI cards, tier mix, the single best next move, and a 10-second action row |
| `/customers` | Paginated customer book, tier filter chips, CSV import, detail sheet |
| `/segments` | Rule builder, natural-language to segment, live preview with per-rule impact |
| `/campaigns` | Campaign list and live status |
| `/campaigns/new` | Standard composer and the agentic goal-to-proposal flow |
| `/campaigns/[id]` | Live funnel that polls every 5s, failure breakdown, AI insight |
| `/architecture` | Static system diagrams and the explainability thesis, for reviewers |

## How to run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Build and lint:

```bash
npm run build
npm run lint
```

The backend CRM API must be running and reachable at `NEXT_PUBLIC_API_URL` for
data to load. See the backend README to start it.

## Environment

Set these in `.env.local` (gitignored):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the CRM API, for example http://localhost:8000 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL, for Google OAuth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |

All three are public client-side values by design. No server secrets live in
this app; the only privileged boundary is the backend, which verifies the
Supabase JWT on every CRM route.
