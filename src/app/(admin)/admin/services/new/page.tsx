import Link from "next/link";
import { createService } from "@/app/actions/admin/services";

export default function NewServicePage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/services" className="text-sm text-gray-500 hover:text-gray-900">
        ← All services
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">New service</h1>
      <p className="mt-1 text-sm text-gray-500">
        Start with a title — you can fill in the description, icon, and image next.
      </p>

      <form action={createService} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Title</span>
          <input name="title" required placeholder="e.g. Floral Styling" className="input mt-1.5" />
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
