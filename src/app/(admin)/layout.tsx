import { getAuthService, getDataService } from "@/lib/services";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNavProvider } from "@/components/admin/AdminNavContext";

export const metadata = {
  title: "3 Star CMS",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthService().getSession();

  let logoUrl: string | null = null;
  if (session) {
    const settings = await getDataService().settings.get().catch(() => null);
    if (settings?.logo_media_asset_id) {
      const logoAsset = await getDataService().media.getById(settings.logo_media_asset_id).catch(() => null);
      logoUrl = logoAsset?.secure_url ?? null;
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {session ? (
        <AdminNavProvider>
          <AdminSidebar logoUrl={logoUrl} />
          <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
            <AdminHeader session={session} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </AdminNavProvider>
      ) : (
        <main className="flex-1 overflow-y-auto">{children}</main>
      )}
    </div>
  );
}
