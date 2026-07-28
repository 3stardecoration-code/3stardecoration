"use client";

import { useState, useTransition } from "react";
import { updateEnquiryStatus } from "@/app/actions/admin/enquiries";
import type { EnquiryStatus } from "@/lib/domain";

const OPTIONS: EnquiryStatus[] = ["new", "contacted", "closed"];

export function StatusSelect({ id, status }: { id: string; status: EnquiryStatus }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as EnquiryStatus;
          setValue(next);
          startTransition(async () => {
            await updateEnquiryStatus(id, next);
          });
        }}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium capitalize text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {isPending && <span className="text-xs text-gray-400">Saving…</span>}
    </div>
  );
}
