"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Loads gtag.js and fires a page_view on every route change. Next.js App
 * Router navigations don't trigger a full page load, so gtag's automatic
 * pageview (sent once, on script init) would miss every client-side
 * navigation — this effect sends one explicitly whenever the URL changes.
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.gtag) return;
    const url = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    window.gtag("config", measurementId, { page_path: url });
  }, [pathname, searchParams, measurementId]);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
