import "@testing-library/jest-dom/vitest";

// CRITICAL: These env-var stubs are required because src/lib/env.ts validates process.env
// eagerly at module-import time via `export const env = parseEnv(process.env)`. Without
// these fallbacks, any test that transitively imports src/lib/env.ts will throw with
// "Invalid environment: <fieldname>: Invalid input..." before the test can even run.
// These use `||=` so real env vars (from .env.local) are NOT overridden. However, any test
// that needs to exercise a REAL Supabase/Cloudinary instance must ensure real env vars
// are loaded (via .env.local) BEFORE this file runs, or it will silently get these fake
// values instead of a clear "missing env var" error.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "http://127.0.0.1:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "anon-test";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "service-test";
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||= "demo";
process.env.CLOUDINARY_API_KEY ||= "key-test";
process.env.CLOUDINARY_API_SECRET ||= "secret-test";
process.env.NEXT_PUBLIC_SITE_URL ||= "http://localhost:3000";
