"use client";

import { useState, useTransition } from "react";
import { changeAdminPassword } from "@/app/actions/admin/auth";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function submit() {
    setError(null);
    setSaved(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    startTransition(async () => {
      const res = await changeAdminPassword(currentPassword, newPassword);
      if (res.ok) {
        setSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <section className="rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Security</p>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Current password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input mt-1.5"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">New password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Confirm new password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input mt-1.5"
            />
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            {isPending ? "Changing…" : "Change password"}
          </button>
          {saved && !isPending && <span className="text-sm text-emerald-600">Password changed</span>}
        </div>
      </div>
    </section>
  );
}
