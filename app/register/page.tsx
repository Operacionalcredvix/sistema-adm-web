"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthAccessCard } from "@/components/auth/auth-access-card";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthShell } from "@/components/auth/auth-shell";
import { apisAuthTheme, themeToCssVars } from "@/lib/auth-theme";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
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

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!fullName || !email || !password) {
      setMessage("Preencha nome, e-mail e senha para criar o acesso.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace("/unidades");
      return;
    }

    setMessage("Acesso criado. Agora volte ao login para entrar.");
    setLoading(false);
  };

  return (
    <AuthShell styleVars={themeToCssVars(apisAuthTheme)}>
      <AuthBrandPanel
        logoSrc={apisAuthTheme.logoSrc}
        logoAlt={apisAuthTheme.logoAlt}
        caption="Cadastro inicial do acesso ao sistema."
        eyebrow="CRIAR ACESSO"
        headline="Crie seu acesso com os dados certos e entre no sistema com segurança."
        description="Nesta etapa, você cria o usuário de acesso. O nome será salvo no perfil do Auth e poderá ser usado depois na interface."
        featureChips={["Cadastro separado", "Fluxo mais claro", "Base reutilizável"]}
      />

      <AuthAccessCard
        systemName={apisAuthTheme.systemName}
        organizationName={apisAuthTheme.organizationName}
        title="Criar acesso"
        description="Preencha seus dados para criar o usuário deste projeto."
        email={email}
        password={password}
        message={message}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleRegister}
        onSecondaryAction={() => router.push("/login")}
        submitLabel="Criar acesso"
        loadingSubmitLabel="Criando..."
        secondaryPrompt="Já tem acesso?"
        secondaryActionLabel="Voltar para login →"
        loadingSecondaryLabel="Abrindo..."
      >
        <div className="field">
          <label htmlFor="fullName">Nome</label>
          <input
            id="fullName"
            type="text"
            placeholder="Ex.: Gabriel"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>
      </AuthAccessCard>
    </AuthShell>
  );
}
