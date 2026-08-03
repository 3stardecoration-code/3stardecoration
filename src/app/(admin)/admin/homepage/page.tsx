import { getDataService } from "@/lib/services";
import { HomepageSectionsForm } from "@/components/admin/homepage/HomepageSectionsForm";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const db = getDataService();
  const [sections, mediaAssets] = await Promise.all([
    db.homepage.listAllSections(),
    db.media.listForAdmin(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Homepage</h1>
      <p className="mt-1 text-sm text-gray-500">
        Choose which sections appear on the homepage and which photos each one shows.
      </p>
      <div className="mt-8">
        <HomepageSectionsForm sections={sections} mediaAssets={mediaAssets} />
      </div>
    </div>
  );
}
