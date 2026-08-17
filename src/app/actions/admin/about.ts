"use server";

import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";
import type { AboutPageContent } from "@/lib/domain";

export async function updateAboutPage(
  patch: Partial<AboutPageContent>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  try {
    await getDataService().about.update(patch);
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}
