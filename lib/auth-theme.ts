import type { CSSProperties } from "react";

export type AuthThemeConfig = {
  logoSrc: string;
  logoAlt: string;
  caption: string;
  eyebrow: string;
  headline: string;
  description: string;
  featureChips: string[];
  systemName: string;
  organizationName: string;
  loginTitle: string;
  loginDescription: string;
  submitLabel: string;
  loadingSubmitLabel: string;
  secondaryPrompt: string;
  secondaryActionLabel: string;
  loadingSecondaryLabel: string;
  colors: {
    primary: string;
    primaryHover: string;
    primaryDark: string;
    primaryGlow: string;
  };
};

export function themeToCssVars(theme: AuthThemeConfig): CSSProperties {
  return {
    ["--auth-primary" as string]: theme.colors.primary,
    ["--auth-primary-hover" as string]: theme.colors.primaryHover,
    ["--auth-primary-dark" as string]: theme.colors.primaryDark,
    ["--auth-primary-glow" as string]: theme.colors.primaryGlow,
  };
}

export const apisAuthTheme: AuthThemeConfig = {
  logoSrc: "/apis-logo.png",
  logoAlt: "APIS Grupo",
  caption: "Gestão operacional com visão clara.",
  eyebrow: "CONTROLE DE FICHAS, PRAZOS E ANEXOS",
  headline:
    "Centralize documentos, pagamentos e vencimentos de cada unidade com clareza operacional.",
  description:
    "O Sistema ADM do Grupo APIS reúne fichas, pendências e anexos em uma visão única por unidade. O foco é simples: reduzir risco operacional e facilitar o acompanhamento do que vence, do que falta e do que precisa de ação.",
  featureChips: [
    "Fichas por unidade",
    "Alertas de vencimento",
    "Anexos centralizados",
  ],
  systemName: "Sistema ADM",
  organizationName: "Grupo APIS",
  loginTitle: "Entrar",
  loginDescription:
    "Use seu e-mail e sua senha para acessar as fichas das unidades.",
  submitLabel: "Entrar",
  loadingSubmitLabel: "Entrando...",
  secondaryPrompt: "Primeiro acesso neste projeto?",
  secondaryActionLabel: "Criar acesso →",
  loadingSecondaryLabel: "Processando...",
  colors: {
    primary: "#f7be21",
    primaryHover: "#ffd24f",
    primaryDark: "#e6ad10",
    primaryGlow: "rgba(247, 190, 33, 0.22)",
  },
};

/*
Exemplo de outro projeto:

export const projetoXAuthTheme: AuthThemeConfig = {
  logoSrc: "/logo-projeto-x.png",
  logoAlt: "Projeto X",
  caption: "Subtítulo institucional.",
  eyebrow: "PLATAFORMA INTERNA",
  headline: "Seu headline principal aqui.",
  description: "Seu texto descritivo aqui.",
  featureChips: ["Chip 1", "Chip 2", "Chip 3"],
  systemName: "Projeto X",
  organizationName: "Empresa X",
  loginTitle: "Entrar",
  loginDescription: "Use seu e-mail e sua senha.",
  submitLabel: "Entrar",
  loadingSubmitLabel: "Entrando...",
  secondaryPrompt: "Primeiro acesso?",
  secondaryActionLabel: "Criar acesso →",
  loadingSecondaryLabel: "Processando...",
  colors: {
    primary: "#7c3aed",
    primaryHover: "#9f67ff",
    primaryDark: "#6d28d9",
    primaryGlow: "rgba(124, 58, 237, 0.25)",
  },
};
*/
