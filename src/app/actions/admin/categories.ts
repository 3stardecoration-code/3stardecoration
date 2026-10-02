"use server";

import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";
import type { CategoryPatch, SortOrderEntry } from "@/lib/repositories";
import type { Category } from "@/lib/domain";

function revalidateAll() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/portfolio");
  revalidatePath("/admin/services");
  revalidatePath("/portfolio");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  description?: string | null;
  cover_media_asset_id?: string | null;
}): Promise<{ ok: true; category: Category } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  try {
    const category = await getDataService().categories.create(input);
    revalidateAll();
    return { ok: true, category };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create category." };
  }
}

export async function updateCategory(
  id: string,
  patch: CategoryPatch
): Promise<{ ok: true; category: Category } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  try {
    const category = await getDataService().categories.update(id, patch);
    revalidateAll();
    return { ok: true, category };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update category." };
  }
}

export async function deleteCategory(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  try {
    await getDataService().categories.delete(id);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete category." };
  }
}

export async function reorderCategories(order: SortOrderEntry[]): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  try {
    await getDataService().categories.reorder(order);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to reorder categories." };
  }
}
