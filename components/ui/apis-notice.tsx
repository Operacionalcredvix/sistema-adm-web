import { ReactNode } from "react";

type ApisNoticeProps = {
  children: ReactNode;
  role?: "status" | "alert";
};

export function ApisNotice({ children, role = "status" }: ApisNoticeProps) {
  return <div className="apis-notice" role={role}>{children}</div>;
}
