"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreService } from "@/app/actions/admin/services";
import type { Service } from "@/lib/domain";

export function ServiceTrashRow({ service }: { service: Service }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">{service.title}</td>
      <td className="px-4 py-3 text-gray-500">
        {service.deleted_at ? new Date(service.deleted_at).toLocaleDateString("en-GB") : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await restoreService(service.id);
              router.refresh();
            })
          }
          className="font-medium text-emerald-600 hover:underline disabled:opacity-50"
        >
          {isPending ? "Restoring…" : "Restore"}
        </button>
      </td>
    </tr>
  );
}
