import "@testing-library/jest-dom/vitest";

// Set test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "http://127.0.0.1:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "anon-test";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "service-test";
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||= "demo";
process.env.CLOUDINARY_API_KEY ||= "key-test";
process.env.CLOUDINARY_API_SECRET ||= "secret-test";
process.env.NEXT_PUBLIC_SITE_URL ||= "http://localhost:3000";
