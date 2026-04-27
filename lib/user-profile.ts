import { supabase } from "@/lib/supabase";

export type UserProfileCode =
  | "super_admin"
  | "admin_adm"
  | "operacao_adm"
  | "consulta";

export type CurrentUserProfileCode =
  | UserProfileCode
  | "sem_perfil"
  | "perfil_inativo"
  | "erro";

export type CurrentUserProfile = {
  auth_user_id: string;
  email: string | null;
  perfil: CurrentUserProfileCode;
  perfil_label: string;
  ativo: boolean;
  hasProfile: boolean;
};

type UsuarioPerfilRow = {
  auth_user_id: string;
  email: string | null;
  perfil: string | null;
  ativo: boolean | null;
};

const profileLabels: Record<CurrentUserProfileCode, string> = {
  super_admin: "Super admin",
  admin_adm: "Admin ADM",
  operacao_adm: "Operação ADM",
  consulta: "Consulta",
  sem_perfil: "Sem perfil vinculado",
  perfil_inativo: "Perfil inativo",
  erro: "Perfil não carregado",
};

function normalizeProfileCode(value: string | null | undefined): UserProfileCode | "sem_perfil" {
  if (
    value === "super_admin" ||
    value === "admin_adm" ||
    value === "operacao_adm" ||
    value === "consulta"
  ) {
    return value;
  }

  return "sem_perfil";
}

function buildFallbackProfile(
  authUserId: string,
  fallbackEmail: string,
  perfil: CurrentUserProfileCode
): CurrentUserProfile {
  return {
    auth_user_id: authUserId,
    email: fallbackEmail || null,
    perfil,
    perfil_label: profileLabels[perfil],
    ativo: perfil !== "perfil_inativo",
    hasProfile: false,
  };
}

export async function getCurrentUserProfile(
  authUserId: string,
  fallbackEmail = ""
): Promise<CurrentUserProfile> {
  if (!authUserId) {
    return buildFallbackProfile("", fallbackEmail, "sem_perfil");
  }

  const { data, error } = await supabase
    .from("usuario_perfil")
    .select("auth_user_id, email, perfil, ativo")
    .eq("auth_user_id", authUserId)
    .maybeSingle<UsuarioPerfilRow>();

  if (error) {
    console.warn("Perfil do usuário não carregado:", error.message);
    return buildFallbackProfile(authUserId, fallbackEmail, "erro");
  }

  if (!data) {
    return buildFallbackProfile(authUserId, fallbackEmail, "sem_perfil");
  }

  if (data.ativo === false) {
    return {
      auth_user_id: data.auth_user_id,
      email: data.email || fallbackEmail || null,
      perfil: "perfil_inativo",
      perfil_label: profileLabels.perfil_inativo,
      ativo: false,
      hasProfile: true,
    };
  }

  const perfil = normalizeProfileCode(data.perfil);

  return {
    auth_user_id: data.auth_user_id,
    email: data.email || fallbackEmail || null,
    perfil,
    perfil_label: profileLabels[perfil],
    ativo: true,
    hasProfile: true,
  };
}


export type UserProfileDiagnosticStatus =
  | "perfil_ativo"
  | "perfil_inativo"
  | "sem_perfil";

export type UserProfileDiagnosticRow = {
  auth_user_id: string;
  email: string | null;
  nome_exibicao: string | null;
  perfil: UserProfileCode | null;
  perfil_label: string;
  ativo: boolean;
  auth_criado_em: string | null;
  ultimo_login_em: string | null;
  status_vinculo: UserProfileDiagnosticStatus;
};

type UserProfileDiagnosticsResult = {
  data: UserProfileDiagnosticRow[];
  errorMessage: string;
};

export async function getUserProfileDiagnostics(): Promise<UserProfileDiagnosticsResult> {
  const { data, error } = await supabase.rpc("admin_diagnostico_usuarios_perfis");

  if (error) {
    console.warn("Diagnóstico de usuários e perfis não carregado:", error.message);
    return {
      data: [],
      errorMessage:
        "Não foi possível carregar o diagnóstico de usuários e perfis. Confira se o SQL da versão 0.4.2 foi aplicado no Supabase.",
    };
  }

  return {
    data: (data ?? []) as UserProfileDiagnosticRow[],
    errorMessage: "",
  };
}
