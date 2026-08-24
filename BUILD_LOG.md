# BUILD_LOG (frontend)

## 2026-08-24, Slice S17: CI

**Asked:** Add a CI quality gate for the frontend on the feat/customer-intelligence branch, matching the backend discipline.

**Generated:** .github/workflows/ci.yml (ubuntu, Node 20 with npm cache, npm ci, npm run lint, npx tsc --noEmit typecheck, npm run build).

**Changed or rejected:** Nothing rejected. Deploy stays on Vercel auto-deploy; CI is a quality gate only.

**Checks:** pending owner run of npm run lint, npx tsc --noEmit, npm run build on the branch.
