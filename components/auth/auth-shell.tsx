import { CSSProperties, ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  styleVars?: CSSProperties;
};

export function AuthShell({ children, styleVars }: AuthShellProps) {
  return (
    <main className="app-frame auth-theme-scope" style={styleVars}>
      <section className="auth-layout">{children}</section>
    </main>
  );
}
