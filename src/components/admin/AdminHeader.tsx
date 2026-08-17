"use client";

import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { useAdminNav } from "./AdminNavContext";
import type { AdminSession } from "@/lib/domain";

export function AdminHeader({ session }: { session: AdminSession }) {
  const pathname = usePathname();
  const { setOpen } = useAdminNav();

  // Simple title mapper based on the route
  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard Overview";
    if (pathname.startsWith("/admin/about")) return "About Page";
    if (pathname.startsWith("/admin/enquiries")) return "Enquiries";
    if (pathname.startsWith("/admin/portfolio")) return "Portfolio";
    if (pathname.startsWith("/admin/services")) return "Services";
    if (pathname.startsWith("/admin/media")) return "Media Library";
    if (pathname.startsWith("/admin/settings")) return "Settings";
    return "Admin CMS";
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="-ml-1 shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">{getPageTitle()}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-6">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a48252] text-sm font-medium text-white">
            {(session.profile.full_name || "Admin").charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{session.profile.full_name || "Admin"}</span>
            <span className="text-xs text-gray-500 capitalize">{session.profile.role}</span>
          </div>
        </div>

        <div className="hidden h-6 w-px bg-gray-200 sm:block" />

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
