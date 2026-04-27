"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "@/components/app/admin-shell";
import { AdminTopbar } from "@/components/app/admin-topbar";
import { UnitSummaryCard } from "@/components/unidades/unit-summary-card";
import {
  CurrentUserProfile,
  getCurrentUserProfile,
  getUserProfileDiagnostics,
  UserProfileDiagnosticRow,
} from "@/lib/user-profile";

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getStatusBadgeClass(row: UserProfileDiagnosticRow) {
  if (row.status_vinculo === "sem_perfil") return "badge-warning";
  if (row.status_vinculo === "perfil_inativo") return "badge-danger";
  return "badge-neutral";
}

function getStatusLabel(row: UserProfileDiagnosticRow) {
  if (row.status_vinculo === "sem_perfil") return "Sem perfil";
  if (row.status_vinculo === "perfil_inativo") return "Perfil inativo";
  return "Perfil ativo";
}

export default function AdminPerfisPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userProfile, setUserProfile] = useState<CurrentUserProfile | null>(null);
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<UserProfileDiagnosticRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const email = session.user.email ?? "";
      setUserEmail(email);

      const profile = await getCurrentUserProfile(session.user.id, email);
      setUserProfile(profile);

      if (profile.perfil !== "super_admin") {
        setMessage(
          "Diagnóstico restrito ao super_admin. Esta tela não altera permissões e não bloqueia o uso normal do sistema."
        );
        setLoading(false);
        return;
      }

      const result = await getUserProfileDiagnostics();
      setRows(result.data);
      setMessage(result.errorMessage);
      setLoading(false);
    };

    load();
  }, [router]);

  const summary = useMemo(() => {
    return {
      total: rows.length,
      comPerfil: rows.filter((row) => row.status_vinculo === "perfil_ativo").length,
      semPerfil: rows.filter((row) => row.status_vinculo === "sem_perfil").length,
      inativos: rows.filter((row) => row.status_vinculo === "perfil_inativo").length,
    };
  }, [rows]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <AdminShell section="unidades">
      <AdminTopbar
        eyebrow="ADMINISTRAÇÃO"
        title="Usuários e perfis"
        subtitle="Diagnóstico simples dos usuários autenticados e seus perfis vinculados."
        userEmail={userEmail}
        userProfileLabel={userProfile?.perfil_label}
        onBack={() => router.push("/unidades")}
        backLabel="Voltar para unidades"
        onLogout={handleLogout}
      />

      <section className="summary-grid">
        <UnitSummaryCard label="Usuários no Auth" value={summary.total} tone="primary" />
        <UnitSummaryCard label="Com perfil ativo" value={summary.comPerfil} tone="default" />
        <UnitSummaryCard label="Sem perfil" value={summary.semPerfil} tone="warning" />
        <UnitSummaryCard label="Perfis inativos" value={summary.inativos} tone="danger" />
      </section>

      <section className="surface section-block">
        <div className="section-head compact-head">
          <div>
            <span className="eyebrow">0.4.2</span>
            <h2 className="section-title">Diagnóstico, sem bloqueio</h2>
            <p className="page-subtitle">
              Esta tela apenas mostra inconsistências de vínculo. Ela não edita usuários,
              não altera senha, não muda RLS e não bloqueia módulos.
            </p>
          </div>
        </div>

        {message ? (
          <div className="message-box" role="alert">
            {message}
          </div>
        ) : null}
      </section>

      {loading ? (
        <section className="empty-state">
          <p>Carregando diagnóstico de usuários e perfis...</p>
        </section>
      ) : rows.length === 0 ? (
        <section className="empty-state">
          <p>Nenhum usuário encontrado para exibição.</p>
        </section>
      ) : (
        <section className="unit-grid">
          {rows.map((row) => (
            <article className="unit-card" key={row.auth_user_id}>
              <div className="unit-card-head">
                <div>
                  <h2>{row.nome_exibicao || row.email || "Usuário"}</h2>
                  <p>{row.email || "E-mail não informado"}</p>
                </div>

                <span className={"badge " + getStatusBadgeClass(row)}>
                  {getStatusLabel(row)}
                </span>
              </div>

              <div className="detail-list">
                <span>
                  <strong>Perfil:</strong> {row.perfil_label}
                </span>
                <span>
                  <strong>Cadastro no Auth:</strong> {formatDateTime(row.auth_criado_em)}
                </span>
                <span>
                  <strong>Último login:</strong> {formatDateTime(row.ultimo_login_em)}
                </span>
              </div>

              {row.status_vinculo === "sem_perfil" ? (
                <div className="message-box">
                  <strong>Ação sugerida:</strong> vincular este usuário a um perfil antes de
                  qualquer etapa futura de permissão.
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </AdminShell>
  );
}
