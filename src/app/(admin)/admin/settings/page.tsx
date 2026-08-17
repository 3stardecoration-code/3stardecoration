import { getDataService } from "@/lib/services";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const db = getDataService();
  const [settings, mediaAssets] = await Promise.all([db.settings.get(), db.media.listForAdmin()]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Contact details, WhatsApp, and social links used across the entire public site.
      </p>
      <div className="mt-8">
        <SettingsForm settings={settings} mediaAssets={mediaAssets} />
      </div>
    </div>
  );
}
