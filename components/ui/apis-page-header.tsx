type ApisPageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function ApisPageHeader({ eyebrow, title, subtitle }: ApisPageHeaderProps) {
  return (
    <div className="apis-page-header">
      {eyebrow ? <span className="apis-page-header__eyebrow">{eyebrow}</span> : null}
      <h1 className="apis-page-header__title">{title}</h1>
      {subtitle ? <p className="apis-page-header__subtitle">{subtitle}</p> : null}
    </div>
  );
}
