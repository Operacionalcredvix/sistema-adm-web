"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "@/components/app/admin-shell";
import { AdminTopbar } from "@/components/app/admin-topbar";
import { UnitSummaryCard } from "@/components/unidades/unit-summary-card";
import { UnitEditModal } from "@/components/unidades/unit-edit-modal";
import { ItemEditModal, EditableItem } from "@/components/unidades/item-edit-modal";
import {
  ItemAttachmentsModal,
  AttachmentRecord,
} from "@/components/unidades/item-attachments-modal";
import { SectionEditModal } from "@/components/unidades/section-edit-modal";

type FichaItem = {
  unidade_id: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  endereco: string | null;
  telefone_fixo: string | null;
  unidade_observacao: string | null;
  item_ficha_id: string;
  tipo_item_id: string;
  tipo_codigo: string;
  tipo_nome: string;
  tipo_grupo: string;
  ordem_exibicao: number;
  status_aplicacao: string;
  dia_vencimento: number | null;
  data_principal: string | null;
  data_secundaria: string | null;
  valor_principal: number | null;
  numero_principal: number | null;
  texto_principal: string | null;
  texto_secundario: string | null;
  identificador_externo: string | null;
  item_observacao: string | null;
  total_anexos: number | null;
};

type AlertaItem = {
  tipo_nome: string;
  alerta_codigo: string;
  alerta_titulo: string;
  alerta_descricao: string;
  severidade_visual: "alto" | "medio" | "baixo";
  prioridade_alerta: number;
  data_referencia_alerta: string | null;
};

const groupLabels: Record<string, string> = {
  documentos_gerais: "Documentos",
  contas_gerais: "Contas e obrigações",
  tributos: "Tributos",
  seguros: "Seguros",
  operacional: "Operação e segurança",
};

export default function UnidadeDetalhePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const unidadeId = params.id;

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<FichaItem[]>([]);
  const [alerts, setAlerts] = useState<AlertaItem[]>([]);
  const [attachmentsByItem, setAttachmentsByItem] = useState<Record<string, AttachmentRecord[]>>(
    {}
  );
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EditableItem | null>(null);
  const [selectedAttachmentItem, setSelectedAttachmentItem] = useState<{
    item_ficha_id: string;
    tipo_nome: string;
  } | null>(null);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("");

  const groupAttachments = (rows: AttachmentRecord[]) => {
    const grouped: Record<string, AttachmentRecord[]> = {};
    for (const row of rows) {
      if (!grouped[row.item_ficha_id]) grouped[row.item_ficha_id] = [];
      grouped[row.item_ficha_id].push(row);
    }
    return grouped;
  };

  const loadData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    setUserEmail(session.user.email ?? "");
    setUserId(session.user.id);

    const { data: fichaData, error: fichaError } = await supabase
      .from("vw_ficha_unidade")
      .select("*")
      .eq("unidade_id", unidadeId)
      .order("ordem_exibicao", { ascending: true });

    if (fichaError) {
      setMessage(fichaError.message);
      setLoading(false);
      return;
    }

    const { data: alertData, error: alertError } = await supabase
      .from("vw_alertas_unidade_tela")
      .select(
        "tipo_nome, alerta_codigo, alerta_titulo, alerta_descricao, severidade_visual, prioridade_alerta, data_referencia_alerta"
      )
      .eq("unidade_id", unidadeId)
      .order("prioridade_alerta", { ascending: true })
      .order("tipo_nome", { ascending: true });

    if (alertError) {
      setMessage(alertError.message);
      setLoading(false);
      return;
    }

    const itemIds = ((fichaData ?? []) as FichaItem[]).map((item) => item.item_ficha_id);

    let groupedAttachments: Record<string, AttachmentRecord[]> = {};
    if (itemIds.length > 0) {
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from("anexo")
        .select(
          "id, item_ficha_id, nome_original, caminho_storage, tipo_arquivo, tamanho_bytes, enviado_em, ativo"
        )
        .in("item_ficha_id", itemIds)
        .eq("ativo", true)
        .order("enviado_em", { ascending: false });

      if (attachmentsError) {
        setMessage(attachmentsError.message);
      } else {
        groupedAttachments = groupAttachments((attachmentsData ?? []) as AttachmentRecord[]);
      }
    }

    setItems((fichaData ?? []) as FichaItem[]);
    setAlerts((alertData ?? []) as AlertaItem[]);
    setAttachmentsByItem(groupedAttachments);
    setLoading(false);
  };

  useEffect(() => {
    if (unidadeId) {
      loadData();
    }
  }, [unidadeId]);

  const unit = items[0];

  const groupedItems = useMemo(() => {
    const groups = new Map<string, FichaItem[]>();

    for (const item of items) {
      if (!groups.has(item.tipo_grupo)) {
        groups.set(item.tipo_grupo, []);
      }
      groups.get(item.tipo_grupo)!.push(item);
    }

    return Array.from(groups.entries());
  }, [items]);

  const groupedMap = useMemo(() => Object.fromEntries(groupedItems), [groupedItems]);

  const selectedSectionItems = selectedSectionKey ? groupedMap[selectedSectionKey] ?? [] : [];

  const topAlerts = useMemo(() => alerts.slice(0, 6), [alerts]);

  const currentAttachments = selectedAttachmentItem
    ? attachmentsByItem[selectedAttachmentItem.item_ficha_id] ?? []
    : [];

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const formatMoney = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const sanitizeFileName = (fileName: string) => {
    const lastDot = fileName.lastIndexOf(".");
    const extension = lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : "";
    const baseName = (lastDot >= 0 ? fileName.slice(0, lastDot) : fileName)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

    return {
      baseName: baseName || "arquivo",
      extension,
    };
  };

  const rowsForItem = (item: FichaItem) => {
    const rows: Array<{ label: string; value: string }> = [];
    const push = (label: string, value: string | number | null | undefined) => {
      if (value === null || value === undefined || value === "") return;
      rows.push({ label, value: String(value) });
    };

    switch (item.tipo_codigo) {
      case "aluguel":
        push("Dia do vencimento", item.dia_vencimento);
        push("Último pagamento", formatDate(item.data_principal));
        push("Valor atual", formatMoney(item.valor_principal));
        push("Proprietário", item.texto_principal);
        push("Contato", item.texto_secundario);
        break;
      case "condominio":
        push("Dia do vencimento", item.dia_vencimento);
        push("Último pagamento", formatDate(item.data_principal));
        push("Valor atual", formatMoney(item.valor_principal));
        break;
      case "agua":
        push("Dia do vencimento", item.dia_vencimento);
        push("Último pagamento", formatDate(item.data_principal));
        push("CNPJ do fornecedor", item.texto_principal);
        push("Titular da conta", item.texto_secundario);
        push("Código de inscrição", item.identificador_externo);
        break;
      case "energia":
      case "internet":
      case "telefonia_fixa":
        push("Dia do vencimento", item.dia_vencimento);
        push("Último pagamento", formatDate(item.data_principal));
        push("Identificador", item.identificador_externo);
        break;
      case "extintores":
        push("Quantidade", item.numero_principal);
        push("Vencimento", formatDate(item.data_secundaria));
        push("Fornecedor", item.texto_principal);
        push("Contato", item.texto_secundario);
        break;
      case "dedetizacao":
        push("Última dedetização", formatDate(item.data_principal));
        push("Próxima dedetização", formatDate(item.data_secundaria));
        break;
      default:
        push("Data principal", formatDate(item.data_principal));
        push("Data secundária", formatDate(item.data_secundaria));
        push("Texto principal", item.texto_principal);
        push("Texto secundário", item.texto_secundario);
        push("Identificador", item.identificador_externo);
        push("Observação", item.item_observacao);
        break;
    }

    return rows;
  };

  const getItemAlerts = (tipoNome: string) =>
    alerts.filter((alert) => alert.tipo_nome === tipoNome);

  const openEditItem = (item: FichaItem | EditableItem) => {
    setSelectedItem({
      item_ficha_id: item.item_ficha_id,
      tipo_nome: item.tipo_nome,
      tipo_codigo: item.tipo_codigo,
      status_aplicacao: item.status_aplicacao,
      dia_vencimento: item.dia_vencimento,
      data_principal: item.data_principal,
      data_secundaria: item.data_secundaria,
      valor_principal: item.valor_principal,
      numero_principal: item.numero_principal,
      texto_principal: item.texto_principal,
      texto_secundario: item.texto_secundario,
      identificador_externo: item.identificador_externo,
      item_observacao: "item_observacao" in item ? item.item_observacao : null,
    });
    setItemModalOpen(true);
  };

  const openAttachments = (args: { item_ficha_id: string; tipo_nome: string }) => {
    setSelectedAttachmentItem(args);
    setAttachmentsModalOpen(true);
  };

  const handleUnitSave = async (payload: {
    unidade_id: string;
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    endereco: string;
    telefone_fixo: string;
    observacao: string;
  }) => {
    const { error } = await supabase
      .from("unidade")
      .update({
        razao_social: payload.razao_social,
        nome_fantasia: payload.nome_fantasia,
        cnpj: payload.cnpj,
        endereco: payload.endereco || null,
        telefone_fixo: payload.telefone_fixo || null,
        observacao: payload.observacao || null,
      })
      .eq("id", payload.unidade_id);

    if (error) throw new Error(error.message);

    await loadData();
    setMessage("Unidade atualizada com sucesso.");
  };

  const handleItemSave = async (payload: {
    item_ficha_id: string;
    status_aplicacao: string;
    dia_vencimento: number | null;
    data_principal: string | null;
    data_secundaria: string | null;
    valor_principal: number | null;
    numero_principal: number | null;
    texto_principal: string | null;
    texto_secundario: string | null;
    identificador_externo: string | null;
    observacao: string | null;
  }) => {
    const { error } = await supabase
      .from("item_ficha")
      .update({
        status_aplicacao: payload.status_aplicacao,
        dia_vencimento: payload.dia_vencimento,
        data_principal: payload.data_principal,
        data_secundaria: payload.data_secundaria,
        valor_principal: payload.valor_principal,
        numero_principal: payload.numero_principal,
        texto_principal: payload.texto_principal,
        texto_secundario: payload.texto_secundario,
        identificador_externo: payload.identificador_externo,
        observacao: payload.observacao,
      })
      .eq("id", payload.item_ficha_id);

    if (error) throw new Error(error.message);

    await loadData();
    setMessage("Item atualizado com sucesso.");
  };

  const handleAttachmentUpload = async (file: File) => {
    if (!selectedAttachmentItem) {
      throw new Error("Nenhum item selecionado para anexo.");
    }

    const safe = sanitizeFileName(file.name);
    const internalName = `${Date.now()}-${crypto.randomUUID()}${safe.extension ? `.${safe.extension}` : ""}`;
    const storagePath = `unidades/${unidadeId}/itens/${selectedAttachmentItem.item_ficha_id}/${internalName}`;

    const { error: storageError } = await supabase.storage
      .from("anexos-ficha")
      .upload(storagePath, file, {
        upsert: false,
        cacheControl: "3600",
      });

    if (storageError) {
      throw new Error(storageError.message);
    }

    const { error: insertError } = await supabase.from("anexo").insert({
      item_ficha_id: selectedAttachmentItem.item_ficha_id,
      nome_original: file.name,
      nome_interno: internalName,
      caminho_storage: storagePath,
      tipo_arquivo: file.type || null,
      tamanho_bytes: file.size,
      enviado_por: userId || null,
      ativo: true,
    });

    if (insertError) {
      await supabase.storage.from("anexos-ficha").remove([storagePath]);
      throw new Error(insertError.message);
    }

    await loadData();
    setMessage("Anexo enviado com sucesso.");
  };

  const handleOpenAttachment = async (attachment: AttachmentRecord) => {
    const { data, error } = await supabase.storage
      .from("anexos-ficha")
      .createSignedUrl(attachment.caminho_storage, 60);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "Não foi possível abrir o anexo.");
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleDeleteAttachment = async (attachment: AttachmentRecord) => {
    const { error: updateError } = await supabase
      .from("anexo")
      .update({ ativo: false })
      .eq("id", attachment.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await loadData();
    setMessage("Anexo removido da ficha. O arquivo foi preservado no armazenamento.");
  };

  const buildSectionStats = (groupItems: FichaItem[]) => {
    const totalItems = groupItems.length;
    const itemsWithAlerts = groupItems.filter(
      (item) => getItemAlerts(item.tipo_nome).length > 0
    ).length;
    const itemsWithAttachments = groupItems.filter(
      (item) => (attachmentsByItem[item.item_ficha_id] ?? []).length > 0
    ).length;

    return {
      totalItems,
      itemsWithAlerts,
      itemsWithAttachments,
      itemsWithoutAttachments: totalItems - itemsWithAttachments,
    };
  };

  const scrollToSection = (groupKey: string) => {
    const target = document.getElementById(`section-${groupKey}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <AdminShell section="ficha">
        <section className="empty-state">
          <p>Carregando ficha da unidade...</p>
        </section>
      </AdminShell>
    );
  }

  return (
    <AdminShell section="ficha">
      <AdminTopbar
        eyebrow="FICHA DA UNIDADE"
        title={unit?.nome_fantasia || "Unidade"}
        subtitle={unit?.razao_social || "—"}
        userEmail={userEmail}
        onBack={() => router.push("/unidades")}
        backLabel="Voltar para unidades"
        actionsSlot={
          <button className="btn btn-primary" onClick={() => setUnitModalOpen(true)}>
            Editar unidade
          </button>
        }
      />

      <section className="surface section-block">
        <div className="unit-hero-grid">
          <div className="unit-hero-card">
            <span className="unit-hero-label">CNPJ</span>
            <strong>{unit?.cnpj || "—"}</strong>
          </div>
          <div className="unit-hero-card">
            <span className="unit-hero-label">Endereço</span>
            <strong>{unit?.endereco || "—"}</strong>
          </div>
          <div className="unit-hero-card">
            <span className="unit-hero-label">Telefone</span>
            <strong>{unit?.telefone_fixo || "—"}</strong>
          </div>
        </div>
      </section>

      <section className="summary-grid">
        <UnitSummaryCard
          label="Vencidos"
          value={alerts.filter((a) => a.alerta_codigo === "vencido").length}
          tone="danger"
        />
        <UnitSummaryCard
          label="Vencem em breve"
          value={alerts.filter((a) => a.alerta_codigo === "vence_em_7_dias").length}
          tone="warning"
        />
        <UnitSummaryCard
          label="Cadastro incompleto"
          value={alerts.filter((a) => a.alerta_codigo === "cadastro_incompleto").length}
          tone="default"
        />
        <UnitSummaryCard
          label="Pendências documentais"
          value={alerts.filter((a) => a.alerta_codigo === "sem_anexo").length}
          tone="primary"
        />
      </section>

      <section className="surface section-block">
        <div className="section-head compact-head">
          <div>
            <span className="eyebrow">SEÇÕES DA FICHA</span>
            <h2 className="section-title">Escolha uma área para revisar</h2>
            <p className="page-subtitle">
              Abra a seção desejada para editar itens, anexos e pendências daquele bloco.
            </p>
          </div>
        </div>

        <div className="section-nav-grid">
          {groupedItems.map(([groupKey, groupItems]) => {
            const stats = buildSectionStats(groupItems);
            return (
              <div className="section-nav-card" key={groupKey}>
                <button
                  type="button"
                  className="section-nav-main"
                  onClick={() => scrollToSection(groupKey)}
                >
                  <span className="section-nav-title">
                    {groupLabels[groupKey] ?? groupKey}
                  </span>
                  <span className="section-nav-subtitle">
                    {stats.totalItems} item(ns)
                  </span>

                  <div className="section-nav-metrics">
                    <span className="mini-chip mini-chip-strong">Alertas: {stats.itemsWithAlerts}</span>
                    <span className="mini-chip">Anexos: {stats.itemsWithAttachments}</span>
                    <span className="mini-chip">Sem anexo: {stats.itemsWithoutAttachments}</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="btn btn-primary section-nav-action section-cta-button"
                  onClick={() => {
                    setSelectedSectionKey(groupKey);
                    setSectionModalOpen(true);
                  }}
                >
                  Abrir seção
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {message ? (
        <div className="message-box" role="alert">
          {message}
        </div>
      ) : null}

      <section className="surface section-block">
        <div className="section-head compact-head">
          <div>
            <span className="eyebrow">PONTOS DE ATENÇÃO</span>
            <h2 className="section-title">Alertas desta unidade</h2>
            <p className="page-subtitle">
              Itens que exigem revisão ou ação.
            </p>
          </div>
        </div>

        {topAlerts.length === 0 ? (
          <p className="muted-text">Nenhum alerta nesta unidade.</p>
        ) : (
          <div className="priority-alert-list">
            {topAlerts.map((alert, index) => (
              <div
                className={`priority-alert priority-${alert.prioridade_alerta}`}
                key={`${alert.tipo_nome}-${alert.alerta_codigo}-${index}`}
              >
                <div className="priority-alert-head">
                  <strong>{alert.tipo_nome}</strong>
                  <span className={`severity-tag severity-${alert.severidade_visual}`}>
                    {alert.severidade_visual}
                  </span>
                </div>
                <p className="priority-alert-title">{alert.alerta_titulo}</p>
                <p className="priority-alert-desc">{alert.alerta_descricao}</p>
                <span className="priority-alert-date">
                  Data de referência: {formatDate(alert.data_referencia_alerta)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {groupedItems.map(([group, groupItems]) => {
        const stats = buildSectionStats(groupItems);

        return (
          <section
            className="surface section-block group-section section-panel"
            key={group}
            id={`section-${group}`}
          >
            <div className="section-panel-head">
              <div>
                <span className="eyebrow">SEÇÃO</span>
                <h2 className="section-title">{groupLabels[group] ?? group}</h2>
                <p className="page-subtitle">
                  {stats.totalItems} item(ns) · {stats.itemsWithAlerts} com alerta · {stats.itemsWithAttachments} com anexo
                </p>
              </div>

              <button
                className="btn btn-primary section-cta-button"
                onClick={() => {
                  setSelectedSectionKey(group);
                  setSectionModalOpen(true);
                }}
              >
                Abrir seção
              </button>
            </div>

            <div className="section-strip">
              <span className="mini-chip mini-chip-strong">
                Itens: {stats.totalItems}
              </span>
              <span className="mini-chip">
                Com alertas: {stats.itemsWithAlerts}
              </span>
              <span className="mini-chip">
                Com anexo: {stats.itemsWithAttachments}
              </span>
              <span className="mini-chip">
                Sem anexo: {stats.itemsWithoutAttachments}
              </span>
            </div>

            <div className="unit-grid">
              {groupItems.map((item) => {
                const itemAlerts = getItemAlerts(item.tipo_nome);
                const rows = rowsForItem(item);
                const itemAttachments = attachmentsByItem[item.item_ficha_id] ?? [];

                return (
                  <article className="unit-card unit-card-sectioned" key={item.tipo_item_id}>
                    <div className="unit-card-head">
                      <div>
                        <h2>{item.tipo_nome}</h2>
                        <p>Status: {item.status_aplicacao}</p>
                      </div>
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => openEditItem(item)}
                        >
                          Editar item
                        </button>

                        <button
                          className="btn btn-primary btn-small section-cta-button"
                          onClick={() =>
                            openAttachments({
                              item_ficha_id: item.item_ficha_id,
                              tipo_nome: item.tipo_nome,
                            })
                          }
                        >
                          Anexos
                        </button>
                      </div>
                    </div>

                    <div className="detail-list">
                      {rows.map((row) => (
                        <span key={`${item.tipo_item_id}-${row.label}`}>
                          <strong>{row.label}:</strong> {row.value}
                        </span>
                      ))}
                    </div>

                    <div className="attachment-preview">
                      <div className="attachment-preview-head">
                        <span className="attachment-count">
                          {itemAttachments.length} anexo(s)
                        </span>
                      </div>

                      {itemAttachments.length === 0 ? (
                        <div className="attachment-inline-list">
                          <span className="attachment-pill muted-pill">
                            Nenhum anexo enviado
                          </span>
                        </div>
                      ) : (
                        <div className="attachment-inline-list">
                          {itemAttachments.slice(0, 2).map((attachment) => (
                            <span className="attachment-pill" key={attachment.id}>
                              {attachment.nome_original}
                            </span>
                          ))}
                          {itemAttachments.length > 2 ? (
                            <span className="attachment-pill muted-pill">
                              +{itemAttachments.length - 2} arquivo(s)
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <div className="alert-badges">
                      {itemAlerts.length > 0 ? (
                        itemAlerts.map((alert, idx) => (
                          <span
                            key={`${alert.alerta_codigo}-${idx}`}
                            className={`badge ${
                              alert.severidade_visual === "alto"
                                ? "badge-danger"
                                : alert.severidade_visual === "medio"
                                ? "badge-warning"
                                : "badge-neutral"
                            }`}
                          >
                            {alert.alerta_titulo}
                          </span>
                        ))
                      ) : (
                        <span className="badge badge-neutral">Sem alertas</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <UnitEditModal
        open={unitModalOpen}
        initialData={
          unit
            ? {
                unidade_id: unit.unidade_id,
                razao_social: unit.razao_social,
                nome_fantasia: unit.nome_fantasia,
                cnpj: unit.cnpj,
                endereco: unit.endereco,
                telefone_fixo: unit.telefone_fixo,
                unidade_observacao: unit.unidade_observacao,
              }
            : null
        }
        onClose={() => setUnitModalOpen(false)}
        onSave={handleUnitSave}
      />

      <ItemEditModal
        open={itemModalOpen}
        item={selectedItem}
        onClose={() => setItemModalOpen(false)}
        onSave={handleItemSave}
      />

      <ItemAttachmentsModal
        open={attachmentsModalOpen}
        itemName={selectedAttachmentItem?.tipo_nome || "Item"}
        attachments={currentAttachments}
        onClose={() => setAttachmentsModalOpen(false)}
        onUpload={handleAttachmentUpload}
        onOpenAttachment={handleOpenAttachment}
        onDeleteAttachment={handleDeleteAttachment}
      />

      <SectionEditModal
        open={sectionModalOpen}
        title={groupLabels[selectedSectionKey] ?? selectedSectionKey}
        subtitle="Revise os itens desta seção."
        items={selectedSectionItems}
        attachmentsByItem={attachmentsByItem}
        alerts={alerts}
        onClose={() => setSectionModalOpen(false)}
        onEditItem={(item) => {
          setSectionModalOpen(false);
          openEditItem(item);
        }}
        onOpenAttachments={(args) => {
          setSectionModalOpen(false);
          openAttachments(args);
        }}
      />
    </AdminShell>
  );
}

