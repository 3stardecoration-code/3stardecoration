"use server";

import { redirect } from "next/navigation";
import { getAuthService } from "@/lib/services";

export type AuthState = { ok: false; error: string } | null;

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const result = await getAuthService().signIn(email, password);
  if (!result.ok) {
    return { ok: false, error: result.error ?? "Invalid credentials." };
  }

  // Success — redirect to dashboard
  redirect("/admin");
}

export async function logoutAction() {
  await getAuthService().signOut();
  redirect("/admin/login");
}
