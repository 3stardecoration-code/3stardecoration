import { Suspense } from "react";
import { getDataService } from "@/lib/services";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Preloader } from "@/components/site/Preloader";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const db = getDataService();
  const settings = await db.settings.get();
  const logoAsset = settings.logo_media_asset_id ? await db.media.getById(settings.logo_media_asset_id) : null;
  const logoUrl = logoAsset?.secure_url ?? null;

  return (
    <SmoothScrollProvider>
      {settings.ga4_measurement_id && (
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={settings.ga4_measurement_id} />
        </Suspense>
      )}
      <Preloader logoUrl={logoUrl} />
      <SiteHeader logoUrl={logoUrl} />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} logoUrl={logoUrl} />
    </SmoothScrollProvider>
  );
}
