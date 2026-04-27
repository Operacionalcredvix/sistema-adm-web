"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";
import { AdminShell } from "@/components/app/admin-shell";
import { AdminTopbar } from "@/components/app/admin-topbar";
import { UnitSummaryCard } from "@/components/unidades/unit-summary-card";

type AlertRow = {
  unidade_id: string;
  nome_fantasia: string | null;
  tipo_nome: string;
  alerta_codigo: string;
  alerta_titulo: string;
  alerta_descricao: string;
  severidade_visual: "alto" | "medio" | "baixo";
  prioridade_alerta: number;
  data_referencia_alerta: string | null;
};

type AlertMode = "operacional" | "cadastro";
type OperationalFocus = "todos" | "aluguel";

const alertCodeLabel: Record<string, string> = {
  vencido: "Vencido",
  vence_em_7_dias: "Vence em breve",
  cadastro_incompleto: "Cadastro incompleto",
  sem_anexo: "Sem anexo",
};

const modeConfig: Record<
  AlertMode,
  {
    title: string;
    description: string;
    allowedCodes: Array<"vencido" | "vence_em_7_dias" | "cadastro_incompleto" | "sem_anexo">;
  }
> = {
  operacional: {
    title: "Agenda operacional",
    description:
      "Vencidos e próximos vencimentos organizados por prioridade de ação.",
    allowedCodes: ["vencido", "vence_em_7_dias"],
  },
  cadastro: {
    title: "Pendências de cadastro",
    description:
      "Itens incompletos ou sem anexo. Use esta visão para saneamento da base, não como urgência operacional.",
    allowedCodes: ["cadastro_incompleto", "sem_anexo"],
  },
};

const isAluguelAlert = (alert: AlertRow) =>
  alert.tipo_nome.toLowerCase().includes("aluguel");

const getActionText = (alert: AlertRow) => {
  if (alert.alerta_codigo === "vencido") {
    return "Atualizar pagamento ou revisar vencimento.";
  }

  if (alert.alerta_codigo === "vence_em_7_dias") {
    return "Conferir se o pagamento já foi feito ou programar acompanhamento.";
  }

  if (alert.alerta_codigo === "cadastro_incompleto") {
    return "Completar os campos principais da ficha.";
  }

  if (alert.alerta_codigo === "sem_anexo") {
    return "Anexar documento essencial quando existir.";
  }

  return "Abrir a ficha e revisar este item.";
};

const sortAgendaAlerts = (rows: AlertRow[]) =>
  [...rows].sort((a, b) => {
    const aluguelDiff = Number(isAluguelAlert(b)) - Number(isAluguelAlert(a));
    if (aluguelDiff !== 0) return aluguelDiff;

    const priorityDiff = a.prioridade_alerta - b.prioridade_alerta;
    if (priorityDiff !== 0) return priorityDiff;

    const dateA = a.data_referencia_alerta ?? "9999-12-31";
    const dateB = b.data_referencia_alerta ?? "9999-12-31";

    if (dateA !== dateB) return dateA.localeCompare(dateB);

    return (a.nome_fantasia ?? "").localeCompare(b.nome_fantasia ?? "");
  });

export default function AlertasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [mode, setMode] = useState<AlertMode>("operacional");
  const [operationalFocus, setOperationalFocus] = useState<OperationalFocus>("todos");
  const [severityFilter, setSeverityFilter] = useState<"todos" | "alto" | "medio" | "baixo">("todos");
  const [codeFilter, setCodeFilter] = useState<"todos" | "vencido" | "vence_em_7_dias" | "cadastro_incompleto" | "sem_anexo">("todos");

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setUserEmail(session.user.email ?? "");

      const { data, error } = await supabase
        .from("vw_alertas_unidade_tela")
        .select(
          "unidade_id, nome_fantasia, tipo_nome, alerta_codigo, alerta_titulo, alerta_descricao, severidade_visual, prioridade_alerta, data_referencia_alerta"
        )
        .order("prioridade_alerta", { ascending: true })
        .order("nome_fantasia", { ascending: true });

      if (error) {
        console.error("Erro ao carregar alertas:", error);
        setMessage(
          getFriendlyErrorMessage(
            error,
            "Não foi possível carregar os alertas. Tente atualizar a página."
          )
        );
        setLoading(false);
        return;
      }

      setAlerts((data ?? []) as AlertRow[]);
      setLoading(false);
    };

    load();
  }, [router]);

  useEffect(() => {
    setCodeFilter("todos");
    setOperationalFocus("todos");
  }, [mode]);

  const operationalAlerts = useMemo(() => {
    return alerts.filter(
      (a) => a.alerta_codigo === "vencido" || a.alerta_codigo === "vence_em_7_dias"
    );
  }, [alerts]);

  const alertsInMode = useMemo(() => {
    const allowed = new Set(modeConfig[mode].allowedCodes);
    return alerts.filter((alert) => allowed.has(alert.alerta_codigo as any));
  }, [alerts, mode]);

  const filteredAlerts = useMemo(() => {
    const termo = search.trim().toLowerCase();
    const allowed = new Set(modeConfig[mode].allowedCodes);

    return alerts.filter((alert) => {
      const unidade = alert.nome_fantasia?.toLowerCase() ?? "";
      const tipo = alert.tipo_nome.toLowerCase();
      const titulo = alert.alerta_titulo.toLowerCase();
      const descricao = alert.alerta_descricao.toLowerCase();

      const matchMode = allowed.has(alert.alerta_codigo as any);
      const matchOperationalFocus =
        mode !== "operacional" ||
        operationalFocus === "todos" ||
        isAluguelAlert(alert);
      const matchSearch =
        !termo ||
        unidade.includes(termo) ||
        tipo.includes(termo) ||
        titulo.includes(termo) ||
        descricao.includes(termo);

      const matchSeverity =
        severityFilter === "todos" || alert.severidade_visual === severityFilter;

      const matchCode =
        codeFilter === "todos" || alert.alerta_codigo === codeFilter;

      return matchMode && matchOperationalFocus && matchSearch && matchSeverity && matchCode;
    });
  }, [alerts, search, severityFilter, codeFilter, mode, operationalFocus]);

  const agendaGroups = useMemo(() => {
    return [
      {
        code: "vencido",
        title: "Vencidos",
        description: "Resolver primeiro. Estes itens já passaram da data de referência.",
        tone: "danger",
        items: sortAgendaAlerts(
          filteredAlerts.filter((alert) => alert.alerta_codigo === "vencido")
        ),
      },
      {
        code: "vence_em_7_dias",
        title: "Vencem em breve",
        description: "Acompanhar agora para evitar que virem vencidos.",
        tone: "warning",
        items: sortAgendaAlerts(
          filteredAlerts.filter((alert) => alert.alerta_codigo === "vence_em_7_dias")
        ),
      },
    ];
  }, [filteredAlerts]);

  const resumoOperacional = useMemo(() => {
    const rows = operationalAlerts;
    return {
      total: rows.length,
      vencidos: rows.filter((a) => a.alerta_codigo === "vencido").length,
      proximos: rows.filter((a) => a.alerta_codigo === "vence_em_7_dias").length,
      alugueis: rows.filter((a) => isAluguelAlert(a)).length,
    };
  }, [operationalAlerts]);

  const resumoCadastro = useMemo(() => {
    const rows = alerts.filter(
      (a) => a.alerta_codigo === "cadastro_incompleto" || a.alerta_codigo === "sem_anexo"
    );
    return {
      total: rows.length,
      incompleto: rows.filter((a) => a.alerta_codigo === "cadastro_incompleto").length,
      semAnexo: rows.filter((a) => a.alerta_codigo === "sem_anexo").length,
      unidades: new Set(rows.map((a) => a.unidade_id)).size,
    };
  }, [alerts]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const countsInMode = useMemo(() => {
    return {
      vencido: alertsInMode.filter((a) => a.alerta_codigo === "vencido").length,
      vence_em_7_dias: alertsInMode.filter((a) => a.alerta_codigo === "vence_em_7_dias").length,
      cadastro_incompleto: alertsInMode.filter((a) => a.alerta_codigo === "cadastro_incompleto").length,
      sem_anexo: alertsInMode.filter((a) => a.alerta_codigo === "sem_anexo").length,
      aluguel: operationalAlerts.filter((a) => isAluguelAlert(a)).length,
    };
  }, [alertsInMode, operationalAlerts]);

  const isOperational = mode === "operacional";

  const renderAlertCard = (alert: AlertRow, index: number) => (
    <article
      className={`priority-alert alert-card priority-${alert.prioridade_alerta}`}
      key={`${alert.unidade_id}-${alert.tipo_nome}-${alert.alerta_codigo}-${index}`}
    >
      <div className="priority-alert-head">
        <strong>{alert.nome_fantasia || "Unidade"}</strong>
        <span className={`severity-tag severity-${alert.severidade_visual}`}>
          {alert.severidade_visual}
        </span>
      </div>

      <div className="alert-topics">
        <span className="alert-topic-pill">
          {alertCodeLabel[alert.alerta_codigo] || alert.alerta_codigo}
        </span>
        <span className="alert-topic-pill muted-pill">{alert.tipo_nome}</span>
        {isAluguelAlert(alert) ? (
          <span className="alert-topic-pill">Aluguel</span>
        ) : null}
      </div>

      <p className="priority-alert-title">{alert.alerta_titulo}</p>
      <p className="priority-alert-desc">{alert.alerta_descricao}</p>

      <div className="message-box">
        <strong>Ação esperada:</strong> {getActionText(alert)}
      </div>

      <div className="alert-card-footer">
        <span className="priority-alert-date">
          Data de referência: {formatDate(alert.data_referencia_alerta)}
        </span>

        <button
          className="btn btn-primary"
          onClick={() => router.push(`/unidades/${alert.unidade_id}`)}
        >
          Abrir ficha para atualizar
        </button>
      </div>
    </article>
  );

  return (
    <AdminShell section="alertas">
      <AdminTopbar
        eyebrow="ALERTAS E PENDÊNCIAS"
        title="Alertas"
        subtitle="Agenda operacional de vencimentos, com pendências de cadastro separadas."
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {isOperational ? (
        <section className="summary-grid">
          <UnitSummaryCard label="Total operacional" value={resumoOperacional.total} tone="primary" />
          <UnitSummaryCard label="Vencidos" value={resumoOperacional.vencidos} tone="danger" />
          <UnitSummaryCard label="Vencem em breve" value={resumoOperacional.proximos} tone="warning" />
          <UnitSummaryCard label="Aluguéis em atenção" value={resumoOperacional.alugueis} tone="default" />
        </section>
      ) : (
        <section className="summary-grid">
          <UnitSummaryCard label="Total de pendências" value={resumoCadastro.total} tone="primary" />
          <UnitSummaryCard label="Cadastro incompleto" value={resumoCadastro.incompleto} tone="warning" />
          <UnitSummaryCard label="Sem anexo" value={resumoCadastro.semAnexo} tone="default" />
          <UnitSummaryCard label="Unidades pendentes" value={resumoCadastro.unidades} tone="danger" />
        </section>
      )}

      <section className="surface section-block">
        <div className="section-head compact-head">
          <div>
            <span className="eyebrow">MODO DE LEITURA</span>
            <h2 className="section-title">{modeConfig[mode].title}</h2>
            <p className="page-subtitle">{modeConfig[mode].description}</p>
          </div>
        </div>

        <div className="mode-switch">
          <button
            type="button"
            className={`mode-chip ${mode === "operacional" ? "active" : ""}`}
            onClick={() => setMode("operacional")}
          >
            Operacional
          </button>
          <button
            type="button"
            className={`mode-chip ${mode === "cadastro" ? "active" : ""}`}
            onClick={() => setMode("cadastro")}
          >
            Cadastro
          </button>
        </div>

        <div className="alerts-explainer">
          <strong>
            {isOperational ? "Agenda do que precisa de acompanhamento." : "Leitura recomendada para saneamento."}
          </strong>
          <p>
            {isOperational
              ? "A lista abaixo é organizada por vencidos e vencimentos próximos. Dentro de cada grupo, aluguéis aparecem primeiro."
              : "Aqui aparecem dados faltantes. São importantes para completar a base, mas não devem ser confundidos com vencimento real."}
          </p>
        </div>

        <div className="filter-grid">
          <div className="field">
            <label htmlFor="search">Busca</label>
            <input
              id="search"
              type="text"
              placeholder="Ex.: APIS, aluguel, vencido, extintores"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="severityFilter">Severidade</label>
            <select
              id="severityFilter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
            >
              <option value="todos">Todos</option>
              <option value="alto">Alta</option>
              <option value="medio">Média</option>
              <option value="baixo">Baixa</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="codeFilter">Tipo do alerta</label>
            <select
              id="codeFilter"
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value as typeof codeFilter)}
            >
              <option value="todos">Todos</option>
              {isOperational ? (
                <>
                  <option value="vencido">Vencido</option>
                  <option value="vence_em_7_dias">Vence em breve</option>
                </>
              ) : (
                <>
                  <option value="cadastro_incompleto">Cadastro incompleto</option>
                  <option value="sem_anexo">Sem anexo</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="alert-filter-chips">
          <button
            className={`filter-chip ${codeFilter === "todos" && operationalFocus === "todos" ? "active" : ""}`}
            onClick={() => {
              setCodeFilter("todos");
              setOperationalFocus("todos");
            }}
            type="button"
          >
            Todos ({alertsInMode.length})
          </button>

          {isOperational ? (
            <>
              <button
                className={`filter-chip ${operationalFocus === "aluguel" ? "active" : ""}`}
                onClick={() => {
                  setOperationalFocus("aluguel");
                  setCodeFilter("todos");
                }}
                type="button"
              >
                Aluguéis ({countsInMode.aluguel})
              </button>
              <button
                className={`filter-chip ${codeFilter === "vencido" && operationalFocus === "todos" ? "active" : ""}`}
                onClick={() => {
                  setOperationalFocus("todos");
                  setCodeFilter("vencido");
                }}
                type="button"
              >
                Vencidos ({countsInMode.vencido})
              </button>
              <button
                className={`filter-chip ${codeFilter === "vence_em_7_dias" && operationalFocus === "todos" ? "active" : ""}`}
                onClick={() => {
                  setOperationalFocus("todos");
                  setCodeFilter("vence_em_7_dias");
                }}
                type="button"
              >
                Vencem em breve ({countsInMode.vence_em_7_dias})
              </button>
            </>
          ) : (
            <>
              <button
                className={`filter-chip ${codeFilter === "cadastro_incompleto" ? "active" : ""}`}
                onClick={() => setCodeFilter("cadastro_incompleto")}
                type="button"
              >
                Cadastro incompleto ({countsInMode.cadastro_incompleto})
              </button>
              <button
                className={`filter-chip ${codeFilter === "sem_anexo" ? "active" : ""}`}
                onClick={() => setCodeFilter("sem_anexo")}
                type="button"
              >
                Sem anexo ({countsInMode.sem_anexo})
              </button>
            </>
          )}
        </div>
      </section>

      {message ? (
        <div className="message-box" role="alert">
          {message}
        </div>
      ) : null}

      {loading ? (
        <section className="empty-state">
          <p>Carregando alertas...</p>
        </section>
      ) : filteredAlerts.length === 0 ? (
        <section className="empty-state">
          <p>
            {isOperational
              ? "Nenhum vencimento encontrado com os filtros atuais."
              : "Nenhuma pendência de cadastro encontrada com os filtros atuais."}
          </p>
        </section>
      ) : isOperational ? (
        <section className="group-section">
          {agendaGroups.map((group) =>
            group.items.length > 0 ? (
              <section className="surface section-block" key={group.code}>
                <div className="section-head compact-head">
                  <div>
                    <span className={`badge ${group.tone === "danger" ? "badge-danger" : "badge-warning"}`}>
                      {group.items.length} item(ns)
                    </span>
                    <h2 className="section-title">{group.title}</h2>
                    <p className="page-subtitle">{group.description}</p>
                  </div>
                </div>

                <div className="alerts-grid">
                  {group.items.map((alert, index) => renderAlertCard(alert, index))}
                </div>
              </section>
            ) : null
          )}
        </section>
      ) : (
        <section className="alerts-grid">
          {filteredAlerts.map((alert, index) => renderAlertCard(alert, index))}
        </section>
      )}
    </AdminShell>
  );
}
