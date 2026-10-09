"use client";

// Select-uri proprii în locul celor native ale browserului.
// Valoarea ajunge în formular printr-un <input> ascuns vizual, dar validat (required) ca orice câmp:
// așa merg și FormData, și checkValidity(), și stilul de eroare (peer-invalid).

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type Option = { value: string; label: string };

/** Închide popover-ul la click în afara lui sau la Escape. */
function useClose(open: boolean, close: () => void) {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);
  return wrap;
}

const chevron = (
  <svg width="16" height="12" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0 text-[#343a40]">
    <path d="m2 5 6 6 6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

/** Inputul care poartă valoarea în formular (vizual ascuns, dar validat). */
function HiddenValue({ name, value, required, onInvalid }: { name: string; value: string; required?: boolean; onInvalid?: () => void }) {
  return (
    <input
      tabIndex={-1}
      aria-hidden="true"
      name={name}
      value={value}
      required={required}
      onChange={() => {}}
      onInvalid={onInvalid}
      className="peer pointer-events-none absolute bottom-0 left-1/2 h-px w-px opacity-0"
    />
  );
}

export function Select({
  name,
  options,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  buttonClassName,
  className = "",
}: {
  name: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  /** stilul câmpului (aceleași clase ca inputurile din formularul respectiv) */
  buttonClassName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const wrap = useClose(open, () => setOpen(false));
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  function deschide() {
    if (disabled) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function alege(v: string) {
    onChange(v);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        deschide();
      }
      return;
    }
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (options[active]) alege(options[active].value);
    }
    if (e.key === "Tab") setOpen(false);
  }

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <HiddenValue name={name} value={value} required={required} />
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : deschide())}
        onKeyDown={onKeyDown}
        className={`flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
      >
        {/* fără valoare (inclusiv opțiunea goală, ex. „Selectează medicul”) = text de placeholder */}
        <span className={`truncate ${value ? "" : "opacity-60"}`}>{selected?.label ?? placeholder}</span>
        {chevron}
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-30 m-0 max-h-72 w-full min-w-48 list-none overflow-y-auto rounded-md border border-black/10 bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => alege(o.value)}
              className={`cursor-pointer rounded px-3 py-2 text-[14px] leading-snug ${
                o.value === value ? "font-medium text-accent" : "text-body"
              } ${i === active ? "bg-accent/10" : ""}`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Alegerea orei: un rând pe oră, cu minutele grupate pe rândul ei (:00 :15 :30 :45).
 * `slots` = intervalele disponibile („HH:MM"); orele fără niciun interval liber nu apar.
 */
export function TimeSelect({
  name,
  slots,
  value,
  onChange,
  placeholder,
  emptyText,
  required,
  disabled,
  buttonClassName,
  footer,
}: {
  name: string;
  slots: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  emptyText: string;
  required?: boolean;
  disabled?: boolean;
  buttonClassName: string;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const wrap = useClose(open, () => setOpen(false));

  const ore = new Map<string, string[]>();
  for (const s of slots) ore.set(s.slice(0, 2), [...(ore.get(s.slice(0, 2)) ?? []), s.slice(3)]);

  return (
    <div ref={wrap} className="relative">
      <HiddenValue name={name} value={value} required={required} />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className={`flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
      >
        <span className={value ? "" : "opacity-60"}>{value || placeholder}</span>
        {chevron}
      </button>

      {open && (
        <div
          id={listId}
          role="dialog"
          aria-label="Alege ora"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className="absolute left-0 top-[calc(100%+4px)] z-30 max-h-80 w-max min-w-full overflow-y-auto rounded-md border border-black/10 bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {ore.size === 0 ? (
            <div className="px-2 py-3 text-[14px] text-body/60">{emptyText}</div>
          ) : (
            [...ore.entries()].map(([ora, minute]) => (
              <div key={ora} className="flex items-center gap-2 border-b border-black/5 py-1.5 last:border-b-0">
                <span className="w-9 shrink-0 text-right font-heading text-[14px] font-semibold text-heading">{ora}</span>
                <div className="flex gap-1">
                  {minute.map((m) => {
                    const v = `${ora}:${m}`;
                    return (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={v === value}
                        onClick={() => {
                          onChange(v);
                          setOpen(false);
                        }}
                        className={`min-w-11 rounded px-2 py-1 text-[13px] transition-colors ${
                          v === value ? "bg-accent text-white" : "bg-accent/10 text-[#1e7e34] hover:bg-accent hover:text-white"
                        }`}
                      >
                        :{m}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          {footer}
        </div>
      )}
    </div>
  );
}
