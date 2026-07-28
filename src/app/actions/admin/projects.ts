"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";
import type { ProjectPatch, SortOrderEntry } from "@/lib/repositories";

function revalidatePublic(slug?: string) {
  revalidatePath("/portfolio");
  revalidatePath("/");
  if (slug) revalidatePath(`/portfolio/${slug}`);
}

export async function createProject(formData: FormData): Promise<void> {
  await getAuthService().requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const category_id = String(formData.get("category_id") ?? "");
  if (!title || !category_id) throw new Error("Title and category are required.");
  const project = await getDataService().projects.create({ title, category_id });
  revalidatePath("/admin/portfolio");
  redirect(`/admin/portfolio/${project.id}`);
}

export async function updateProject(id: string, patch: ProjectPatch): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  const before = await getDataService().projects.getById(id);
  try {
    const project = await getDataService().projects.update(id, patch);
    revalidatePath("/admin/portfolio");
    revalidatePath(`/admin/portfolio/${id}`);
    revalidatePublic(project.slug);
    if (before && before.project.slug !== project.slug) revalidatePublic(before.project.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function trashProject(id: string): Promise<void> {
  await getAuthService().requireAdmin();
  const res = await getDataService().projects.getById(id);
  await getDataService().projects.softDelete(id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/admin/portfolio/trash");
  if (res) revalidatePublic(res.project.slug);
}

export async function restoreProject(id: string): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().projects.restore(id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/admin/portfolio/trash");
  revalidatePublic();
}

export async function reorderProjects(order: SortOrderEntry[]): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().projects.reorder(order);
  revalidatePath("/admin/portfolio");
  revalidatePublic();
}
