import Link from "next/link";
import { getDataService } from "@/lib/services";
import { MediaCard } from "@/components/admin/media/MediaCard";
import { AddMediaForm } from "@/components/admin/media/AddMediaForm";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ search?: string; type?: string; favorite?: string; sort?: string }>;

export default async function AdminMediaPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const type = sp.type === "image" || sp.type === "video" ? sp.type : undefined;
  const sort = sp.sort === "oldest" ? "oldest" : "latest";
  const favoriteOnly = sp.favorite === "1";

  const assets = await getDataService().media.listForAdmin({
    search: sp.search,
    type,
    favoriteOnly,
    sort,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Media Library</h1>
          <p className="mt-1 text-sm text-gray-500">{assets.length} assets</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/media/trash" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Trash
          </Link>
          <AddMediaForm />
        </div>
      </div>

      <form action="/admin/media" className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="search"
          defaultValue={sp.search}
          placeholder="Search alt text…"
          className="input w-56"
        />
        <select name="type" defaultValue={sp.type ?? ""} className="input w-auto">
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
        <select name="sort" defaultValue={sort} className="input w-auto">
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="favorite" value="1" defaultChecked={favoriteOnly} className="h-4 w-4 rounded border-gray-300" />
          Favorites only
        </label>
        <button type="submit" className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Apply
        </button>
      </form>

      {assets.length === 0 ? (
        <p className="mt-16 text-center text-sm text-gray-500">No media found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((asset) => (
            <MediaCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
