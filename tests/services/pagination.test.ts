import { describe, it, expect } from "vitest";
import { mockDataService } from "@/lib/services/mock/mock-data-service";

describe("mockDataService.projects pagination", () => {
  it("paginates published projects with has_more", async () => {
    const p1 = await mockDataService.projects.listPublished({ page: 1, page_size: 9 });
    expect(p1.items).toHaveLength(9);
    expect(p1.total).toBe(14);
    expect(p1.has_more).toBe(true);
    const p2 = await mockDataService.projects.listPublished({ page: 2, page_size: 9 });
    expect(p2.items).toHaveLength(5);
    expect(p2.has_more).toBe(false);
  });

  it("filters by category slug", async () => {
    const res = await mockDataService.projects.listPublished({ category_slug: "wedding", page_size: 50 });
    expect(res.items.length).toBe(2);
    expect(res.items.every((p) => p.category_id === "cat-wedding")).toBe(true);
  });
});
