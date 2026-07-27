import { describe, it, expect } from "vitest";
import { parseEnv } from "@/lib/env";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo",
  CLOUDINARY_API_KEY: "key",
  CLOUDINARY_API_SECRET: "secret",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("parseEnv", () => {
  it("parses a valid environment", () => {
    expect(parseEnv(valid).NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME).toBe("demo");
  });
  it("throws when a required var is missing", () => {
    const { CLOUDINARY_API_SECRET, ...missing } = valid;
    expect(() => parseEnv(missing)).toThrow(/CLOUDINARY_API_SECRET/);
  });
  it("throws when a URL is malformed", () => {
    expect(() => parseEnv({ ...valid, NEXT_PUBLIC_SITE_URL: "not-a-url" })).toThrow();
  });
});
