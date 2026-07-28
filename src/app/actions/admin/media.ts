"use server";

import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";

export async function addMediaAsset(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  const secure_url = String(formData.get("secure_url") ?? "").trim();
  const alt_text = String(formData.get("alt_text") ?? "").trim();
  if (!secure_url || !alt_text) return { ok: false, error: "Image URL and alt text are required." };
  await getDataService().media.create({ secure_url, alt_text });
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
