# Architecture: The Domain / Service Seam

This document explains the layering introduced in Plan A ("Domain Model &
Service Seam") — the code that will let the public site and admin UI
(Plans B/C) be built entirely against mock data now, and then be pointed at a
real Supabase project later by changing **one file**.

If you are picking this codebase up with zero prior context, read this doc
before writing any UI code that fetches data.

## 1. The layering

```
src/lib/domain/         → plain TypeScript types (no logic, no I/O)
        ↑
src/lib/repositories/    → interfaces only (DataService, AuthService, and the
                            per-entity repository interfaces they're built from)
        ↑
src/lib/services/        → adapters that implement those interfaces, plus the
                            provider.ts accessor that hands one out
        ↑
UI (src/app/**, src/components/**)  → calls getDataService()/getAuthService()
```

Each layer only knows about the layer below it:

- **`src/lib/domain/`** (`project.ts`, `gallery.ts`, `content.ts`, `homepage.ts`,
  `enquiry.ts`, `settings.ts`, `admin.ts`, `taxonomy.ts`, `media.ts`,
  `enums.ts`) — one `.ts` file per entity group, re-exported from
  `src/lib/domain/index.ts`. These types have **no behavior**: no fetching, no
  validation, no Supabase/Cloudinary imports. They mirror spec §4 (Data Model)
  and §18 (Final Freeze Addendum) field-for-field. This is the layer both the
  mock adapter and the future Supabase adapter return data *as* — it's the
  contract UI code is written against and never changes when the backend
  changes.

- **`src/lib/repositories/`** (`types.ts` + `index.ts`) — interfaces only, no
  implementation. `types.ts` defines one repository interface per entity
  (`ProjectRepository`, `CategoryRepository`, `GalleryRepository`,
  `ServiceRepository`, `TestimonialRepository`, `HeroRepository`,
  `HomepageRepository`, `MediaRepository`, `EnquiryRepository`,
  `SettingsRepository`, `LegalRepository`) plus shared shapes
  (`Paginated<T>`, `ListProjectsArgs`, `ProjectWithMedia`,
  `GalleryWithItems`). `index.ts` composes all the per-entity repositories
  into two facade interfaces: `DataService` (one property per repository) and
  `AuthService` (`getSession`, `signIn`, `signOut`, `requireAdmin`). Every
  method on every repository/service is `async`, even the ones the mock
  adapter can answer synchronously — this is what makes swapping in a
  network-bound Supabase implementation a non-breaking change for callers.

- **`src/lib/services/`** — concrete adapters plus the accessor:
  - `services/mock/` — `fixtures.ts` (14 published projects across the 7
    portfolio categories: Wedding, Reception, Engagement, Birthday, Baby
    Shower, Corporate, Stage — plus galleries, services, testimonials, hero
    banners, homepage sections, site settings, SEO meta, legal pages, and the
    media assets those rows reference by `media_asset_id`, pointing at
    `/mock/*.jpg` URLs under `public/mock/` — as of this task that directory
    holds only a `README.md`, so those image URLs 404 until placeholder
    images are added), `mock-data-service.ts`
    (`DataService` implemented over those fixtures — filters to
    `workflow_status === 'published' && !deleted_at` in-memory, the mock's
    stand-in for spec §5's RLS/views predicate), and `mock-auth-service.ts`
    (`AuthService` implemented as a stub that is always "signed in" as a
    fabricated owner session).
  - `services/provider.ts` — the **single swap point**: `getDataService()` and
    `getAuthService()`, each currently returning the mock singletons.
  - `services/index.ts` — the only file UI code should import from; re-exports
    the two accessor functions plus the public types (`DataService`,
    `AuthService`, `Paginated`, `ListProjectsArgs`, `ProjectWithMedia`,
    `GalleryWithItems`, `SignInResult`) from `@/lib/repositories`.

- **UI** (not yet built — Plans B/C) will call
  `getDataService().projects.listPublished(...)`,
  `getAuthService().requireAdmin()`, etc., and receive plain domain objects.

## 2. The import rule

**UI and Server Action code may only import `getDataService()` /
`getAuthService()` (and the types re-exported alongside them) from
`@/lib/services`. Nothing may import `@/lib/services/mock/*` or a future
`@/lib/services/supabase/*` directly.**

```ts
// Correct — the only pattern UI code should ever use:
import { getDataService } from "@/lib/services";
const projects = await getDataService().projects.listPublished({ page: 1 });

// Wrong — never do this from UI/Server Action code:
import { mockDataService } from "@/lib/services/mock/mock-data-service";
```

This is why Plan A's Definition of Done includes "no UI or Server Action
exists yet that imports `mock/` directly" — as of this task, nothing consumes
the mock adapter yet (Plans B/C will, exclusively through `@/lib/services`).
Enforcing the rule means the day the Supabase adapter lands, every call site
in the app keeps working unmodified — only `provider.ts` changes (see §4
below).

One caveat: `provider.ts`, `mock-data-service.ts`, and `mock-auth-service.ts`
all start with `import "server-only"` — the accessors can only be called from
server-side code (Server Components, Server Actions, Route Handlers), not
from a `"use client"` component. Client components that need this data
receive it as **props from a Server Component** that already called
`getDataService()`; they never call the accessor themselves.

## 3. Why domain types are snake_case

Every field in `src/lib/domain/*.ts` uses the exact snake_case name it has in
the Postgres schema (spec §4/§18) — `workflow_status`, `deleted_at`,
`category_id`, `sort_order`, `cover_media_asset_id`, `featured_on_homepage`,
`usage_count`, and so on — rather than the camelCase that's conventional for
TypeScript/React code.

This is a deliberate trade against convention, made for one reason: **it makes
the eventual Supabase adapter a zero-mapping swap.** Supabase's
`@supabase/supabase-js` / PostgREST client returns query results as plain
objects whose keys are the Postgres column names verbatim — snake_case. If
the domain types were camelCase, every repository method in the future
`supabase-data-service.ts` would need a per-field mapping layer
(`{ workflowStatus: row.workflow_status, ... }`) for every one of the ~14
entities, which is exactly the kind of hand-written, drift-prone glue this
architecture exists to avoid. With snake_case domain types, a Supabase
repository method can do:

```ts
const { data } = await supabase.from("public_projects").select("*");
return data as Project[]; // no field renaming needed — the row already IS the domain shape
```

The cost is that UI code reads `project.workflow_status` instead of
`project.workflowStatus`. That's considered acceptable: it's a naming-style
preference, not a functional one, and it's paid once at write-time rather than
on every read at runtime.

## 4. Adding the Supabase adapter later

This is deferred until the client's hosted Supabase project exists (see the
Plan A "Deferred" note and spec §15). When that happens:

1. **Create `src/lib/services/supabase/supabase-data-service.ts`.** Implement
   the `DataService` interface (same shape as `mockDataService`): one object
   with `projects`, `categories`, `galleries`, `services`, `testimonials`,
   `hero`, `homepage`, `media`, `enquiries`, `settings`, `legal`, each an
   object implementing the matching repository interface from
   `src/lib/repositories/types.ts`. Each method queries Supabase via
   `@supabase/ssr` (or `@supabase/supabase-js` with the service role key on
   privileged paths) and returns the query rows **cast directly to the domain
   type** — no field mapping, per §3 above. Public reads should query the
   `public_*` views (`public_projects`, `public_project_media`,
   `public_services`, `public_testimonials`, `public_hero_banners`,
   `public_galleries`, `public_gallery_items`, `public_categories`,
   `public_media_assets`) described in spec §5, which already bake in the
   `workflow_status = 'published' AND deleted_at IS NULL` predicate that the
   mock adapter currently applies by hand in `mock-data-service.ts`. Pagination
   should preserve the `Paginated<T>` shape (`items`, `page`, `page_size`,
   `total`, `has_more`) so the `/portfolio?page=N` Load-More contract (spec
   §8.5) doesn't change. `enquiries.create` should follow spec §10: a
   zod-validated Server Action that inserts into `enquiries` with
   `status: 'new'` (see the inventory in §5 below for the exact TODO this
   replaces).

2. **Create `src/lib/services/supabase/supabase-auth-service.ts`.** Implement
   the `AuthService` interface using Supabase Auth per spec §12:
   `getSession()` reads the `@supabase/ssr` cookie session and, if present,
   loads the matching `admin_profiles` row; `signIn(email, password)` calls
   Supabase Auth's password sign-in and returns `{ ok, session }` or
   `{ ok: false, error }`; `signOut()` clears the Supabase session cookie;
   `requireAdmin()` calls `getSession()` and redirects unauthenticated
   requests to `/admin/login` (throwing/redirecting exactly where
   `mock-auth-service.ts` currently just returns the stub unconditionally).

3. **Flip the two returns in `src/lib/services/provider.ts`** — and nothing
   else:

   ```ts
   // Before:
   export function getDataService(): DataService {
     return mockDataService;
   }
   export function getAuthService(): AuthService {
     return mockAuthService;
   }

   // After:
   export function getDataService(): DataService {
     return supabaseDataService;
   }
   export function getAuthService(): AuthService {
     return supabaseAuthService;
   }
   ```

   Update the two imports at the top of `provider.ts` to point at the new
   `supabase/` files instead of `mock/`. Because every call site in the app
   went through `getDataService()`/`getAuthService()` (§2 above), no UI file,
   Server Action, or test double needs to change. The mock adapter and its
   fixtures can stay in the repo afterward for local dev/tests, or be removed
   — either way it's no longer reachable from `provider.ts`.

## 5. Inventory of every `// TODO(supabase):` marker

Grepped from the current tree (`grep -rn "TODO(supabase)" src/`) — this list
must be kept in sync as new markers are added or removed in later plans:

| File : line | Marker text | What it connects to |
|---|---|---|
| `src/lib/services/provider.ts:8` | `return supabaseDataService / supabaseAuthService here.` | The single swap point described in §4 above — the two `provider.ts` return statements that currently return `mockDataService`/`mockAuthService`. |
| `src/lib/services/mock/mock-data-service.ts:108` | `replace with a Server Action inserting into the \`enquiries\` table (service role).` | `EnquiryRepository.create`. Spec §10 (Enquiry → WhatsApp Flow): a zod-validated Server Action inserts a `status: 'new'` row into `enquiries` using the service role key; the client then builds the `wa.me` deep link from `site_settings` and opens it. The mock's in-memory `enquiries` array is the local stand-in for that insert. |
| `src/lib/services/mock/mock-auth-service.ts:5` | `replace the entire stub with Supabase Auth (@supabase/ssr cookie session) + admin_profiles lookup + real requireAdmin() that redirects unauthenticated users.` | The whole `AuthService` implementation. Spec §12 (Security): admin auth is Supabase Auth (email/password) via `@supabase/ssr` cookie sessions, joined against `admin_profiles` (spec §4.13) for role/profile data. |
| `src/lib/services/mock/mock-auth-service.ts:15` | `read the real cookie session. Mock: always "signed in" for UI dev.` | `AuthService.getSession()` — should read the `@supabase/ssr` session cookie instead of unconditionally returning `STUB_SESSION`. |
| `src/lib/services/mock/mock-auth-service.ts:19` | `verify credentials via Supabase Auth. Mock: always succeeds.` | `AuthService.signIn()` — should call Supabase Auth's password sign-in instead of always returning `{ ok: true }`. |
| `src/lib/services/mock/mock-auth-service.ts:23` | `clear the Supabase session cookie. Mock: no-op.` | `AuthService.signOut()` — should clear the real session cookie instead of doing nothing. |
| `src/lib/services/mock/mock-auth-service.ts:26` | `redirect('/admin/login') when no admin session. Mock: always returns the stub.` | `AuthService.requireAdmin()` — should redirect unauthenticated requests per spec §12 instead of always returning the stub owner session. |

Every backend seam that will need real infrastructure carries one of these
markers; there is no seam that silently lacks one.

## 6. Related reading

- `docs/database-er-diagram.md` — the Postgres schema (spec §4) that the
  domain types mirror.
- `docs/folder-structure.md` — where `domain/`, `repositories/`, `services/`,
  and `public/mock/` live in the repo tree.
- `docs/superpowers/specs/2026-07-27-3-star-decoration-design.md` — the full
  frozen spec; §5 (RLS/views), §10 (enquiry flow), and §12 (security/auth) are
  the sections referenced above.
