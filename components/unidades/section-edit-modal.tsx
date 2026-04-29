"use client";

import { SimpleModal } from "@/components/ui/simple-modal";
import { AttachmentRecord } from "@/components/unidades/item-attachments-modal";
import { EditableItem } from "@/components/unidades/item-edit-modal";

type SectionFichaItem = {
  item_ficha_id: string;
  tipo_item_id: string;
  tipo_nome: string;
  status_aplicacao: string;
  total_anexos: number | null;
  tipo_codigo: string;
  dia_vencimento: number | null;
  data_principal: string | null;
  data_secundaria: string | null;
  valor_principal: number | null;
  numero_principal: number | null;
  texto_principal: string | null;
  texto_secundario: string | null;
  identificador_externo: string | null;
  onde_achar: string | null;
  login_acesso: string | null;
  senha_acesso: string | null;
  item_observacao: string | null;
};

type SectionAlert = {
  tipo_nome: string;
  alerta_codigo?: string;
  alerta_titulo: string;
  severidade_visual: "alto" | "medio" | "baixo";
};

type SectionEditModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  items: SectionFichaItem[];
  attachmentsByItem: Record<string, AttachmentRecord[]>;
  alerts: SectionAlert[];
  onClose: () => void;
  onEditItem: (item: EditableItem) => void;
  onOpenAttachments: (args: { item_ficha_id: string; tipo_nome: string }) => void;
};

const statusLabels: Record<string, string> = {
  sim: "Aplicável",
  nao: "Não se aplica",
  nao_informado: "Não informado",
};

const getStatusLabel = (status: string) => statusLabels[status] ?? status;

export function SectionEditModal({
  open,
  title,
  subtitle,
  items,
  attachmentsByItem,
  alerts,
  onClose,
  onEditItem,
  onOpenAttachments,
}: SectionEditModalProps) {
  const getAlertsForItem = (tipoNome: string) =>
    alerts.filter((alert) => alert.tipo_nome === tipoNome);

  const getItemAttachmentCount = (item: SectionFichaItem) =>
    (attachmentsByItem[item.item_ficha_id] ?? []).length;

  const itemNeedsAction = (item: SectionFichaItem) => {
    const itemAlerts = getAlertsForItem(item.tipo_nome);

    return (
      itemAlerts.length > 0 ||
      item.status_aplicacao === "nao_informado" ||
      getItemAttachmentCount(item) === 0
    );
  };

  const getItemWorkScore = (item: SectionFichaItem) => {
    const itemAlerts = getAlertsForItem(item.tipo_nome);

    if (itemAlerts.some((alert) => alert.alerta_codigo === "vencido")) return 10;
    if (itemAlerts.some((alert) => alert.alerta_codigo === "vence_em_7_dias")) return 20;
    if (itemAlerts.some((alert) => alert.alerta_codigo === "cadastro_incompleto")) return 30;
    if (itemAlerts.some((alert) => alert.alerta_codigo === "sem_anexo")) return 40;
    if (item.status_aplicacao === "nao_informado") return 50;
    if (getItemAttachmentCount(item) === 0) return 60;

    return 90;
  };

  const sortedItems = [...items].sort((a, b) => {
    const scoreDiff = getItemWorkScore(a) - getItemWorkScore(b);
    if (scoreDiff !== 0) return scoreDiff;

    return a.tipo_nome.localeCompare(b.tipo_nome);
  });

  const itemsNeedingAction = items.filter((item) => itemNeedsAction(item)).length;
  const itemsWithAlerts = items.filter((item) => getAlertsForItem(item.tipo_nome).length > 0).length;
  const itemsWithAttachments = items.filter((item) => getItemAttachmentCount(item) > 0).length;

  return (
    <SimpleModal
      open={open}
      title={`Seção: ${title}`}
      subtitle={subtitle}
      onClose={onClose}
    >
      <div className="section-manager-stack">
        <div className="section-manager-summary">
          <div className="section-manager-stat">
            <span>Itens</span>
            <strong>{items.length}</strong>
          </div>
          <div className="section-manager-stat">
            <span>Precisam de ação</span>
            <strong>{itemsNeedingAction}</strong>
          </div>
          <div className="section-manager-stat">
            <span>Com alertas</span>
            <strong>{itemsWithAlerts}</strong>
          </div>
          <div className="section-manager-stat">
            <span>Com anexos</span>
            <strong>{itemsWithAttachments}</strong>
          </div>
        </div>

        <div className="section-manager-list">
          {sortedItems.map((item) => {
            const itemAlerts = getAlertsForItem(item.tipo_nome);
            const itemAttachments = attachmentsByItem[item.item_ficha_id] ?? [];
            const needsAction = itemNeedsAction(item);

            return (
              <article className="section-manager-row" key={item.tipo_item_id}>
                <div className="section-manager-main">
                  <div className="section-manager-head">
                    <strong>{item.tipo_nome}</strong>
                    <span className="section-status-chip">
                      {getStatusLabel(item.status_aplicacao)}
                    </span>
                  </div>

                  <div className="section-manager-badges">
                    {needsAction ? (
                      <span className="mini-chip mini-chip-strong">Precisa de ação</span>
                    ) : (
                      <span className="mini-chip">Em ordem</span>
                    )}
                    <span className="mini-chip">{itemAlerts.length} alerta(s)</span>
                    <span className="mini-chip">{itemAttachments.length} anexo(s)</span>
                  </div>

                  <div className="section-manager-alerts">
                    {itemAlerts.length > 0 ? (
                      itemAlerts.slice(0, 3).map((alert, index) => (
                        <span
                          key={`${item.item_ficha_id}-${alert.alerta_titulo}-${index}`}
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
                </div>

                <div className="section-manager-actions">
                  <button
                    className="btn btn-secondary btn-small"
                    type="button"
                    onClick={() =>
                      onEditItem({
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
                        onde_achar: item.onde_achar,
                        login_acesso: item.login_acesso,
                        senha_acesso: item.senha_acesso,
                        item_observacao: item.item_observacao,
                      })
                    }
                  >
                    Editar item
                  </button>

                  <button
                    className="btn btn-primary btn-small section-cta-button"
                    type="button"
                    onClick={() =>
                      onOpenAttachments({
                        item_ficha_id: item.item_ficha_id,
                        tipo_nome: item.tipo_nome,
                      })
                    }
                  >
                    Anexos
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SimpleModal>
  );
}
