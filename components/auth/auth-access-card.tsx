import { ReactNode } from "react";

type AuthAccessCardProps = {
  systemName: string;
  organizationName: string;
  title: string;
  description: string;
  email: string;
  password: string;
  message: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSecondaryAction?: () => void;
  submitLabel?: string;
  loadingSubmitLabel?: string;
  secondaryPrompt?: string;
  secondaryActionLabel?: string;
  loadingSecondaryLabel?: string;
  children?: ReactNode;
};

export function AuthAccessCard({
  systemName,
  organizationName,
  title,
  description,
  email,
  password,
  message,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onSecondaryAction,
  submitLabel = "Entrar",
  loadingSubmitLabel = "Entrando...",
  secondaryPrompt,
  secondaryActionLabel,
  loadingSecondaryLabel = "Processando...",
  children,
}: AuthAccessCardProps) {
  const showSecondaryAction = Boolean(onSecondaryAction && secondaryActionLabel);

  return (
    <div className="auth-panel auth-form-panel">
      <div className="auth-card">
        <div className="brand-compact">
          <h2>
            <span>{systemName}</span>
          </h2>
          <p>{organizationName}</p>
        </div>

        <div className="auth-heading">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {children}

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="stack-actions">
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? loadingSubmitLabel : submitLabel}
            </button>
          </div>
        </form>

        {secondaryPrompt ? (
          <div className="auth-footer-box">
            <p>{secondaryPrompt}</p>
          </div>
        ) : null}

        {showSecondaryAction ? (
          <div className="auth-switch">
            <button
              className="link-button"
              type="button"
              onClick={onSecondaryAction}
              disabled={loading}
            >
              {loading ? loadingSecondaryLabel : secondaryActionLabel}
            </button>
          </div>
        ) : null}

        {message ? (
          <div className="message-box" role="alert">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
