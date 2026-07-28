"use server";

import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";
import type { ServicePatch, SortOrderEntry } from "@/lib/repositories";

function revalidatePublic(slug?: string) {
  revalidatePath("/services");
  revalidatePath("/");
  if (slug) revalidatePath(`/services/${slug}`);
}

export async function updateService(id: string, patch: ServicePatch): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  const before = await getDataService().services.getById(id);
  try {
    const service = await getDataService().services.update(id, patch);
    revalidatePath("/admin/services");
    revalidatePath(`/admin/services/${id}`);
    revalidatePublic(service.slug);
    if (before && before.slug !== service.slug) revalidatePublic(before.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function trashService(id: string): Promise<void> {
  await getAuthService().requireAdmin();
  const service = await getDataService().services.getById(id);
  await getDataService().services.softDelete(id);
  revalidatePath("/admin/services");
  revalidatePath("/admin/services/trash");
  if (service) revalidatePublic(service.slug);
}

export async function restoreService(id: string): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().services.restore(id);
  revalidatePath("/admin/services");
  revalidatePath("/admin/services/trash");
  revalidatePublic();
}

export async function reorderServices(order: SortOrderEntry[]): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().services.reorder(order);
  revalidatePath("/admin/services");
  revalidatePublic();
}
