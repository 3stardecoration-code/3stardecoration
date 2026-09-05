"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Intercepts the browser back button on the service detail page.
 * Instead of going to whatever page the user came from (e.g. the home page),
 * it always navigates to /services (the all-services listing).
 *
 * How it works:
 * 1. On mount, pushes a sentinel history entry (same URL, flagged state).
 * 2. When the user presses back, the sentinel pops → popstate fires.
 * 3. The handler replaces the current entry with /services via Next.js router.
 */
export function ServiceBackHandler() {
  const router = useRouter();

  useEffect(() => {
    // Push a sentinel entry so we can detect the back press
    window.history.pushState({ __serviceDetail: true }, "");

    function onPopState() {
      // When back is pressed, navigate to the all-services page
      router.replace("/services");
    }

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [router]);

  return null;
}
