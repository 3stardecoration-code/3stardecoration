# Environment Variables

All environment variables are declared and validated in `src/lib/env.ts` via a
Zod schema (`parseEnv`), which throws with a descriptive error at startup if
anything required is missing or malformed. `.env.example` mirrors this table
and should be kept in sync with `env.ts`.

| Variable | Required? | Where to get it | Example value |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Local: printed by `npx supabase start`. Hosted: Supabase Dashboard → Project Settings → API → Project URL. | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Local: `npx supabase start` output. Hosted: Supabase Dashboard → Project Settings → API → `anon` `public` key. | `<from supabase start output>` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Local: `npx supabase start` output. Hosted: Supabase Dashboard → Project Settings → API → `service_role` key. **Server-only — never expose to the client.** | `<from supabase start output>` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary Dashboard → Home (cloud name shown at the top). | `demo` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary Dashboard → Settings → API Keys. Only needed for signed uploads (Phase 3); a placeholder is fine until then. | `changeme` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary Dashboard → Settings → API Keys. **Server-only — never expose to the client.** Only needed for signed uploads (Phase 3). | `changeme` |
| `NEXT_PUBLIC_SITE_URL` | Yes | The canonical site origin for the current environment. | `http://localhost:3000` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | No (optional) | Google Analytics 4 → Admin → Data Streams → Measurement ID. Leave unset to disable GA4. | `G-XXXXXXXXXX` |

## Notes

- Variables prefixed `NEXT_PUBLIC_` are inlined into the client bundle at build
  time by Next.js; everything else is server-only.
- `parseEnv` is called eagerly at module load (`export const env = parseEnv(process.env)`),
  so a missing/invalid required variable fails fast rather than surfacing as a
  runtime error deep in the app.
- CI (`.github/workflows/ci.yml`) supplies placeholder values for all required
  variables so `npm run build` can succeed without real credentials; no
  Cloudinary or Supabase project is contacted during the build step.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SITE_URL` are validated as URLs
  (`z.string().url()`); the rest of the required variables are validated as
  non-empty strings.
