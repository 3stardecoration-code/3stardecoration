import { getDataService } from "@/lib/services";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Preloader } from "@/components/site/Preloader";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getDataService().settings.get();

  return (
    <SmoothScrollProvider>
      <Preloader />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} />
    </SmoothScrollProvider>
  );
}
