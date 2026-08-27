# BUILD_LOG (frontend)

## 2026-08-24, Slice S17: CI

**Asked:** Add a CI quality gate for the frontend on the feat/customer-intelligence branch, matching the backend discipline.

**Generated:** .github/workflows/ci.yml (ubuntu, Node 20 with npm cache, npm ci, npm run lint, npx tsc --noEmit typecheck, npm run build).

**Changed or rejected:** Nothing rejected. Deploy stays on Vercel auto-deploy; CI is a quality gate only.

**Checks:** pending owner run of npm run lint, npx tsc --noEmit, npm run build on the branch.

## 2026-08-27, Slice S29: Production launch pass (Parts 2-5)

**Asked:** 5-part production launch pass: audit, discoverability, legal pages, mobile audit at 390px, finish launch pass.

**Generated:**
- Discoverability: root layout metadata (title template, OG, Twitter cards, robots), per-page layout.tsx with unique titles/descriptions for today/dashboard/customers/architecture/login, updated titles for segments/campaigns/campaigns-new. Dynamic OG image (opengraph-image.tsx), favicon (icon.tsx), apple-touch-icon (apple-icon.tsx), favicon.svg, robots.ts, sitemap.ts.
- Legal: privacy/page.tsx (9 sections), terms/page.tsx (10 sections), CookieBanner.tsx (accept/reject, localStorage), integrated in root layout.
- Footer: Privacy/Terms links on landing page footer and login page legal text.
- Custom 404: not-found.tsx with back-to-dashboard link.
- Mobile (390px): hamburger button size-9 to size-11 (44px tap target), drawer close buttons p-1/p-1.5 to p-2.5, TopBar left padding for hamburger clearance (pl-16), sticky bottom CTA on landing page (md:hidden), footer bottom padding for CTA clearance.

**Changed or rejected:** No analytics installed (user placeholder, no tool specified). Thank-you pages not needed (ComingSoon already has inline success state). Loading/error states already comprehensive (113 occurrences, 16 files).

**Checks:** `next build` green (19 routes). No horizontal scroll at 375px (verified via JS). All routes present: /privacy, /terms, /_not-found, /sitemap.xml, /robots.txt, /icon, /apple-icon, /opengraph-image.

## 2026-08-28, Slice S30: SMB positioning, Groq model fix, deploy

**Asked:** Fix "LLM providers unavailable" error, update landing page with SMB/ICP positioning, update READMEs, check if Groq model deprecated.

**Generated:**
- Backend: replaced deprecated `llama-3.3-70b-versatile` (deprecated Aug 16 on Groq) with `qwen/qwen3.6-27b` in config.py, .env.example, render.yaml. Fixed .env bug where SUPABASE_JWT_SECRET and DEFAULT_TENANT_ID were concatenated on same line (tenant fallback never worked). Updated render.yaml with correct CORS_ORIGINS, GROQ_MODEL, DEFAULT_TENANT_ID.
- Frontend landing page: rewrote with SMB positioning. ICP: "small D2C brands, 5-person teams". New "Who this is for" section, "Why Lumen" section (explainability, money framing, decision-not-dashboard), Klaviyo comparison framing. New WhyCard component.
- Both READMEs: added SMB tagline, ICP, live links.
- Architecture page: updated Groq model reference to Qwen 3.6, updated operational signals and multi-tenancy status.
- Sidebar: AI status strip now shows "Qwen 3.6" instead of "Groq".

**Changed or rejected:** Nothing rejected.

**Checks:** `next build` green (19 routes). Both repos committed, pushed, merged to master. Render + Vercel auto-deploy triggered.
