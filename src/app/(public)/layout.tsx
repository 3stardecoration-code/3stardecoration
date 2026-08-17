import { Suspense } from "react";
import { getDataService } from "@/lib/services";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Preloader } from "@/components/site/Preloader";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getDataService().settings.get();

  return (
    <SmoothScrollProvider>
      {settings.ga4_measurement_id && (
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={settings.ga4_measurement_id} />
        </Suspense>
      )}
      <Preloader />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} />
    </SmoothScrollProvider>
  );
}
