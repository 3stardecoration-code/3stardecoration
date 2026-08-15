"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function EmptyTrashButton({
  action,
  itemLabel,
  disabled,
}: {
  action: () => Promise<{ deleted: number }>;
  itemLabel: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Permanently delete all {itemLabel}?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await action();
              setConfirming(false);
              router.refresh();
            })
          }
          className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Yes, delete forever"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirming(false)}
          className="font-medium text-gray-500 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-red-200 px-3.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Empty trash
    </button>
  );
}
