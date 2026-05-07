import { ReactNode } from "react";

type ApisPanelProps = {
  children: ReactNode;
  className?: string;
};

export function ApisPanel({ children, className = "" }: ApisPanelProps) {
  return <section className={`apis-panel ${className}`.trim()}>{children}</section>;
}
