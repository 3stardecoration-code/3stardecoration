import { describe, it, expect, vi } from "vitest";
import { reportError, __setAdapter } from "@/lib/observability/report-error";

describe("reportError", () => {
  it("forwards errors + context to the active adapter", async () => {
    const spy = vi.fn();
    __setAdapter({ capture: spy });
    const err = new Error("boom");
    await reportError(err, { route: "/x" });
    expect(spy).toHaveBeenCalledWith(err, { route: "/x" });
  });
});
