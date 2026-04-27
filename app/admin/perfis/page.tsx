"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "@/components/app/admin-shell";
import { AdminTopbar } from "@/components/app/admin-topbar";
import { UnitSummaryCard } from "@/components/unidades/unit-summary-card";
import {
  adminUpdateUserProfile,
  CurrentUserProfile,
  getCurrentUserProfile,
  getUserProfileDiagnostics,
  UserProfileCode,
  UserProfileDiagnosticRow,
  userProfileOptions,
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

type UserProfileFormValue = {
  perfil: UserProfileCode;
  ativo: boolean;
};

type UserProfileFormState = Record<string, UserProfileFormValue>;

function getInitialProfileForm(row: UserProfileDiagnosticRow): UserProfileFormValue {
  return {
    perfil: row.perfil ?? "consulta",
    ativo: row.status_vinculo !== "perfil_inativo",
  };
}

function buildUserProfileFormState(rows: UserProfileDiagnosticRow[]): UserProfileFormState {
  return rows.reduce<UserProfileFormState>((acc, row) => {
    acc[row.auth_user_id] = getInitialProfileForm(row);
    return acc;
  }, {});
}

export default function AdminPerfisPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [userProfile, setUserProfile] = useState<CurrentUserProfile | null>(null);
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<UserProfileDiagnosticRow[]>([]);
  const [profileForms, setProfileForms] = useState<UserProfileFormState>({});
  const [savingId, setSavingId] = useState("");

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
      setCurrentUserId(session.user.id);

      const profile = await getCurrentUserProfile(session.user.id, email);
      setUserProfile(profile);

      if (profile.perfil !== "super_admin") {
        setMessage(
          "Gestão de perfis restrita ao super_admin. Esta tela não altera senha, não muda RLS e não bloqueia módulos."
        );
        setLoading(false);
        return;
      }

      const result = await getUserProfileDiagnostics();
      setRows(result.data);
      setProfileForms(buildUserProfileFormState(result.data));
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

  const getProfileForm = (row: UserProfileDiagnosticRow) => {
    return profileForms[row.auth_user_id] ?? getInitialProfileForm(row);
  };

  const updateProfileForm = (
    authUserId: string,
    changes: Partial<UserProfileFormValue>
  ) => {
    setProfileForms((current) => {
      const existing = current[authUserId] ?? {
        perfil: "consulta" as UserProfileCode,
        ativo: true,
      };

      return {
        ...current,
        [authUserId]: {
          ...existing,
          ...changes,
        },
      };
    });
  };

  const reloadDiagnostics = async () => {
    const result = await getUserProfileDiagnostics();
    setRows(result.data);
    setProfileForms(buildUserProfileFormState(result.data));
    return result.errorMessage;
  };

  const handleSaveProfile = async (row: UserProfileDiagnosticRow) => {
    const form = getProfileForm(row);
    setSavingId(row.auth_user_id);
    setMessage("");

    const result = await adminUpdateUserProfile({
      authUserId: row.auth_user_id,
      perfil: form.perfil,
      ativo: form.ativo,
    });

    if (!result.ok) {
      setMessage(result.errorMessage);
      setSavingId("");
      return;
    }

    const reloadError = await reloadDiagnostics();
    setMessage(
      reloadError ||
        `Perfil de ${row.email || "usuário"} atualizado com segurança.`
    );
    setSavingId("");
  };

  return (
    <AdminShell section="usuarios" userProfileCode={userProfile?.perfil}>
      <AdminTopbar
        eyebrow="ADMINISTRAÇÃO"
        title="Usuários e perfis"
        subtitle="Gestão mínima dos perfis vinculados aos usuários autenticados."
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
            <span className="eyebrow">0.4.3</span>
            <h2 className="section-title">Gestão mínima, sem bloqueio operacional</h2>
            <p className="page-subtitle">
              Esta tela permite vincular e ajustar perfis. Ela não cria usuários, não altera senha,
              não muda RLS das fichas, não mexe em anexos e não bloqueia módulos nesta etapa.
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
          <p>Carregando usuários e perfis...</p>
        </section>
      ) : rows.length === 0 ? (
        <section className="empty-state">
          <p>Nenhum usuário encontrado para exibição.</p>
        </section>
      ) : (
        <section className="unit-grid">
          {rows.map((row) => {
            const form = getProfileForm(row);
            const isSaving = savingId === row.auth_user_id;
            const isCurrentUser = currentUserId === row.auth_user_id;

            return (
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
                    <strong>Perfil atual:</strong> {row.perfil_label}
                  </span>
                  <span>
                    <strong>Cadastro no Auth:</strong> {formatDateTime(row.auth_criado_em)}
                  </span>
                  <span>
                    <strong>Último login:</strong> {formatDateTime(row.ultimo_login_em)}
                  </span>
                </div>

                <form
                  className="modal-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSaveProfile(row);
                  }}
                >
                  <div className="modal-grid">
                    <div className="field">
                      <label htmlFor={`perfil-${row.auth_user_id}`}>Perfil</label>
                      <select
                        id={`perfil-${row.auth_user_id}`}
                        value={form.perfil}
                        onChange={(event) =>
                          updateProfileForm(row.auth_user_id, {
                            perfil: event.target.value as UserProfileCode,
                          })
                        }
                      >
                        {userProfileOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor={`status-${row.auth_user_id}`}>Status</label>
                      <select
                        id={`status-${row.auth_user_id}`}
                        value={form.ativo ? "ativo" : "inativo"}
                        onChange={(event) =>
                          updateProfileForm(row.auth_user_id, {
                            ativo: event.target.value === "ativo",
                          })
                        }
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                  </div>

                  {isCurrentUser ? (
                    <div className="message-box">
                      Proteção ativa: o sistema não permite remover o seu próprio acesso
                      de super_admin.
                    </div>
                  ) : null}

                  {row.status_vinculo === "sem_perfil" ? (
                    <div className="message-box">
                      <strong>Ação sugerida:</strong> vincular este usuário a um perfil antes de
                      qualquer etapa futura de permissão.
                    </div>
                  ) : null}

                  <div className="modal-actions">
                    <button className="btn btn-primary" disabled={isSaving} type="submit">
                      {isSaving ? "Salvando..." : "Salvar perfil"}
                    </button>
                  </div>
                </form>
              </article>
            );
          })}
        </section>
      )}
    </AdminShell>
  );
}
