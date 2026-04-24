"use client";

type AdminTopbarProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  userEmail?: string;
  onLogout?: () => void;
  onBack?: () => void;
  backLabel?: string;
  actionsSlot?: React.ReactNode;
};

export function AdminTopbar({
  eyebrow,
  title,
  subtitle,
  userEmail,
  onLogout,
  onBack,
  backLabel = "Voltar",
  actionsSlot,
}: AdminTopbarProps) {
  return (
    <header className="topbar surface">
      <div className="topbar-left">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        {actionsSlot}
        {userEmail ? <div className="user-badge">{userEmail}</div> : null}

        {onBack ? (
          <button className="btn btn-secondary" onClick={onBack}>
            {backLabel}
          </button>
        ) : null}

        {onLogout ? (
          <button className="btn btn-secondary" onClick={onLogout}>
            Sair
          </button>
        ) : null}
      </div>
    </header>
  );
}
