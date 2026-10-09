"use client";

import { useEffect, useState } from "react";
import { rowClasses, sectionClasses } from "@/lib/theme-classes.mjs";
import { bookingTypes, doctors, hoursFor, phonePattern } from "@/lib/site";
import { sectionId } from "@/lib/slugs.mjs";
import { SectionTitle } from "./section-title";
import {
  appointmentField,
  formError,
  formLoading,
  formSent,
  selectArrow,
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
  const [date, setDate] = useState("");
  const [dateType, setDateType] = useState<"text" | "date">("text");

  // intervalele deja ocupate în ziua aleasă (fără date despre pacienți), ca să nu mai fie oferite
  const [ocupate, setOcupate] = useState<{ data: string; ore: string[] }>({ data: "", ore: [] });
  const [reincarca, setReincarca] = useState(0);
  useEffect(() => {
    if (!date) return;
    let anulat = false;
    fetch(`/api/programare/ocupate?data=${date}`)
      .then((r) => r.json())
      .then((d: { ocupate?: string[] }) => !anulat && setOcupate({ data: date, ore: d.ocupate ?? [] }))
      .catch(() => {});
    return () => {
      anulat = true;
    };
  }, [date, reincarca]);

  // azi: doar intervalele care n-au trecut (ora României)
  const acum = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Bucharest", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
  const hours = hoursFor(date ? new Date(`${date}T12:00:00`) : new Date()).filter(
    (h) => !(ocupate.data === date && ocupate.ore.includes(h)) && !(date === todayIso() && h <= acum),
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: "loading" });

    const phone = form.elements.namedItem("phone") as HTMLInputElement;
    phone.setCustomValidity(phonePattern.test(phone.value.trim()) ? "" : "Număr de telefon invalid");
    const dateInput = form.elements.namedItem("date") as HTMLInputElement;
    dateInput.setCustomValidity(date && new Date(`${date}T12:00:00`).getDay() === 0 ? "Duminica este închis" : "");

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
        // intervalul a fost luat între timp: reîncărcăm orele libere
        if (res.status === 409) setReincarca((n) => n + 1);
        return;
      }
      setStatus({ kind: "sent" });
      form.reset();
      setDate("");
      setDateType("text");
      setValidatedForm(false);
      setTimeout(() => setStatus((s) => (s.kind === "sent" ? { kind: "idle" } : s)), 5000);
    } catch {
      setStatus({ kind: "error", message: "Eroare de conexiune. Încearcă din nou." });
    }
  }

  const field = `${appointmentField} h-11 ${validated}`;
  const select = `${field} ${selectArrow} pr-9!`;

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
            <div className="mt-4 pb-2 md:w-1/6">
              {/* bootstrap-datepicker: câmp text „Selectează data", de azi încolo, fără duminici */}
              <input
                name="date"
                type={dateType}
                placeholder="Selectează data"
                required
                min={todayIso()}
                value={date}
                onFocus={(e) => {
                  setDateType("date");
                  requestAnimationFrame(() => e.target.showPicker?.());
                }}
                onBlur={() => !date && setDateType("text")}
                onChange={(e) => {
                  e.currentTarget.setCustomValidity("");
                  setDate(e.target.value);
                }}
                className={field}
              />
            </div>

            <div className="mt-4 pb-2 md:w-1/6">
              <select name="hour" required defaultValue={hours[0]} key={`${date}-${hours.join()}`} className={select}>
                {date && hours.length === 0 && <option value="">Nicio oră liberă</option>}
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 pb-2 md:w-1/3">
              <select name="bookingType" required defaultValue="" className={select}>
                <option value="">Selectează departamentul</option>
                {bookingTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 pb-2 md:w-1/3">
              <select name="doctor" defaultValue="" className={select}>
                <option value="">Selectează medicul</option>
                {doctors.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} - {d.specialization}
                  </option>
                ))}
              </select>
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
