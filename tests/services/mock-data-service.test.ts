import { describe, it, expect } from "vitest";
import { mockDataService } from "@/lib/services/mock/mock-data-service";

describe("mockDataService reads", () => {
  it("returns only featured projects for the homepage", async () => {
    const featured = await mockDataService.projects.listFeatured();
    expect(featured.length).toBeGreaterThanOrEqual(3);
    expect(featured.every((p) => p.featured_on_homepage)).toBe(true);
  });

  it("gets a project with its ordered media by slug", async () => {
    const res = await mockDataService.projects.getBySlug("ivory-garden-wedding");
    expect(res).not.toBeNull();
    expect(res!.project.title).toBe("Ivory Garden Wedding");
    expect(res!.media.length).toBe(4);
    expect(res!.media.map((m) => m.sort_order)).toEqual([1, 2, 3, 4]);
  });

  it("returns null for an unknown slug", async () => {
    expect(await mockDataService.projects.getBySlug("nope")).toBeNull();
  });

  it("lists 7 categories and the enabled homepage sections", async () => {
    expect(await mockDataService.categories.list()).toHaveLength(7);
    const sections = await mockDataService.homepage.listEnabledSections();
    expect(sections.map((s) => s.section_key)).toContain("hero");
  });

  it("exposes site settings with a whatsapp number", async () => {
    const s = await mockDataService.settings.get();
    expect(s.whatsapp_number).toBeTruthy();
  });

  it("creates an enquiry and assigns id + status new", async () => {
    const e = await mockDataService.enquiries.create({
      name: "Test", phone: "999", source: "quote_form",
    });
    expect(e.id).toBeTruthy();
    expect(e.status).toBe("new");
  });
});
