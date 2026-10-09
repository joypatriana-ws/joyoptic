"use client";

import { useCallback, useState } from "react";
import { rowClasses, sectionClasses } from "@/lib/theme-classes.mjs";
import { bookingTypes, doctors, hoursFor, phonePattern } from "@/lib/site";
import { sectionId } from "@/lib/slugs.mjs";
import { Select } from "@/components/custom-select";
import { DateTimePicker } from "@/components/date-time-picker";
import { SectionTitle } from "./section-title";
import {
  appointmentField,
  formError,
  formLoading,
  formSent,
  validated,
} from "./form-classes";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "sent" } | { kind: "error"; message: string };

const SENT = "Programarea a fost trimisă cu succes! Te vom contacta pentru confirmare.";

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** <section id={sectionId("appointment")} class="appointment section"> din Elements/home_appointment.ctp */
export function Appointment() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [validatedForm, setValidatedForm] = useState(false);
  const [cand, setCand] = useState({ date: "", hour: "" });
  const [bookingType, setBookingType] = useState("");
  const [doctor, setDoctor] = useState("");

  /** Intervalele de program ale zilei; azi, doar cele care n-au trecut (ora României). */
  const slotsFor = useCallback((date: string) => {
    const acum = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Bucharest", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
    return hoursFor(new Date(`${date}T12:00:00`)).filter((h) => !(date === todayIso() && h <= acum));
  }, []);

  /** Intervalele deja ocupate (doar orele, fără date despre pacienți). */
  // fiecare departament are programările lui, deci orele ocupate se cer pentru departamentul ales
  const takenFor = useCallback(
    (date: string) =>
      fetch(`/api/programare/ocupate?data=${date}&tip=${bookingType}`)
        .then((r) => r.json())
        .then((d: { ocupate?: string[] }) => d.ocupate ?? []),
    [bookingType],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: "loading" });

    const phone = form.elements.namedItem("phone") as HTMLInputElement;
    phone.setCustomValidity(phonePattern.test(phone.value.trim()) ? "" : "Număr de telefon invalid");

    if (!form.checkValidity()) {
      setValidatedForm(true);
      setStatus({ kind: "idle" });
      return;
    }

    try {
      const res = await fetch("/api/programare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: "error", message: data.message || "A apărut o eroare. Încearcă din nou." });
        // intervalul a fost luat între timp: golim ora, ca pacientul să aleagă alta (pickerul recitește orele ocupate)
        if (res.status === 409) setCand((c) => ({ ...c, hour: "" }));
        return;
      }
      setStatus({ kind: "sent" });
      form.reset();
      setCand({ date: "", hour: "" });
      setBookingType("");
      setDoctor("");
      setValidatedForm(false);
      setTimeout(() => setStatus((s) => (s.kind === "sent" ? { kind: "idle" } : s)), 5000);
    } catch {
      setStatus({ kind: "error", message: "Eroare de conexiune. Încearcă din nou." });
    }
  }

  const field = `${appointmentField} h-11 ${validated}`;
  // select-urile proprii: același stil ca inputurile, iar eroarea vine de la inputul ascuns (peer)
  const select = `${appointmentField} h-11 group-data-validated/form:peer-invalid:border-[#dc3545] group-data-validated/form:peer-valid:border-[#198754]`;

  return (
    <section id={sectionId("appointment")} className={sectionClasses()}>
      <SectionTitle
        title="Programează-te la Joy Optic"
        text="Completează formularul de mai jos și un reprezentant Joy Optic te va contacta pentru confirmare."
      />

      <div className="container-bs" data-aos="fade-up" data-aos-delay="100">
        <form
          id="appointment-form"
          noValidate
          onSubmit={onSubmit}
          data-validated={validatedForm || undefined}
          className="group/form w-full"
        >
          <div className={rowClasses()}>
            <div className="pb-2 md:w-1/3">
              <input name="name" type="text" placeholder="Numele complet" required className={field} />
            </div>
            <div className="mt-4 pb-2 md:mt-0 md:w-1/3">
              <input name="email" type="email" placeholder="Adresa de email" required className={field} />
            </div>
            <div className="mt-4 pb-2 md:mt-0 md:w-1/3">
              <input
                name="phone"
                type="tel"
                placeholder="Numărul de telefon"
                required
                pattern="^(07[1-9]\d{7}|02\d{7}|03\d{7})"
                onInput={(e) => e.currentTarget.setCustomValidity("")}
                className={field}
              />
            </div>
          </div>

          <div className={rowClasses()}>

            <div className="mt-4 pb-2 md:w-1/3">
              <Select
                name="bookingType"
                required
                value={bookingType}
                onChange={(v) => {
                  setBookingType(v);
                  // ora aleasă era liberă în alt departament: se alege din nou
                  if (v !== bookingType) setCand((c) => ({ ...c, hour: "" }));
                }}
                placeholder="Selectează departamentul"
                options={bookingTypes.map((t) => ({ value: String(t.id), label: t.title }))}
                buttonClassName={select}
              />
            </div>
            <div className="mt-4 pb-2 md:w-1/3">
              {/* data și ora într-un singur câmp (în locul bootstrap-datepicker + select-ul de oră);
                  orele libere depind de departament, deci se alege după el */}
              <DateTimePicker
                required
                value={cand}
                onChange={setCand}
                slotsFor={slotsFor}
                takenFor={takenFor}
                disabled={!bookingType}
                disabledText="Alege întâi departamentul"
                buttonClassName={select}
              />
            </div>

            <div className="mt-4 pb-2 md:w-1/3">
              <Select
                name="doctor"
                value={doctor}
                onChange={setDoctor}
                placeholder="Selectează medicul"
                options={[{ value: "", label: "Selectează medicul" }, ...doctors.map((d) => ({ value: d.name, label: `${d.name} - ${d.specialization}` }))]}
                buttonClassName={select}
              />
            </div>

            <div className="mt-4 pb-2">
              <textarea name="message" placeholder="Mesaj (Opțional)" rows={5} className={`${appointmentField} ${validated}`} />
            </div>
          </div>

          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          <div className="mt-4" aria-live="polite">
            {status.kind === "loading" && <div className={formLoading}>Se procesează...</div>}
            {status.kind === "error" && <div className={formError}>{status.message}</div>}
            {status.kind === "sent" && <div className={formSent}>{SENT}</div>}
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={status.kind === "loading"}
              className="inline-block rounded-[50px] border-0 bg-accent px-[35px] py-2.5 text-[16px] leading-normal text-white transition duration-400 hover:bg-[color-mix(in_srgb,var(--color-accent)_90%,white_15%)] disabled:opacity-65"
            >
              Programează-te
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
