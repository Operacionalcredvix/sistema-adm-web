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
  item_observacao: string | null;
};

type SectionAlert = {
  tipo_nome: string;
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
            <span>Com alertas</span>
            <strong>
              {items.filter((item) => getAlertsForItem(item.tipo_nome).length > 0).length}
            </strong>
          </div>
          <div className="section-manager-stat">
            <span>Com anexos</span>
            <strong>
              {items.filter((item) => (attachmentsByItem[item.item_ficha_id] ?? []).length > 0).length}
            </strong>
          </div>
        </div>

        <div className="section-manager-list">
          {items.map((item) => {
            const itemAlerts = getAlertsForItem(item.tipo_nome);
            const itemAttachments = attachmentsByItem[item.item_ficha_id] ?? [];

            return (
              <article className="section-manager-row" key={item.tipo_item_id}>
                <div className="section-manager-main">
                  <div className="section-manager-head">
                    <strong>{item.tipo_nome}</strong>
                    <span className="section-status-chip">{item.status_aplicacao}</span>
                  </div>

                  <div className="section-manager-badges">
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
