"use client";

import { useState } from "react";
import { rowClasses, sectionClasses } from "@/lib/theme-classes.mjs";
import { contactSubjects, phonePattern, site } from "@/lib/site";
import { sectionId } from "@/lib/slugs.mjs";
import { SectionTitle } from "./section-title";
import { contactField, formControl, formError, formLoading, formSent, validated } from "./form-classes";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "sent" } | { kind: "error"; message: string };

const infoItem = "flex [&+&]:mt-10";
const infoIcon =
  "bi mr-[15px] flex h-11 w-11 shrink-0 items-center justify-center rounded-[50px] bg-accent text-[20px] text-white transition-all duration-300 ease-in-out";
const infoH3 = "mb-[5px] p-0 text-[18px] font-bold";
const infoP = "mb-0 p-0 text-[14px]";

/** <section id={sectionId("contact")} class="contact section"> din Nodes/promoted.ctp și Contacts/view.ctp */
export function Contact() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [validatedForm, setValidatedForm] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const phone = form.elements.namedItem("phone") as HTMLInputElement;
    phone.setCustomValidity(phonePattern.test(phone.value.trim()) ? "" : "Număr de telefon invalid");
    if (!form.checkValidity()) {
      setValidatedForm(true);
      return;
    }

    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: "error", message: data.message || "A apărut o eroare la trimiterea mesajului." });
        return;
      }
      setStatus({ kind: "sent" });
      setValidatedForm(false);
      form.reset();
    } catch {
      setStatus({ kind: "error", message: "Eroare de conexiune. Încearcă din nou." });
    }
  }

  const text = `${contactField} ${validated}`;
  const bootstrapField = `${formControl} ${validated}`;

  return (
    <section id={sectionId("contact")} className={sectionClasses()}>
      <SectionTitle
        title="Contact Joy Optic"
        text="Ai nevoie de informații suplimentare? Contactează-ne folosind formularul de mai jos sau prin telefon."
      />

      <div className="mb-12" data-aos="fade-up" data-aos-delay="200">
        <iframe
          title="Harta Joy Optic"
          style={{ border: 0, width: "100%", height: 270 }}
          src={site.mapsEmbed}
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="container-bs" data-aos="fade-up" data-aos-delay="100">
        <div className={rowClasses(1.5, 1.5)}>
          <div className="lg:w-1/3">
            <div className={infoItem} data-aos="fade-up" data-aos-delay="300">
              <i className={`${infoIcon} bi-geo-alt`} />
              <div>
                <h3 className={infoH3}>Adresă</h3>
                <p className={infoP}>Str. Republicii nr. 19, Câmpina, România</p>
              </div>
            </div>

            <div className={infoItem} data-aos="fade-up" data-aos-delay="400">
              <i className={`${infoIcon} bi-telephone`} />
              <div>
                <h3 className={infoH3}>Telefon</h3>
                <p className={infoP}>
                  <a href={site.phoneHref}>{site.phone}</a>
                </p>
              </div>
            </div>

            <div className={infoItem} data-aos="fade-up" data-aos-delay="500">
              <i className={`${infoIcon} bi-envelope`} />
              <div>
                <h3 className={infoH3}>Email</h3>
                <p className={infoP}>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            <form
              id="contact-form"
              noValidate
              onSubmit={onSubmit}
              data-validated={validatedForm || undefined}
              className="group/form h-full"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className={rowClasses(1.5, 1.5)}>
                <div className="md:w-1/2">
                  <input name="name" type="text" placeholder="Numele tău" required className={text} />
                </div>
                <div className="md:w-1/2">
                  <input name="email" type="email" placeholder="Email" required className={text} />
                </div>
                <div className="md:w-1/2">
                  <select name="subject" required defaultValue="" className={bootstrapField}>
                    <option value="">Alege un subiect</option>
                    {contactSubjects.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:w-1/2">
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Numărul de telefon"
                    required
                    pattern="^(07[1-9]\d{7}|02\d{7}|03\d{7})"
                    onInput={(e) => e.currentTarget.setCustomValidity("")}
                    className={`${bootstrapField} placeholder:text-default/30`}
                  />
                </div>
                <div className="md:w-full">
                  <textarea name="body" placeholder="Mesajul tău" required rows={6} className={text} />
                </div>

                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                <div className="text-center md:w-full" aria-live="polite">
                  {status.kind === "loading" && <div className={formLoading}>Se procesează...</div>}
                  {status.kind === "error" && <div className={formError}>{status.message}</div>}
                  {status.kind === "sent" && <div className={formSent}>Mesajul tău a fost trimis cu succes. Mulțumim!</div>}
                  <button
                    type="submit"
                    disabled={status.kind === "loading"}
                    className="rounded-[50px] border-0 bg-accent px-9 py-2.5 text-white transition duration-400 hover:bg-accent/80"
                  >
                    Trimite mesaj
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
