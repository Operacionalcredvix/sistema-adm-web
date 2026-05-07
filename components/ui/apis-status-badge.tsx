import { ReactNode } from "react";

type ApisStatusBadgeProps = {
  children: ReactNode;
  tone?: "default" | "primary" | "warning" | "danger";
};

export function ApisStatusBadge({ children, tone = "default" }: ApisStatusBadgeProps) {
  return (
    <span className="apis-status-badge" data-tone={tone}>
      {children}
    </span>
  );
}
