"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function AdminProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, navigation has completed.
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      const url = new URL(target.href, window.location.href);
      const isInternal = url.origin === window.location.origin;
      const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search;
      const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      const isNewTab = target.target === "_blank";

      if (isInternal && !isSamePage && !isModified && !isNewTab && url.pathname.startsWith("/admin")) {
        setLoading(true);
        setProgress(30);

        const t1 = setTimeout(() => setProgress(65), 100);
        const t2 = setTimeout(() => setProgress(85), 300);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent pointer-events-none">
      <div
        className="h-full bg-linear-to-r from-amber-600 via-gray-900 to-amber-700 transition-all duration-200 ease-out shadow-xs"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 150ms ease-out, opacity 200ms ease-out 100ms" : "width 200ms ease-out",
        }}
      />
    </div>
  );
}
