"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmare reutilizabil — înlocuiește native window.confirm().
 * Pattern existent în proiect: createPortal + click outside / ESC closes.
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmă",
  cancelLabel = "Renunță",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  if (!open || typeof document === "undefined") return null;

  const accentClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-amber-500 hover:bg-amber-600 text-white";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                variant === "danger" ? "bg-red-100" : "bg-amber-100"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${variant === "danger" ? "text-red-600" : "text-amber-600"}`}
              />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-base font-semibold text-stone-900">{title}</h3>
              {message && (
                <div className="mt-2 text-sm leading-relaxed text-stone-600">
                  {typeof message === "string" ? <p>{message}</p> : message}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${accentClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
