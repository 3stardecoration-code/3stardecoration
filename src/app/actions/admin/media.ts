"use server";

import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";
import type { NewMediaAsset } from "@/lib/repositories";

export async function addMediaAsset(input: NewMediaAsset): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  if (!input.secure_url.trim() || !input.alt_text.trim()) {
    return { ok: false, error: "Image and alt text are required." };
  }
  await getDataService().media.create(input);
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function updateMediaAltText(id: string, alt_text: string): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().media.updateAltText(id, alt_text);
  revalidatePath("/admin/media");
}

export async function toggleMediaFavorite(id: string): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().media.toggleFavorite(id);
  revalidatePath("/admin/media");
}

export async function trashMediaAsset(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  try {
    await getDataService().media.softDelete(id);
    revalidatePath("/admin/media");
    revalidatePath("/admin/media/trash");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function restoreMediaAsset(id: string): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().media.restore(id);
  revalidatePath("/admin/media");
  revalidatePath("/admin/media/trash");
}
