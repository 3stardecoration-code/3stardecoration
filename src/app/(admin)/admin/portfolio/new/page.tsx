import Link from "next/link";
import { getDataService } from "@/lib/services";
import { createProject } from "@/app/actions/admin/projects";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const categories = await getDataService().categories.list();

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/portfolio" className="text-sm text-gray-500 hover:text-gray-900">
        ← All projects
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">New project</h1>
      <p className="mt-1 text-sm text-gray-500">
        Start with a title and category — you can fill in everything else next.
      </p>

      <form action={createProject} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Title</span>
          <input
            name="title"
            required
            placeholder="e.g. Rosewood Garden Wedding"
            className="input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Category</span>
          <select name="category_id" required className="input mt-1.5">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
