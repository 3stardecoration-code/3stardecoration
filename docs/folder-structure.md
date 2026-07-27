# Folder Structure

Current top-level layout of the repo (Phase 0). This will grow as later phases
add public pages, admin UI, and the Supabase schema; keep this doc in sync as
that happens.

```
3stardecoration/
├── .github/
│   └── workflows/          CI pipeline definitions (GitHub Actions)
├── docs/
│   └── superpowers/        Planning artifacts: specs and dated implementation plans
├── public/                 Static assets served as-is (favicons, placeholder SVGs)
├── src/
│   ├── app/                Next.js App Router: routes, layouts, API route handlers
│   ├── components/         Shared React components (currently: providers)
│   ├── hooks/               Shared React hooks (e.g. reduced-motion detection)
│   ├── lib/                 Framework-agnostic app code: env parsing, design tokens,
│   │                        Cloudinary loader, observability helpers
│   └── instrumentation.ts  Next.js instrumentation hook (server startup, error reporting)
├── tests/                  Vitest unit tests, one file per module under src/
├── .env.example            Template for local environment variables
├── vitest.config.ts        Vitest configuration
├── next.config.ts          Next.js configuration
└── package.json
```

## Top-level directory purposes

| Directory | Purpose |
|---|---|
| `.github/workflows` | CI workflow (`ci.yml`): lint, typecheck, unit tests, build on every push/PR. |
| `docs` | Human-readable documentation: this file, environment variables, ER diagram, and the `superpowers/` planning specs & plans. |
| `public` | Files served verbatim at the site root (icons, static SVGs). |
| `src/app` | Next.js App Router — pages, layouts, and route handlers (e.g. `src/app/api/health/route.ts`). |
| `src/components` | Reusable React components shared across routes (e.g. `SmoothScrollProvider`). |
| `src/hooks` | Reusable React hooks (e.g. `usePrefersReducedMotion`). |
| `src/lib` | Non-UI application code: typed env access (`env.ts`), design tokens (`tokens.ts`), the Cloudinary `next/image` loader, and the `observability/` error-reporting helper. |
| `tests` | Vitest test suite, mirroring `src/lib` and `src/hooks` modules one-to-one. |

## Not yet present (deferred)

- `supabase/` (migrations, seed data, config) — Tasks 6–9 of the Phase 0 plan are
  deferred until the client's hosted Supabase project exists. The schema they will
  create is documented ahead of time in `docs/database-er-diagram.md`, sourced from
  the plan document rather than from files in this repo.
- `tests/db/rls.test.ts` — the RLS integration test from Task 8's plan; not
  runnable until a real Supabase project is linked.
