import { describe, it, expect } from "vitest";
import { mockAuthService } from "@/lib/services/mock/mock-auth-service";

describe("mockAuthService", () => {
  it("signIn always succeeds with a stub owner session", async () => {
    const res = await mockAuthService.signIn("owner@example.com", "whatever");
    expect(res.ok).toBe(true);
    expect(res.session?.profile.role).toBe("owner");
  });
  it("getSession returns the stub session", async () => {
    expect(await mockAuthService.getSession()).not.toBeNull();
  });
  it("requireAdmin returns the session (never throws in mock)", async () => {
    const s = await mockAuthService.requireAdmin();
    expect(s.email).toBeTruthy();
  });
});
