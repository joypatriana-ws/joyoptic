"use client";

import { useMemo, useState } from "react";
import { bookingTypes, doctors, slotsFor } from "@/lib/site";
import { Field, fieldProps, inputClass, postForm, type FormState } from "./form-ui";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function BookingForm() {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [date, setDate] = useState("");

  const today = useMemo(() => iso(new Date()), []);
  const slots = useMemo(() => {
    if (!date) return [];
    const d = new Date(`${date}T12:00:00`);
    const all = slotsFor(d);
    // azi: doar orele care n-au trecut
    if (date !== today) return all;
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return all.filter((s) => s > hhmm);
  }, [date, today]);

  const f = (name: string) => fieldProps(state, name);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ status: "sending" });
    const result = await postForm("/api/programare", form);
    setState(result);
    if (result.status === "ok") {
      form.reset();
      setDate("");
    }
  }

  if (state.status === "ok") {
    return (
      <div role="status" className="self-start rounded-lg border border-lentila/30 bg-white p-8">
        <p className="text-2xl font-bold">Programarea a fost trimisă</p>
        <p className="mt-3 text-lg">{state.message}</p>
        <button
          type="button"
          onClick={() => setState({ status: "idle" })}
          className="mt-6 font-bold text-lentila underline underline-offset-4"
        >
          Fă încă o programare
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 rounded-lg bg-white p-6 sm:grid-cols-2 sm:p-8">
      <Field label="Ziua" name="date" error={f("date").error}>
        <input
          {...f("date").input}
          type="date"
          required
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Ora" name="hour" error={f("hour").error}>
        <select {...f("hour").input} required disabled={!slots.length} className={inputClass} defaultValue="">
          <option value="" disabled>
            {!date ? "Alege întâi ziua" : slots.length ? "Alege ora" : "Închis în ziua aleasă"}
          </option>
          {slots.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>

      <Field label="Tipul consultației" name="bookingType" error={f("bookingType").error}>
        <select {...f("bookingType").input} required className={inputClass} defaultValue="1">
          {bookingTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Medicul" name="doctor" hint="opțional" error={f("doctor").error}>
        <select {...f("doctor").input} className={inputClass} defaultValue="">
          <option value="">Oricare medic disponibil</option>
          {doctors.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Nume și prenume" name="name" error={f("name").error} className="sm:col-span-2">
        <input {...f("name").input} required autoComplete="name" className={inputClass} />
      </Field>

      <Field label="Telefon" name="phone" error={f("phone").error}>
        <input {...f("phone").input} type="tel" required autoComplete="tel" placeholder="07xx xxx xxx" className={inputClass} />
      </Field>

      <Field label="Email" name="email" error={f("email").error}>
        <input {...f("email").input} type="email" required autoComplete="email" className={inputClass} />
      </Field>

      {/* capcană pentru boți: oamenii nu văd câmpul */}
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
          className="w-full rounded-md bg-lentila px-6 py-3.5 text-lg font-bold text-white hover:bg-lentila-2 disabled:opacity-60 sm:w-auto"
        >
          {state.status === "sending" ? "Se trimite programarea…" : "Trimite programarea"}
        </button>
      </div>
    </form>
  );
}
