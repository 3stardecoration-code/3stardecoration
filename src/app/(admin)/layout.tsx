// No redirect needed here
import { getAuthService } from "@/lib/services";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

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

  // If no session, they must login. But wait, the login page is inside (admin)/admin/login.
  // So we don't want to redirect if they are already trying to access the login page.
  // Wait, layout.tsx wraps EVERYTHING in (admin). So the login page will get the sidebar?
  // Let's restructure the layout to handle this gracefully, or we'll just show the shell
  // if they are logged in, and if they aren't, redirect to login.
  // Actually, wait. I will just check session. If no session, redirect to /admin/login.
  // But wait! If /admin/login is inside this layout, we get an infinite redirect.
  // Let's put the login page at `src/app/admin-login/page.tsx`? No, let's just make the layout
  // conditionally render the shell. Wait, if it's a login page, we don't want the sidebar.
  // Let's create a separate route group for login, or just check the pathname? No, layouts can't check pathname well.
  
  // A better way: The admin layout *is* the shell. The login page should NOT be inside this layout if we want a full-screen login.
  // Let's put login at `src/app/(admin-login)/admin/login/page.tsx` or similar, but the user plan says `src/app/(admin)/admin/login/page.tsx`.
  // Wait, I can just use a separate route group for login.
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {session ? (
        <>
          <AdminSidebar />
          <div className="flex flex-1 flex-col pl-64">
            <AdminHeader session={session} />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </>
      ) : (
        <main className="flex-1 overflow-y-auto">{children}</main>
      )}
    </div>
  );
}
