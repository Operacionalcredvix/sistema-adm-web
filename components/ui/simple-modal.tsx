"use client";

import { ReactNode } from "react";

type SimpleModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function SimpleModal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: SimpleModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          <button className="btn btn-secondary btn-icon" onClick={onClose} type="button">
            Fechar
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
