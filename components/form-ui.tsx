import type { ReactNode } from "react";

export const inputClass =
  "mt-1.5 block w-full rounded-md border border-linie bg-white px-3.5 py-2.5 text-base text-cerneala placeholder:text-cerneala-2/60 focus:border-lentila focus:outline-none focus:ring-2 focus:ring-lentila/25 aria-[invalid=true]:border-red-600";

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="font-bold">
        {label}
      </label>
      {hint && <span className="ml-2 text-sm text-cerneala-2">{hint}</span>}
      {children}
      {error && (
        <p id={`${name}-eroare`} className="mt-1 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export type FormState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string; errors?: Record<string, string> };

/** Atributele unui câmp plus eroarea lui, din răspunsul serverului. */
export function fieldProps(state: FormState, name: string) {
  const error = state.status === "error" ? state.errors?.[name] : undefined;
  return {
    error,
    input: {
      id: name,
      name,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${name}-eroare` : undefined,
    },
  };
}

export async function postForm(url: string, form: HTMLFormElement): Promise<FormState> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await res.json();
    return res.ok
      ? { status: "ok", message: data.message }
      : { status: "error", message: data.message, errors: data.errors };
  } catch {
    return {
      status: "error",
      message: "Nu am putut trimite formularul. Verifică conexiunea la internet și încearcă din nou.",
    };
  }
}
