"use client";

import { useEffect, useState } from "react";
import { SimpleModal } from "@/components/ui/simple-modal";

export type AttachmentRecord = {
  id: string;
  item_ficha_id: string;
  nome_original: string;
  caminho_storage: string;
  tipo_arquivo: string | null;
  tamanho_bytes: number | null;
  enviado_em: string;
  ativo: boolean;
};

type ItemAttachmentsModalProps = {
  open: boolean;
  itemName: string;
  attachments: AttachmentRecord[];
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onOpenAttachment: (attachment: AttachmentRecord) => Promise<void>;
  onDeleteAttachment: (attachment: AttachmentRecord) => Promise<void>;
};

export function ItemAttachmentsModal({
  open,
  itemName,
  attachments,
  onClose,
  onUpload,
  onOpenAttachment,
  onDeleteAttachment,
}: ItemAttachmentsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedFile(null);
    setMessage("");
    setDeletingId("");
  }, [open]);

  const formatBytes = (value: number | null) => {
    if (!value) return "Tamanho não informado";
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString("pt-BR");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setMessage("Selecione um arquivo antes de enviar.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setMessage("Anexo enviado com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao enviar anexo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attachment: AttachmentRecord) => {
    const confirmed = window.confirm(
      `Excluir o anexo "${attachment.nome_original}"?`
    );

    if (!confirmed) return;

    setDeletingId(attachment.id);
    setMessage("");

    try {
      await onDeleteAttachment(attachment);
      setMessage("Anexo excluído com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao excluir anexo.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <SimpleModal
      open={open}
      title={`Anexos do item: ${itemName}`}
      subtitle="Envie um arquivo e acompanhe os anexos já vinculados a este item."
      onClose={onClose}
    >
      <div className="attachment-modal-stack">
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="attachment-upload-box">
            <div className="field">
              <label htmlFor="attachment_file">Arquivo</label>
              <input
                id="attachment_file"
                className="file-input"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary cta-primary-button" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar anexo"}
              </button>
            </div>
          </div>
        </form>

        {message ? <div className="message-box">{message}</div> : null}

        <div className="attachment-list">
          <div className="section-head compact-head">
            <div>
              <span className="eyebrow">ARQUIVOS</span>
              <h2 className="section-title">Anexos enviados</h2>
            </div>
          </div>

          {attachments.length === 0 ? (
            <div className="attachment-empty">
              <p>Nenhum anexo enviado para este item.</p>
            </div>
          ) : (
            attachments.map((attachment) => (
              <article className="attachment-row" key={attachment.id}>
                <div className="attachment-meta">
                  <strong>{attachment.nome_original}</strong>
                  <span>{attachment.tipo_arquivo || "Tipo não informado"}</span>
                  <span>{formatBytes(attachment.tamanho_bytes)}</span>
                  <span>Enviado em {formatDateTime(attachment.enviado_em)}</span>
                </div>

                <div className="attachment-row-actions">
                  <button
                    className="btn btn-secondary btn-small"
                    type="button"
                    onClick={() => onOpenAttachment(attachment)}
                  >
                    Abrir
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    type="button"
                    disabled={deletingId === attachment.id}
                    onClick={() => handleDelete(attachment)}
                  >
                    {deletingId === attachment.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </SimpleModal>
  );
}
