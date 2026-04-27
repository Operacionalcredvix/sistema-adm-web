"use client";

type AdminTopbarProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  userEmail?: string;
  userProfileLabel?: string;
  onLogout?: () => void;
  onBack?: () => void;
  backLabel?: string;
  actionsSlot?: React.ReactNode;
};

function formatUserGreeting(value?: string) {
  if (!value) return "";

  const rawName = value.includes("@") ? value.split("@")[0] : value;

  const normalizedName = rawName
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedName) return value;

  return normalizedName
    .split(" ")
    .map((part) => {
      if (part.length <= 3) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

export function AdminTopbar({
  eyebrow,
  title,
  subtitle,
  userEmail,
  userProfileLabel,
  onLogout,
  onBack,
  backLabel = "Voltar",
  actionsSlot,
}: AdminTopbarProps) {
  const greetingName = formatUserGreeting(userEmail);

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
        {userProfileLabel ? (
          <div className="user-profile-badge">
            Perfil: {userProfileLabel}
          </div>
        ) : null}

        {greetingName ? <div className="user-badge">Olá, {greetingName}!</div> : null}

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
