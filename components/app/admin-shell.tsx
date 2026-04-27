"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";

type AdminShellProps = {
  section: "unidades" | "ficha" | "alertas" | "usuarios";
  userProfileCode?: string;
  children: ReactNode;
};

export function AdminShell({ section, userProfileCode, children }: AdminShellProps) {
  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <AdminSidebar section={section} userProfileCode={userProfileCode} />
        <div className="content-shell">{children}</div>
      </div>
    </main>
  );
}
