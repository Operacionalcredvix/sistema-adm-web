"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";

type AdminShellProps = {
  section: "unidades" | "ficha" | "alertas";
  children: ReactNode;
};

export function AdminShell({ section, children }: AdminShellProps) {
  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <AdminSidebar section={section} />
        <div className="content-shell">{children}</div>
      </div>
    </main>
  );
}
