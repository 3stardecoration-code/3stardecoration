"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreTestimonial } from "@/app/actions/admin/testimonials";
import type { Testimonial } from "@/lib/domain";

export function TestimonialTrashRow({ testimonial }: { testimonial: Testimonial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">{testimonial.author_name}</td>
      <td className="max-w-sm truncate px-4 py-3 text-gray-600">{testimonial.quote}</td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await restoreTestimonial(testimonial.id);
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
