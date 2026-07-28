import Link from "next/link";
import { createTestimonial } from "@/app/actions/admin/testimonials";

export default function NewTestimonialPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/testimonials" className="text-sm text-gray-500 hover:text-gray-900">
        ← All testimonials
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">New testimonial</h1>

      <form action={createTestimonial} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Author name</span>
          <input name="author_name" required placeholder="e.g. Priya & Arun" className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Quote</span>
          <textarea name="quote" required rows={3} placeholder="What they said…" className="input mt-1.5" />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Create draft
        </button>
      </form>
    </div>
  );
}
