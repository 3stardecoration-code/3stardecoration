"use client";

import { createContext, useContext, useState } from "react";

type AdminNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AdminNavContext = createContext<AdminNavContextValue | null>(null);

/** Shares the mobile sidebar's open/closed state between AdminHeader (the toggle button) and AdminSidebar (the drawer). */
export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <AdminNavContext.Provider value={{ open, setOpen }}>{children}</AdminNavContext.Provider>;
}

export function useAdminNav() {
  const ctx = useContext(AdminNavContext);
  if (!ctx) throw new Error("useAdminNav must be used within AdminNavProvider");
  return ctx;
}
