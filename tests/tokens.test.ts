import { describe, it, expect } from "vitest";
import { tokens } from "@/lib/tokens";

describe("design tokens", () => {
  it("exposes core brand colors", () => {
    expect(tokens.color.ivory).toMatch(/^#/);
    expect(tokens.color.charcoal).toMatch(/^#/);
    expect(tokens.color.accent).toMatch(/^#/);
  });
});
