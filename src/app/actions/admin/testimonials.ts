"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";
import type { TestimonialPatch } from "@/lib/repositories";

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/about");
}

export async function createTestimonial(formData: FormData): Promise<void> {
  await getAuthService().requireAdmin();
  const author_name = String(formData.get("author_name") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  if (!author_name || !quote) throw new Error("Author name and quote are required.");
  const testimonial = await getDataService().testimonials.create({ author_name, quote });
  revalidatePath("/admin/testimonials");
  redirect(`/admin/testimonials/${testimonial.id}`);
}

export async function updateTestimonial(
  id: string,
  patch: TestimonialPatch,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  try {
    await getDataService().testimonials.update(id, patch);
    revalidatePath("/admin/testimonials");
    revalidatePath(`/admin/testimonials/${id}`);
    revalidatePublic();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function trashTestimonial(id: string): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().testimonials.softDelete(id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/admin/testimonials/trash");
  revalidatePublic();
}

export async function restoreTestimonial(id: string): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().testimonials.restore(id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/admin/testimonials/trash");
  revalidatePublic();
}

export async function emptyTestimonialsTrash(): Promise<{ deleted: number }> {
  await getAuthService().requireAdmin();
  const deleted = await getDataService().testimonials.emptyTrash();
  revalidatePath("/admin/testimonials/trash");
  return { deleted };
}
