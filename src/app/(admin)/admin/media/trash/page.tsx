import Link from "next/link";
import { getDataService } from "@/lib/services";
import { MediaTrashCard } from "@/components/admin/media/MediaTrashCard";
import { EmptyTrashButton } from "@/components/admin/EmptyTrashButton";
import { emptyMediaTrash } from "@/app/actions/admin/media";

export const dynamic = "force-dynamic";

export default async function MediaTrashPage() {
  const trashed = await getDataService().media.listTrash();

  return (
    <div>
      <Link href="/admin/media" className="text-sm text-gray-500 hover:text-gray-900">
        ← Media Library
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Media Trash</h1>
        <EmptyTrashButton action={emptyMediaTrash} itemLabel="media files" disabled={trashed.length === 0} />
      </div>

      {trashed.length === 0 ? (
        <p className="mt-16 text-center text-sm text-gray-500">Trash is empty.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {trashed.map((asset) => (
            <MediaTrashCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
