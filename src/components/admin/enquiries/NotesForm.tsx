"use client";

import { useState, useTransition } from "react";
import { updateEnquiryNotes } from "@/app/actions/admin/enquiries";

export function NotesForm({ id, notes }: { id: string; notes: string | null }) {
  const [value, setValue] = useState(notes ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        rows={5}
        placeholder="Internal notes — not visible to the customer."
        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await updateEnquiryNotes(id, value);
              setSaved(true);
            });
          }}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save notes"}
        </button>
        {saved && !isPending && <span className="text-xs text-emerald-600">Saved</span>}
      </div>
    </div>
  );
}
