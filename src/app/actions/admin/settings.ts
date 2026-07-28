"use server";

import { revalidatePath } from "next/cache";
import { getAuthService, getDataService } from "@/lib/services";
import type { SiteSettings } from "@/lib/domain";

export async function updateSettings(
  patch: Partial<SiteSettings>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  try {
    await getDataService().settings.update(patch);
    // Site-wide impact: the (public) layout renders the footer (phone,
    // WhatsApp, socials) on EVERY public page. revalidatePath("/", "layout")
    // only reaches routes sharing the ROOT layout segment — it does NOT
    // cascade into fully static pages under the nested (public) route group
    // (revalidate: false), which is exactly where the footer lives. Each
    // static top-level route — and each dynamic route PATTERN — must be
    // revalidated explicitly.
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/quote");
    revalidatePath("/privacy");
    revalidatePath("/terms");
    revalidatePath("/services");
    revalidatePath("/portfolio");
    revalidatePath("/portfolio/[slug]", "page");
    revalidatePath("/services/[slug]", "page");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}
