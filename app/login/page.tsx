"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthAccessCard } from "@/components/auth/auth-access-card";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthShell } from "@/components/auth/auth-shell";
import { apisAuthTheme, themeToCssVars } from "@/lib/auth-theme";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/unidades");
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace("/unidades");
  };

  return (
    <AuthShell styleVars={themeToCssVars(apisAuthTheme)}>
      <AuthBrandPanel
        logoSrc={apisAuthTheme.logoSrc}
        logoAlt={apisAuthTheme.logoAlt}
        caption={apisAuthTheme.caption}
        eyebrow={apisAuthTheme.eyebrow}
        headline={apisAuthTheme.headline}
        description={apisAuthTheme.description}
        featureChips={apisAuthTheme.featureChips}
      />

      <AuthAccessCard
        systemName={apisAuthTheme.systemName}
        organizationName={apisAuthTheme.organizationName}
        title={apisAuthTheme.loginTitle}
        description={apisAuthTheme.loginDescription}
        email={email}
        password={password}
        message={message}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        submitLabel="Entrar"
        loadingSubmitLabel="Entrando..."
        secondaryPrompt="Acesso restrito a usuários autorizados. Para criar ou liberar um usuário, solicite ao administrador do sistema."
      />
    </AuthShell>
  );
}
