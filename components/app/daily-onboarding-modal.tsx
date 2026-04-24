"use client";

import { SimpleModal } from "@/components/ui/simple-modal";

type DailyOnboardingModalProps = {
  open: boolean;
  onClose: () => void;
};

const priorityItems = [
  {
    number: "01",
    title: "Aluguel primeiro",
    description: "Confira se a unidade tem dados de aluguel preenchidos quando o aluguel se aplica.",
  },
  {
    number: "02",
    title: "Vencimento e pagamento",
    description: "Preencha dia de vencimento e último pagamento. Esses dados alimentam os alertas.",
  },
  {
    number: "03",
    title: "Anexos essenciais",
    description: "Inclua documentos importantes quando existirem. Sem anexo é pendência de cadastro.",
  },
  {
    number: "04",
    title: "Alertas operacionais",
    description: "Use a aba Alertas para acompanhar vencidos e vencimentos próximos.",
  },
];

export function DailyOnboardingModal({ open, onClose }: DailyOnboardingModalProps) {
  return (
    <SimpleModal
      open={open}
      title="Bem-vindo ao Sistema APIS"
      subtitle="Orientação do dia"
      onClose={onClose}
    >
      <div className="daily-onboarding">
        <section className="onboarding-hero">
          <div className="onboarding-hero-copy">
            <span className="onboarding-kicker">ORIENTAÇÃO DO DIA</span>
            <h2>Atualizar fichas antes de confiar nos alertas.</h2>
            <p>
              Os alertas só ficam úteis quando os cadastros principais estão preenchidos.
              A prioridade inicial é alimentar os dados que geram vencimentos reais.
            </p>
          </div>

          <div className="onboarding-focus-card">
            <span>Prioridade central</span>
            <strong>Aluguéis e vencimentos</strong>
            <small>Comece pelos campos que afetam a rotina operacional.</small>
          </div>
        </section>

        <section className="onboarding-priority-grid" aria-label="Prioridades de uso">
          {priorityItems.map((item) => (
            <article className="onboarding-priority-card" key={item.number}>
              <span className="onboarding-priority-number">{item.number}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="onboarding-note">
          <div>
            <span className="onboarding-note-label">Importante</span>
            <p>
              Pendências de cadastro ajudam no saneamento da base. Elas não significam,
              sozinhas, uma urgência operacional.
            </p>
          </div>
        </section>

        <div className="onboarding-actions">
          <p>Este aviso aparecerá novamente amanhã.</p>
          <button className="btn btn-primary cta-primary-button" type="button" onClick={onClose}>
            Entendi, continuar
          </button>
        </div>
      </div>
    </SimpleModal>
  );
}
