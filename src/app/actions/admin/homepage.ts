"use server";

import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";
import type { HomepageSectionPatch } from "@/lib/repositories";

export async function updateHomepageSection(
  id: string,
  patch: HomepageSectionPatch,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  try {
    await getDataService().homepage.updateSection(id, patch);
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}
