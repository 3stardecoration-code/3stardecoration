import { getDataService } from "@/lib/services";
import { AboutPageForm } from "@/components/admin/about/AboutPageForm";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const db = getDataService();
  const [content, mediaAssets] = await Promise.all([db.about.get(), db.media.listForAdmin()]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">About Page</h1>
      <p className="mt-1 text-sm text-gray-500">
        Everything shown on the public About page — copy, the story photo, stats, and the process
        steps.
      </p>
      <div className="mt-8">
        <AboutPageForm content={content} mediaAssets={mediaAssets} />
      </div>
    </div>
  );
}
