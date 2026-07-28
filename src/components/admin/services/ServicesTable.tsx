"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { reorderServices, trashService } from "@/app/actions/admin/services";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Service } from "@/lib/domain";

export function ServicesTable({ services: initial }: { services: Service[] }) {
  const [services, setServices] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setServices((prev) => {
      const from = prev.findIndex((s) => s.id === dragId);
      const to = prev.findIndex((s) => s.id === targetId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragId(null);
    setDirty(true);
  }

  function saveOrder() {
    startTransition(async () => {
      await reorderServices(services.map((s, i) => ({ id: s.id, sort_order: i })));
      setDirty(false);
    });
  }

  function handleTrash(id: string, title: string) {
    if (!window.confirm(`Move "${title}" to Trash?`)) return;
    startTransition(async () => {
      await trashService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    });
  }

  return (
    <div>
      {dirty && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <span>Order changed — save to apply it to the live site.</span>
          <button
            type="button"
            onClick={saveOrder}
            disabled={isPending}
            className="rounded-md bg-amber-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-900 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save order"}
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="w-8 px-3 py-3" />
              <th className="px-3 py-3 font-medium">Service</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((service) => (
              <tr
                key={service.id}
                draggable
                onDragStart={() => setDragId(service.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(service.id)}
                className={`transition-colors hover:bg-gray-50 ${dragId === service.id ? "opacity-40" : ""}`}
              >
                <td className="cursor-grab px-3 py-3 text-gray-300 active:cursor-grabbing">⠿</td>
                <td className="px-3 py-3">
                  <p className="font-medium text-gray-900">{service.title}</p>
                  <p className="text-xs text-gray-400">/{service.slug}</p>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={service.workflow_status} />
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/services/${service.id}`} className="font-medium text-gray-900 hover:underline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleTrash(service.id, service.title)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Trash
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
