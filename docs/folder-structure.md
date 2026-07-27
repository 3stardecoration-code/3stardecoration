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
├── public/                 Static assets served as-is (favicons, SVGs)
│   └── demo-assets/        TEMPORARY royalty-free luxury-event photos (Unsplash) for the demo;
│                            referenced by fixtures.ts via `/demo-assets/*.jpg`. Replaced by real
│                            Cloudinary media once the CMS is connected (see the folder's README.md)
├── src/
│   ├── app/                Next.js App Router: routes, layouts, API route handlers
│   ├── components/         Shared React components (currently: providers)
│   ├── hooks/               Shared React hooks (e.g. reduced-motion detection)
│   ├── lib/                 Framework-agnostic app code: env parsing, design tokens,
│   │                        Cloudinary loader, observability helpers
│   │   ├── domain/          Plain snake_case entity types mirroring spec §4 (no logic/I-O)
│   │   ├── repositories/    Repository + DataService/AuthService interfaces (no implementation)
│   │   └── services/        Adapters implementing those interfaces + the provider.ts accessor
│   │       └── mock/        Mock DataService/AuthService over in-memory fixtures (pre-Supabase)
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
| `public/demo-assets` | **Temporary** royalty-free luxury-event photos (Unsplash) referenced by `src/lib/services/mock/fixtures.ts` via `/demo-assets/*.jpg` — 25 event photos (1600×1067) + 2 hero images (2400×1350). Present for a production-ready demo; swapped for the client's real Cloudinary assets once the CMS is connected (see `public/demo-assets/README.md`). |
| `src/app` | Next.js App Router — pages, layouts, and route handlers (e.g. `src/app/api/health/route.ts`). |
| `src/components` | Reusable React components shared across routes (e.g. `SmoothScrollProvider`). |
| `src/hooks` | Reusable React hooks (e.g. `usePrefersReducedMotion`). |
| `src/lib` | Non-UI application code: typed env access (`env.ts`), design tokens (`tokens.ts`), the Cloudinary `next/image` loader, and the `observability/` error-reporting helper. |
| `src/lib/domain` | Plain TypeScript entity types (snake_case, mirroring the Postgres schema in spec §4/§18) — no logic, no I/O. |
| `src/lib/repositories` | `DataService`/`AuthService` and per-entity repository interfaces only; no implementation lives here. |
| `src/lib/services` | Concrete adapters implementing the repository interfaces, plus `provider.ts` (`getDataService()`/`getAuthService()` — the single seam UI code imports from) and `mock/` (the fixture-backed adapter used until Supabase is connected). See `docs/architecture-service-seam.md`. |
| `tests` | Vitest test suite, mirroring `src/lib` and `src/hooks` modules one-to-one. |

## Not yet present (deferred)

- `supabase/` (migrations, seed data, config) — Tasks 6–9 of the Phase 0 plan are
  deferred until the client's hosted Supabase project exists. The schema they will
  create is documented ahead of time in `docs/database-er-diagram.md`, sourced from
  the plan document rather than from files in this repo.
- `tests/db/rls.test.ts` — the RLS integration test from Task 8's plan; not
  runnable until a real Supabase project is linked.
