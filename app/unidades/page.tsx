"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";
import { AdminShell } from "@/components/app/admin-shell";
import { DailyOnboardingModal } from "@/components/app/daily-onboarding-modal";
import { UnitSummaryCard } from "@/components/unidades/unit-summary-card";
import {
  getCachedCurrentUserProfile,
  getCurrentUserProfile,
  CurrentUserProfile,
} from "@/lib/user-profile";
import { AppLoadingState } from "@/components/app/app-loading-state";
import {
  buildClientCacheKey,
  CLIENT_CACHE_TTL,
  getCachedValue,
  setCachedValue,
} from "@/lib/client-cache";

type UnidadeLista = {
  unidade_id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  cnpj: string | null;
  qtd_vencidos: number | null;
  qtd_vence_em_7_dias: number | null;
  qtd_cadastro_incompleto: number | null;
  qtd_sem_anexo: number | null;
  prioridade_lista: number | null;
  proximo_prazo_relevante: string | null;
};

type UnitFilter = "todas" | "vencidos" | "proximos" | "pendencias" | "sem_prazo";

type UnidadesCachePayload = {
  unidades: UnidadeLista[];
};

const getNumber = (value: number | null) => value ?? 0;

const getUnitOperationalStatus = (unidade: UnidadeLista) => {
  const vencidos = getNumber(unidade.qtd_vencidos);
  const proximos = getNumber(unidade.qtd_vence_em_7_dias);
  const cadastro = getNumber(unidade.qtd_cadastro_incompleto);
  const semAnexo = getNumber(unidade.qtd_sem_anexo);

  if (vencidos > 0) {
    return {
      label: "Resolver vencido",
      tone: "danger",
      description: "Item vencido nesta unidade.",
      action: "Atualizar ficha",
    };
  }

  if (proximos > 0) {
    return {
      label: "Acompanhar prazo",
      tone: "warning",
      description: "Existe vencimento próximo.",
      action: "Conferir prazo",
    };
  }

  if (cadastro > 0 || semAnexo > 0) {
    return {
      label: "Completar ficha",
      tone: "neutral",
      description: "Dados ou anexos pendentes.",
      action: "Completar cadastro",
    };
  }

  return {
    label: "Em ordem",
    tone: "success",
    description: "Sem pendência relevante.",
    action: "Consultar ficha",
  };
};

const getPriorityLabel = (priority: number | null) => {
  const value = priority ?? 5;

  if (value <= 1) return "Alta prioridade";
  if (value <= 2) return "Atenção";
  if (value <= 3) return "Acompanhar";
  return "Rotina";
};

const getUserGreeting = (email: string) => {
  if (!email) return "Olá";
  const name = email.split("@")[0]?.split(".")[0] || "usuário";
  return `Olá, ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
};

export default function UnidadesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userProfile, setUserProfile] = useState<CurrentUserProfile | null>(null);
  const [message, setMessage] = useState("");
  const [unidades, setUnidades] = useState<UnidadeLista[]>([]);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStorageKey, setOnboardingStorageKey] = useState("");
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("todas");

  const getTodayKey = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const maybeOpenDailyOnboarding = (userKey: string) => {
    if (typeof window === "undefined") return;

    const storageKey = `sistema-adm:onboarding-diario:${userKey}:${getTodayKey()}`;
    setOnboardingStorageKey(storageKey);

    if (!window.localStorage.getItem(storageKey)) {
      setOnboardingOpen(true);
    }
  };

  const closeDailyOnboarding = () => {
    if (typeof window !== "undefined" && onboardingStorageKey) {
      window.localStorage.setItem(onboardingStorageKey, "visto");
    }

    setOnboardingOpen(false);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const email = session.user.email ?? "";
      setUserEmail(email);

      const cachedProfile = getCachedCurrentUserProfile(session.user.id);
      if (cachedProfile) {
        setUserProfile(cachedProfile);
      }

      const cacheKey = buildClientCacheKey("unidades-lista", session.user.id);
      const cachedPayload = getCachedValue<UnidadesCachePayload>(cacheKey, {
        maxAgeMs: CLIENT_CACHE_TTL.operationalPage,
      });

      if (cachedPayload) {
        setUnidades(cachedPayload.unidades);
        setLoading(false);
      }

      const profile = await getCurrentUserProfile(session.user.id, email);
      setUserProfile(profile);

      maybeOpenDailyOnboarding(session.user.id || email || "usuario");

      const { data, error } = await supabase
        .from("vw_unidades_lista")
        .select(
          "unidade_id, nome_fantasia, razao_social, cnpj, qtd_vencidos, qtd_vence_em_7_dias, qtd_cadastro_incompleto, qtd_sem_anexo, prioridade_lista, proximo_prazo_relevante"
        )
        .order("prioridade_lista", { ascending: true })
        .order("nome_fantasia", { ascending: true });

      if (error) {
        console.error("Erro ao carregar unidades:", error);
        setMessage(
          getFriendlyErrorMessage(
            error,
            "Não foi possível carregar as unidades. Tente atualizar a página."
          )
        );
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as UnidadeLista[];
      setUnidades(rows);
      setCachedValue(cacheKey, { unidades: rows });
      setLoading(false);
    };

    bootstrap();
  }, [router]);

  const resumo = useMemo(() => {
    return {
      total: unidades.length,
      vencidos: unidades.filter((u) => getNumber(u.qtd_vencidos) > 0).length,
      proximos: unidades.filter((u) => getNumber(u.qtd_vence_em_7_dias) > 0).length,
      pendentes: unidades.filter(
        (u) => getNumber(u.qtd_cadastro_incompleto) > 0 || getNumber(u.qtd_sem_anexo) > 0
      ).length,
      semPrazo: unidades.filter((u) => !u.proximo_prazo_relevante).length,
    };
  }, [unidades]);

  const filteredUnidades = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return unidades.filter((unidade) => {
      const nomeFantasia = unidade.nome_fantasia?.toLowerCase() ?? "";
      const razaoSocial = unidade.razao_social?.toLowerCase() ?? "";
      const cnpj = unidade.cnpj?.toLowerCase() ?? "";

      const matchSearch =
        !termo ||
        nomeFantasia.includes(termo) ||
        razaoSocial.includes(termo) ||
        cnpj.includes(termo);

      const matchFilter =
        unitFilter === "todas" ||
        (unitFilter === "vencidos" && getNumber(unidade.qtd_vencidos) > 0) ||
        (unitFilter === "proximos" && getNumber(unidade.qtd_vence_em_7_dias) > 0) ||
        (unitFilter === "pendencias" &&
          (getNumber(unidade.qtd_cadastro_incompleto) > 0 ||
            getNumber(unidade.qtd_sem_anexo) > 0)) ||
        (unitFilter === "sem_prazo" && !unidade.proximo_prazo_relevante);

      return matchSearch && matchFilter;
    });
  }, [search, unidades, unitFilter]);

  const operationalSummary = useMemo(() => {
    if (resumo.vencidos > 0) {
      return {
        title: `${resumo.vencidos} unidade(s) precisam de ação imediata`,
        description: "Comece pelas unidades com itens vencidos. As demais podem ser acompanhadas na sequência.",
      };
    }

    if (resumo.proximos > 0) {
      return {
        title: `${resumo.proximos} unidade(s) têm vencimentos próximos`,
        description: "Revise os próximos prazos e confirme se já estão pagos ou programados.",
      };
    }

    if (resumo.pendentes > 0) {
      return {
        title: `${resumo.pendentes} unidade(s) têm cadastro para completar`,
        description: "Não há vencidos em destaque, mas existem dados ou anexos pendentes.",
      };
    }

    return {
      title: "Unidades em ordem",
      description: "Nenhuma pendência operacional relevante encontrada no momento.",
    };
  }, [resumo]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const openUnit = (id: string) => {
    router.push(`/unidades/${id}`);
  };

  const formatDate = (value: string | null) => {
    if (!value) return "Sem prazo";
    return new Date(value + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const onCardKeyDown = (event: KeyboardEvent<HTMLElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openUnit(id);
    }
  };

  return (
    <AdminShell section="unidades" userProfileCode={userProfile?.perfil}>
      <DailyOnboardingModal open={onboardingOpen} onClose={closeDailyOnboarding} />

      <section className="units-hero">
        <div className="units-hero-copy">
          <span className="eyebrow">GRUPO APIS</span>
          <h1 className="page-title">Unidades</h1>
          <p className="page-subtitle">
            Fichas, vencimentos e pendências organizados por unidade.
          </p>
        </div>

        <div className="units-hero-actions">
          {userProfile?.perfil_label ? (
            <span className="user-profile-badge">Perfil: {userProfile.perfil_label}</span>
          ) : null}
          <span className="user-badge">{getUserGreeting(userEmail)}</span>
          <button className="btn btn-secondary btn-small" type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </section>

      <section className="units-overview-panel">
        <div className="units-overview-copy">
          <span className="eyebrow">VISÃO OPERACIONAL</span>
          <h2>{operationalSummary.title}</h2>
          <p>{operationalSummary.description}</p>
        </div>

        <div className="units-metric-row">
          <UnitSummaryCard label="Unidades" value={resumo.total} tone="primary" />
          <UnitSummaryCard label="Vencidos" value={resumo.vencidos} tone="danger" />
          <UnitSummaryCard label="Próximos" value={resumo.proximos} tone="warning" />
          <UnitSummaryCard label="Pendências" value={resumo.pendentes} tone="default" />
        </div>
      </section>

      <section className="units-toolbar-panel">
        <div className="units-toolbar-head">
          <div>
            <span className="eyebrow">LOCALIZAR</span>
            <h2 className="section-title">Buscar e filtrar</h2>
          </div>
          <p>
            Mostrando <strong>{filteredUnidades.length}</strong> de {resumo.total} unidade(s)
          </p>
        </div>

        <div className="units-search-row">
          <label className="sr-only" htmlFor="search">
            Buscar unidade
          </label>
          <input
            id="search"
            type="text"
            placeholder="Buscar por nome, CNPJ ou razão social"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="alert-filter-chips units-filter-chips">
          <button
            className={`filter-chip ${unitFilter === "todas" ? "active" : ""}`}
            type="button"
            onClick={() => setUnitFilter("todas")}
          >
            Todas ({resumo.total})
          </button>
          <button
            className={`filter-chip ${unitFilter === "vencidos" ? "active" : ""}`}
            type="button"
            onClick={() => setUnitFilter("vencidos")}
          >
            Vencidos ({resumo.vencidos})
          </button>
          <button
            className={`filter-chip ${unitFilter === "proximos" ? "active" : ""}`}
            type="button"
            onClick={() => setUnitFilter("proximos")}
          >
            Próximos ({resumo.proximos})
          </button>
          <button
            className={`filter-chip ${unitFilter === "pendencias" ? "active" : ""}`}
            type="button"
            onClick={() => setUnitFilter("pendencias")}
          >
            Pendências ({resumo.pendentes})
          </button>
          <button
            className={`filter-chip ${unitFilter === "sem_prazo" ? "active" : ""}`}
            type="button"
            onClick={() => setUnitFilter("sem_prazo")}
          >
            Sem prazo ({resumo.semPrazo})
          </button>
        </div>
      </section>

      {message ? (
        <div className="message-box" role="alert">
          {message}
        </div>
      ) : null}

      {loading ? (
        <AppLoadingState
          title="Preparando mapa operacional"
          subtitle="Carregando unidades, vencimentos e pendências."
        />
      ) : filteredUnidades.length === 0 ? (
        <section className="empty-state">
          <p>Nenhuma unidade encontrada com os filtros atuais.</p>
        </section>
      ) : (
        <section className="unit-grid units-compact-grid">
          {filteredUnidades.map((unidade) => {
            const status = getUnitOperationalStatus(unidade);

            return (
              <article
                className="unit-card unit-card-clickable units-compact-card"
                key={unidade.unidade_id}
                onClick={() => openUnit(unidade.unidade_id)}
                onMouseEnter={() => router.prefetch(`/unidades/${unidade.unidade_id}`)}
                onFocus={() => router.prefetch(`/unidades/${unidade.unidade_id}`)}
                onKeyDown={(e) => onCardKeyDown(e, unidade.unidade_id)}
                tabIndex={0}
                role="button"
                aria-label={`Abrir ficha da unidade ${
                  unidade.nome_fantasia || unidade.razao_social || "unidade"
                }`}
              >
                <div className="unit-card-head units-compact-head">
                  <div>
                    <h2>{unidade.nome_fantasia || "Sem nome fantasia"}</h2>
                    <p>{unidade.razao_social || "Sem razão social"}</p>
                  </div>

                  <span
                    className={`alert-topic-pill ${
                      status.tone === "danger"
                        ? "badge-danger"
                        : status.tone === "warning"
                        ? "badge-warning"
                        : "muted-pill"
                    }`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="units-compact-meta">
                  <span>
                    <strong>CNPJ</strong>
                    {unidade.cnpj || "Não informado"}
                  </span>
                  <span>
                    <strong>Próximo prazo</strong>
                    {formatDate(unidade.proximo_prazo_relevante)}
                  </span>
                  <span>
                    <strong>Fila</strong>
                    {getPriorityLabel(unidade.prioridade_lista)}
                  </span>
                </div>

                <div className="units-compact-footer">
                  <div className="alert-badges units-compact-badges">
                    {getNumber(unidade.qtd_vencidos) > 0 ? (
                      <span className="badge badge-danger">
                        {unidade.qtd_vencidos} vencido(s)
                      </span>
                    ) : null}
                    {getNumber(unidade.qtd_vence_em_7_dias) > 0 ? (
                      <span className="badge badge-warning">
                        {unidade.qtd_vence_em_7_dias} próximo(s)
                      </span>
                    ) : null}
                    {getNumber(unidade.qtd_cadastro_incompleto) > 0 ? (
                      <span className="badge badge-neutral">
                        {unidade.qtd_cadastro_incompleto} cadastro
                      </span>
                    ) : null}
                    {getNumber(unidade.qtd_sem_anexo) > 0 ? (
                      <span className="badge badge-neutral">
                        {unidade.qtd_sem_anexo} sem anexo
                      </span>
                    ) : null}
                    {status.tone === "success" ? (
                      <span className="badge badge-neutral">Sem ação imediata</span>
                    ) : null}
                  </div>

                  <span className="unit-open-hint">{status.action} →</span>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </AdminShell>
  );
}
