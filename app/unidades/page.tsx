"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";
import { AdminShell } from "@/components/app/admin-shell";
import { AdminTopbar } from "@/components/app/admin-topbar";
import { DailyOnboardingModal } from "@/components/app/daily-onboarding-modal";
import { UnitSummaryCard } from "@/components/unidades/unit-summary-card";

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
      description: "Existe item vencido nesta unidade. Priorize a atualização da ficha.",
      action: "Abrir ficha e atualizar o item vencido.",
    };
  }

  if (proximos > 0) {
    return {
      label: "Acompanhar vencimento",
      tone: "warning",
      description: "Existe vencimento próximo. Confira se já foi pago ou programado.",
      action: "Abrir ficha e revisar o próximo prazo.",
    };
  }

  if (cadastro > 0 || semAnexo > 0) {
    return {
      label: "Completar cadastro",
      tone: "neutral",
      description: "Não há vencimento imediato, mas existem dados ou anexos pendentes.",
      action: "Abrir ficha e completar informações quando possível.",
    };
  }

  return {
    label: "Em ordem",
    tone: "success",
    description: "Sem vencimentos ou pendências relevantes no momento.",
    action: "Abrir ficha para consulta ou manutenção preventiva.",
  };
};

export default function UnidadesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("");
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

      setUnidades((data ?? []) as UnidadeLista[]);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const openUnit = (id: string) => {
    router.push(`/unidades/${id}`);
  };

  const formatDate = (value: string | null) => {
    if (!value) return "Sem prazo relevante";
    return new Date(value + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const onCardKeyDown = (event: React.KeyboardEvent<HTMLElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openUnit(id);
    }
  };

  return (
    <AdminShell section="unidades">
      <DailyOnboardingModal open={onboardingOpen} onClose={closeDailyOnboarding} />

      <AdminTopbar
        eyebrow="GRUPO APIS"
        title="Unidades"
        subtitle="Mapa operacional das fichas, vencimentos e pendências por unidade."
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      <section className="summary-grid">
        <UnitSummaryCard label="Total de unidades" value={resumo.total} tone="primary" />
        <UnitSummaryCard label="Com vencidos" value={resumo.vencidos} tone="danger" />
        <UnitSummaryCard label="Vencem em breve" value={resumo.proximos} tone="warning" />
        <UnitSummaryCard label="Com pendências" value={resumo.pendentes} tone="default" />
      </section>

      <section className="surface section-block">
        <div className="section-head compact-head">
          <div>
            <span className="eyebrow">MAPA OPERACIONAL</span>
            <h2 className="section-title">Buscar unidade</h2>
            <p className="page-subtitle">
              Use a busca ou os filtros rápidos para encontrar unidades que precisam de ação.
            </p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="search">Busca</label>
          <input
            id="search"
            type="text"
            placeholder="Ex.: APIS, CNPJ ou razão social"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="alert-filter-chips">
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
            Vencem em breve ({resumo.proximos})
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
        <section className="empty-state">
          <p>Carregando unidades...</p>
        </section>
      ) : filteredUnidades.length === 0 ? (
        <section className="empty-state">
          <p>Nenhuma unidade encontrada com os filtros atuais.</p>
        </section>
      ) : (
        <section className="unit-grid">
          {filteredUnidades.map((unidade) => {
            const status = getUnitOperationalStatus(unidade);

            return (
              <article
                className="unit-card unit-card-clickable"
                key={unidade.unidade_id}
                onClick={() => openUnit(unidade.unidade_id)}
                onKeyDown={(e) => onCardKeyDown(e, unidade.unidade_id)}
                tabIndex={0}
                role="button"
                aria-label={`Abrir ficha da unidade ${unidade.nome_fantasia || unidade.razao_social || "unidade"}`}
              >
                <div className="unit-card-head">
                  <div>
                    <h2>{unidade.nome_fantasia || "Sem nome fantasia"}</h2>
                    <p>{unidade.razao_social || "Sem razão social"}</p>
                  </div>
                  <span className={`priority-badge priority-${unidade.prioridade_lista || 5}`}>
                    Prioridade {unidade.prioridade_lista || 5}
                  </span>
                </div>

                <div className="alert-topics">
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

                <p className="priority-alert-desc">{status.description}</p>

                <div className="detail-list">
                  <span><strong>CNPJ:</strong> {unidade.cnpj || "Não informado"}</span>
                  <span>
                    <strong>Próximo prazo:</strong> {formatDate(unidade.proximo_prazo_relevante)}
                  </span>
                </div>

                <div className="alert-badges">
                  <span className="badge badge-danger">
                    Vencidos: {unidade.qtd_vencidos || 0}
                  </span>
                  <span className="badge badge-warning">
                    Vencem em breve: {unidade.qtd_vence_em_7_dias || 0}
                  </span>
                  <span className="badge badge-neutral">
                    Cadastro incompleto: {unidade.qtd_cadastro_incompleto || 0}
                  </span>
                  <span className="badge badge-neutral">
                    Sem anexo: {unidade.qtd_sem_anexo || 0}
                  </span>
                </div>

                <div className="message-box">
                  <strong>Próxima ação:</strong> {status.action}
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openUnit(unidade.unidade_id);
                    }}
                  >
                    Abrir ficha
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </AdminShell>
  );
}
