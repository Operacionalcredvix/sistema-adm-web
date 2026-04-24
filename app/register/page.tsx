"use client";

import { useRouter } from "next/navigation";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthShell } from "@/components/auth/auth-shell";
import { apisAuthTheme, themeToCssVars } from "@/lib/auth-theme";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <AuthShell styleVars={themeToCssVars(apisAuthTheme)}>
      <AuthBrandPanel
        logoSrc={apisAuthTheme.logoSrc}
        logoAlt={apisAuthTheme.logoAlt}
        caption="Cadastro público desativado neste ambiente."
        eyebrow="ACESSO CONTROLADO"
        headline="O acesso ao Sistema ADM é liberado apenas por autorização administrativa."
        description="Esta proteção evita criação indevida de usuários em um sistema que já está em uso real pela operação."
        featureChips={["Cadastro bloqueado", "Uso interno", "Acesso autorizado"]}
      />

      <div className="auth-panel auth-form-panel">
        <div className="auth-card">
          <div className="brand-compact">
            <h2>
              <span>{apisAuthTheme.systemName}</span>
            </h2>
            <p>{apisAuthTheme.organizationName}</p>
          </div>

          <div className="auth-heading">
            <h3>Cadastro desativado</h3>
            <p>
              O acesso ao Sistema ADM é liberado apenas por autorização administrativa.
              Para solicitar um novo acesso, fale com o responsável pelo sistema.
            </p>
          </div>

          <div className="message-box" role="alert">
            Usuários já autorizados devem entrar normalmente pela tela de login.
          </div>

          <div className="stack-actions">
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={() => router.replace("/login")}
            >
              Voltar para login
            </button>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
