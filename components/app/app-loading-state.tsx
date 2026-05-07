"use client";

type AppLoadingStateProps = {
  title?: string;
  subtitle?: string;
  rows?: number;
};

export function AppLoadingState({
  title = "Preparando tela",
  subtitle = "Carregando informações atualizadas...",
  rows = 3,
}: AppLoadingStateProps) {
  return (
    <section className="surface section-block app-loading-state" aria-busy="true">
      <div className="app-loading-head">
        <span className="loading-orb" aria-hidden="true" />
        <div>
          <span className="eyebrow">CARREGANDO</span>
          <h2 className="section-title">{title}</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="loading-summary-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <span className="loading-card" key={index} />
        ))}
      </div>

      <div className="loading-lines">
        {Array.from({ length: rows }).map((_, index) => (
          <span className="loading-line" key={index} />
        ))}
      </div>
    </section>
  );
}
