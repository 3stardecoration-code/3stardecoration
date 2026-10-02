import { describe, it, expect } from "vitest";
import { mockDataService } from "@/lib/services/mock/mock-data-service";

describe("Category management & Service integration", () => {
  it("creates a new category and retrieves it by id and slug", async () => {
    const created = await mockDataService.categories.create({
      name: "Festival Decor",
      description: "Festive decorations for special occasions",
    });

    expect(created.id).toBeTruthy();
    expect(created.name).toBe("Festival Decor");
    expect(created.slug).toBe("festival-decor");

    const fetchedById = await mockDataService.categories.getById(created.id);
    expect(fetchedById?.name).toBe("Festival Decor");

    const fetchedBySlug = await mockDataService.categories.getBySlug("festival-decor");
    expect(fetchedBySlug?.id).toBe(created.id);
  });

  it("updates an existing category", async () => {
    const created = await mockDataService.categories.create({
      name: "Naming Ceremony",
    });

    const updated = await mockDataService.categories.update(created.id, {
      name: "Grand Naming Ceremony",
      description: "Updated description",
    });

    expect(updated.name).toBe("Grand Naming Ceremony");
    expect(updated.description).toBe("Updated description");
  });

  it("deletes a category", async () => {
    const created = await mockDataService.categories.create({
      name: "Temporary Category",
    });

    await mockDataService.categories.delete(created.id);
    const fetched = await mockDataService.categories.getById(created.id);
    expect(fetched).toBeNull();
  });

  it("creates a service with category_id and retrieves it", async () => {
    const cats = await mockDataService.categories.list();
    const chosenCat = cats[0];

    const service = await mockDataService.services.create({
      title: "Mandap Decoration",
      category_id: chosenCat.id,
    });

    expect(service.id).toBeTruthy();
    expect(service.title).toBe("Mandap Decoration");
    expect(service.category_id).toBe(chosenCat.id);

    const fetched = await mockDataService.services.getById(service.id);
    expect(fetched?.category_id).toBe(chosenCat.id);

    // Update service category
    const updated = await mockDataService.services.update(service.id, {
      category_id: null,
    });
    expect(updated.category_id).toBeNull();
  });
});
