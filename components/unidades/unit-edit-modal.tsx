"use client";

import { useEffect, useState } from "react";
import { SimpleModal } from "@/components/ui/simple-modal";

type UnitEditModalProps = {
  open: boolean;
  initialData: {
    unidade_id: string;
    razao_social: string | null;
    nome_fantasia: string | null;
    cnpj: string | null;
    endereco: string | null;
    telefone_fixo: string | null;
    unidade_observacao: string | null;
  } | null;
  onClose: () => void;
  onSave: (payload: {
    unidade_id: string;
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    endereco: string;
    telefone_fixo: string;
    observacao: string;
  }) => Promise<void>;
};

export function UnitEditModal({
  open,
  initialData,
  onClose,
  onSave,
}: UnitEditModalProps) {
  const [form, setForm] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    endereco: "",
    telefone_fixo: "",
    observacao: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!initialData) return;

    setForm({
      razao_social: initialData.razao_social ?? "",
      nome_fantasia: initialData.nome_fantasia ?? "",
      cnpj: initialData.cnpj ?? "",
      endereco: initialData.endereco ?? "",
      telefone_fixo: initialData.telefone_fixo ?? "",
      observacao: initialData.unidade_observacao ?? "",
    });
    setMessage("");
  }, [initialData]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!initialData) return;

    if (!form.razao_social.trim() || !form.nome_fantasia.trim() || !form.cnpj.trim()) {
      setMessage("Razão social, nome fantasia e CNPJ são obrigatórios.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await onSave({
        unidade_id: initialData.unidade_id,
        razao_social: form.razao_social.trim(),
        nome_fantasia: form.nome_fantasia.trim(),
        cnpj: form.cnpj.trim(),
        endereco: form.endereco.trim(),
        telefone_fixo: form.telefone_fixo.trim(),
        observacao: form.observacao.trim(),
      });
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao salvar unidade.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleModal
      open={open}
      title="Editar unidade"
      subtitle="Atualize os dados básicos da unidade."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-scroll-area">
          <div className="field">
            <label htmlFor="razao_social">Razão social</label>
            <input
              id="razao_social"
              value={form.razao_social}
              onChange={(e) => handleChange("razao_social", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="nome_fantasia">Nome fantasia</label>
            <input
              id="nome_fantasia"
              value={form.nome_fantasia}
              onChange={(e) => handleChange("nome_fantasia", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="cnpj">CNPJ</label>
            <input
              id="cnpj"
              value={form.cnpj}
              onChange={(e) => handleChange("cnpj", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="endereco">Endereço</label>
            <input
              id="endereco"
              value={form.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="telefone_fixo">Telefone fixo</label>
            <input
              id="telefone_fixo"
              value={form.telefone_fixo}
              onChange={(e) => handleChange("telefone_fixo", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="observacao">Observação</label>
            <textarea
              id="observacao"
              value={form.observacao}
              onChange={(e) => handleChange("observacao", e.target.value)}
            />
          </div>

          {message ? <div className="message-box">{message}</div> : null}
        </div>

        <div className="modal-actions sticky-modal-actions">
          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary cta-primary-button" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar unidade"}
          </button>
        </div>
      </form>
    </SimpleModal>
  );
}
