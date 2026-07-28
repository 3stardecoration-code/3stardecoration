"use client";

import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import type { AdminSession } from "@/lib/domain";

export function AdminHeader({ session }: { session: AdminSession }) {
  const pathname = usePathname();

  // Simple title mapper based on the route
  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard Overview";
    if (pathname.startsWith("/admin/enquiries")) return "Enquiries";
    if (pathname.startsWith("/admin/portfolio")) return "Portfolio";
    if (pathname.startsWith("/admin/services")) return "Services";
    if (pathname.startsWith("/admin/media")) return "Media Library";
    if (pathname.startsWith("/admin/settings")) return "Settings";
    return "Admin CMS";
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8">
      <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a48252] text-sm font-medium text-white">
            {(session.profile.full_name || "Admin").charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{session.profile.full_name || "Admin"}</span>
            <span className="text-xs text-gray-500 capitalize">{session.profile.role}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
