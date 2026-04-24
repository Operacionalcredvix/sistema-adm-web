import Image from "next/image";

type AuthBrandPanelProps = {
  logoSrc: string;
  logoAlt: string;
  caption: string;
  eyebrow: string;
  headline: string;
  description: string;
  featureChips: string[];
};

export function AuthBrandPanel({
  logoSrc,
  logoAlt,
  caption,
  eyebrow,
  headline,
  description,
  featureChips,
}: AuthBrandPanelProps) {
  return (
    <div className="auth-panel auth-copy-panel">
      <div className="brand-block">
        <div className="brand-mark logo-glow">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={260}
            height={96}
            className="brand-logo"
            priority
          />
        </div>
        <p className="brand-caption">{caption}</p>
      </div>

      <div className="hero-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{headline}</h1>
        <p>{description}</p>
      </div>

      <div className="feature-list">
        {featureChips.map((chip) => (
          <div className="feature-chip" key={chip}>
            {chip}
          </div>
        ))}
      </div>
    </div>
  );
}
