"use client";

import { useEffect, useMemo, useState } from "react";
import { SimpleModal } from "@/components/ui/simple-modal";

export type EditableItem = {
  item_ficha_id: string;
  tipo_nome: string;
  tipo_codigo: string;
  status_aplicacao: string;
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

type ItemEditModalProps = {
  open: boolean;
  item: EditableItem | null;
  onClose: () => void;
  onSave: (payload: {
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
    onde_achar: string | null;
    login_acesso: string | null;
    senha_acesso: string | null;
    observacao: string | null;
  }) => Promise<void>;
};

type FormState = {
  status_aplicacao: string;
  dia_vencimento: string;
  data_principal: string;
  data_secundaria: string;
  valor_principal: string;
  numero_principal: string;
  texto_principal: string;
  texto_secundario: string;
  identificador_externo: string;
  onde_achar: string;
  login_acesso: string;
  senha_acesso: string;
  observacao: string;
};

export function ItemEditModal({
  open,
  item,
  onClose,
  onSave,
}: ItemEditModalProps) {
  const [form, setForm] = useState<FormState>({
    status_aplicacao: "sim",
    dia_vencimento: "",
    data_principal: "",
    data_secundaria: "",
    valor_principal: "",
    numero_principal: "",
    texto_principal: "",
    texto_secundario: "",
    identificador_externo: "",
    onde_achar: "",
    login_acesso: "",
    senha_acesso: "",
    observacao: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!item) return;

    setForm({
      status_aplicacao: item.status_aplicacao ?? "sim",
      dia_vencimento: item.dia_vencimento?.toString() ?? "",
      data_principal: item.data_principal ?? "",
      data_secundaria: item.data_secundaria ?? "",
      valor_principal: item.valor_principal?.toString() ?? "",
      numero_principal: item.numero_principal?.toString() ?? "",
      texto_principal: item.texto_principal ?? "",
      texto_secundario: item.texto_secundario ?? "",
      identificador_externo: item.identificador_externo ?? "",
      onde_achar: item.onde_achar ?? "",
      login_acesso: item.login_acesso ?? "",
      senha_acesso: item.senha_acesso ?? "",
      observacao: item.item_observacao ?? "",
    });
    setMessage("");
  }, [item]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const fieldMap = useMemo(() => {
    switch (item?.tipo_codigo) {
      case "aluguel":
        return [
          ["status_aplicacao", "Status"],
          ["dia_vencimento", "Dia do vencimento"],
          ["data_principal", "Último pagamento"],
          ["valor_principal", "Valor atual"],
          ["texto_principal", "Nome do proprietário"],
          ["texto_secundario", "Contato"],
          ["observacao", "Observação"],
        ] as const;
      case "condominio":
      case "agua":
      case "energia":
      case "internet":
      case "telefonia_fixa":
        return [
          ["status_aplicacao", "Status"],
          ["dia_vencimento", "Dia do vencimento"],
          ["data_principal", "Último pagamento"],
          ["identificador_externo", "Identificador da conta"],
          ["onde_achar", "Onde achar"],
          ["login_acesso", "Login"],
          ["senha_acesso", "Senha"],
          ["observacao", "Observação"],
        ] as const;
      case "extintores":
        return [
          ["status_aplicacao", "Status"],
          ["numero_principal", "Quantidade"],
          ["data_secundaria", "Vencimento"],
          ["texto_principal", "Fornecedor"],
          ["texto_secundario", "Contato do fornecedor"],
          ["observacao", "Observação"],
        ] as const;
      case "dedetizacao":
        return [
          ["status_aplicacao", "Status"],
          ["data_principal", "Data da última"],
          ["data_secundaria", "Data da próxima"],
          ["observacao", "Observação"],
        ] as const;
      case "alvara_funcionamento":
      case "alvara_bombeiros":
      case "iptu":
      case "seguro_predial":
        return [
          ["status_aplicacao", "Status"],
          ["data_secundaria", "Data de vencimento"],
          ["observacao", "Observação"],
        ] as const;
      case "contrato_franquia":
      case "cnpj":
      default:
        return [
          ["status_aplicacao", "Status"],
          ["texto_principal", "Texto principal"],
          ["texto_secundario", "Texto secundário"],
          ["identificador_externo", "Identificador"],
          ["observacao", "Observação"],
        ] as const;
    }
  }, [item?.tipo_codigo]);

  const renderField = (field: keyof FormState, label: string) => {
    if (field === "status_aplicacao") {
      return (
        <div className="field" key={field}>
          <label htmlFor={field}>{label}</label>
          <select
            id={field}
            value={form.status_aplicacao}
            onChange={(e) => setField(field, e.target.value)}
          >
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
            <option value="nao_informado">Não informado</option>
          </select>
        </div>
      );
    }

    if (field === "observacao") {
      return (
        <div className="field field-full" key={field}>
          <label htmlFor={field}>{label}</label>
          <textarea
            id={field}
            value={form.observacao}
            onChange={(e) => setField(field, e.target.value)}
          />
        </div>
      );
    }

    const inputType =
      field === "valor_principal" || field === "numero_principal" || field === "dia_vencimento"
        ? "number"
        : field === "data_principal" || field === "data_secundaria"
        ? "date"
        : field === "senha_acesso"
        ? "password"
        : "text";

    return (
      <div className="field" key={field}>
        <label htmlFor={field}>{label}</label>
        <input
          id={field}
          type={inputType}
          value={form[field]}
          onChange={(e) => setField(field, e.target.value)}
        />
      </div>
    );
  };

  const parseNumber = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const parseText = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!item) return;

    setLoading(true);
    setMessage("");

    try {
      await onSave({
        item_ficha_id: item.item_ficha_id,
        status_aplicacao: form.status_aplicacao,
        dia_vencimento: parseNumber(form.dia_vencimento),
        data_principal: form.data_principal || null,
        data_secundaria: form.data_secundaria || null,
        valor_principal: parseNumber(form.valor_principal),
        numero_principal: parseNumber(form.numero_principal),
        texto_principal: parseText(form.texto_principal),
        texto_secundario: parseText(form.texto_secundario),
        identificador_externo: parseText(form.identificador_externo),
        onde_achar: parseText(form.onde_achar),
        login_acesso: parseText(form.login_acesso),
        senha_acesso: parseText(form.senha_acesso),
        observacao: parseText(form.observacao),
      });
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao salvar item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleModal
      open={open}
      title={item ? `Editar item: ${item.tipo_nome}` : "Editar item"}
      subtitle="Atualize os campos relevantes deste item da ficha."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-scroll-area">
          <div className="modal-grid">
            {fieldMap.map(([field, label]) => renderField(field, label))}
          </div>

          {message ? <div className="message-box">{message}</div> : null}
        </div>

        <div className="modal-actions sticky-modal-actions">
          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary cta-primary-button" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar item"}
          </button>
        </div>
      </form>
    </SimpleModal>
  );
}
