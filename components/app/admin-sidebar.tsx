"use client";

import Image from "next/image";
import Link from "next/link";

type AdminSidebarProps = {
  section: "unidades" | "ficha" | "alertas" | "usuarios";
  userProfileCode?: string;
};

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon-svg">
      <path d="M12 2 20 6.5v11L12 22l-8-4.5v-11L12 2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 6.5 12 11l8-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 11v11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon-svg">
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon-svg">
      <path d="M16 11a4 4 0 1 0-8 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.5 8.5h2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19.75 7.25v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-chevron-svg">
      <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminSidebar({ section, userProfileCode }: AdminSidebarProps) {
  const canSeeUsersMenu = userProfileCode === "super_admin";

  return (
    <aside className="sidebar surface">
      <div className="sidebar-brand">
        <Image
          src="/apis-logo.png"
          alt="APIS Grupo"
          width={180}
          height={70}
          className="sidebar-logo"
          priority
        />
      </div>

      <div className="sidebar-menu-block">
        <span className="sidebar-group-title">Principal</span>

        <div className="sidebar-nav-list">
          <Link
            href="/unidades"
            className={`nav-link module-link ${section === "unidades" || section === "ficha" ? "active" : ""}`}
          >
            <span className="module-link-icon">
              <BoxIcon />
            </span>

            <span className="module-link-copy">
              <span className="nav-link-title">Unidades</span>
              <span className="nav-link-subtitle">Fichas e enriquecimento</span>
            </span>

            <span className="module-link-arrow">
              <ChevronIcon />
            </span>
          </Link>

          <Link
            href="/alertas"
            className={`nav-link module-link ${section === "alertas" ? "active" : ""}`}
          >
            <span className="module-link-icon">
              <BellIcon />
            </span>

            <span className="module-link-copy">
              <span className="nav-link-title">Alertas</span>
              <span className="nav-link-subtitle">Pendências e vencimentos</span>
            </span>

            <span className="module-link-arrow">
              <ChevronIcon />
            </span>
          </Link>
        </div>
      </div>

      {canSeeUsersMenu ? (
        <div className="sidebar-menu-block">
          <span className="sidebar-group-title">Administração</span>

          <div className="sidebar-nav-list">
            <Link
              href="/admin/perfis"
              className={`nav-link module-link ${section === "usuarios" ? "active" : ""}`}
            >
              <span className="module-link-icon">
                <UsersIcon />
              </span>

              <span className="module-link-copy">
                <span className="nav-link-title">Usuários</span>
                <span className="nav-link-subtitle">Perfis e acessos</span>
              </span>

              <span className="module-link-arrow">
                <ChevronIcon />
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
