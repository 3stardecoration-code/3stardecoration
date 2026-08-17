"use server";

import { getAuthService } from "@/lib/services";

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await getAuthService().requireAdmin();
  if (!currentPassword || !newPassword) {
    return { ok: false, error: "Both fields are required." };
  }
  return getAuthService().changePassword(currentPassword, newPassword);
}
