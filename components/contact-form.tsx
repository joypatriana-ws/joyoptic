"use client";

import { useState } from "react";
import { contactSubjects } from "@/lib/site";
import { Field, fieldProps, inputClass, postForm, type FormState } from "./form-ui";

export function ContactForm({ className = "" }: { className?: string }) {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const f = (name: string) => fieldProps(state, name);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ status: "sending" });
    const result = await postForm("/api/contact", form);
    setState(result);
    if (result.status === "ok") form.reset();
  }

  if (state.status === "ok") {
    return (
      <div role="status" className={`rounded-lg border border-lentila/30 bg-white p-6 ${className}`}>
        <p className="text-xl font-bold">Mesajul a fost trimis</p>
        <p className="mt-2">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`grid gap-5 sm:grid-cols-2 ${className}`}>
      <Field label="Nume" name="name" error={f("name").error}>
        <input {...f("name").input} required autoComplete="name" className={inputClass} />
      </Field>
      <Field label="Telefon" name="phone" hint="opțional" error={f("phone").error}>
        <input {...f("phone").input} type="tel" autoComplete="tel" className={inputClass} />
      </Field>
      <Field label="Email" name="email" error={f("email").error}>
        <input {...f("email").input} type="email" required autoComplete="email" className={inputClass} />
      </Field>
      <Field label="Subiect" name="subject" error={f("subject").error}>
        <select {...f("subject").input} className={inputClass} defaultValue={contactSubjects[0]}>
          {contactSubjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field label="Mesaj" name="body" error={f("body").error} className="sm:col-span-2">
        <textarea {...f("body").input} required rows={5} className={inputClass} />
      </Field>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="sm:col-span-2">
        {state.status === "error" && (
          <p role="alert" className="mb-4 font-semibold text-red-700">
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={state.status === "sending"}
          className="rounded-md bg-cerneala px-6 py-3 font-bold text-white hover:bg-cerneala/90 disabled:opacity-60"
        >
          {state.status === "sending" ? "Se trimite mesajul…" : "Trimite mesajul"}
        </button>
      </div>
    </form>
  );
}
