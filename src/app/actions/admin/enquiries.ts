"use server";

import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";
import type { EnquiryStatus } from "@/lib/domain";

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().enquiries.update(id, { status });
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin");
}

export async function updateEnquiryNotes(id: string, notes: string): Promise<void> {
  await getAuthService().requireAdmin();
  await getDataService().enquiries.update(id, { notes: notes.trim() || null });
  revalidatePath(`/admin/enquiries/${id}`);
}
