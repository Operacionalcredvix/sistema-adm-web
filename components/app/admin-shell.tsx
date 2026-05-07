"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { prewarmOperationalCache } from "@/lib/operational-prefetch";
import { AdminSidebar } from "./admin-sidebar";

type AdminShellProps = {
  section: "unidades" | "ficha" | "alertas" | "usuarios";
  userProfileCode?: string;
  children: ReactNode;
};

export function AdminShell({ section, userProfileCode, children }: AdminShellProps) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/unidades");
    router.prefetch("/alertas");

    let active = true;

    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (active && session) {
        void prewarmOperationalCache(session.user.id, session.user.email ?? "");
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="dashboard-shell">
      <div className="workspace">
        <AdminSidebar section={section} userProfileCode={userProfileCode} />
        <div className="content-shell">{children}</div>
      </div>
    </main>
  );
}
