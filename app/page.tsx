import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { ContactForm } from "@/components/contact-form";
import { OpenNow } from "@/components/open-now";
import { gallery, schedule, services, site, team } from "@/lib/site";

// Rândurile planșei de optotipuri: fiecare rând e mai mic decât cel de deasupra.
const chart = [
  { text: "Vezi", className: "text-[clamp(4.5rem,13vw,9.5rem)] font-extrabold leading-[0.9] tracking-[-0.03em]" },
  { text: "mai bine.", className: "text-[clamp(2.6rem,7vw,5rem)] font-bold leading-none tracking-[-0.02em]" },
  { text: "Consultații oftalmologice și ochelari", className: "text-[clamp(1.35rem,2.6vw,1.9rem)] font-semibold leading-tight" },
  { text: "pe Str. Republicii nr. 19, în Câmpina", className: "text-[clamp(1rem,1.6vw,1.2rem)] text-cerneala-2" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-20 md:pb-24">
        <div>
          <h1 className="sr-only">Joy Optic — consultații oftalmologice și ochelari în Câmpina</h1>
          <div aria-hidden="true">
            {chart.map((row, i) => (
              <p
                key={row.text}
                className={`rand-optotip ${row.className} ${i ? "mt-3" : ""}`}
                style={{ animationDelay: `${i * 160}ms` }}
              >
                {row.text}
              </p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="#programare"
              className="rounded-md bg-lentila px-6 py-3.5 text-lg font-bold text-white hover:bg-lentila-2"
            >
              Programează o consultație
            </Link>
            <a
              href={site.phoneHref}
              className="rounded-md border border-cerneala/20 px-6 py-3.5 text-lg font-bold hover:border-cerneala/50"
            >
              Sună la {site.phone}
            </a>
          </div>
          <OpenNow className="mt-5 text-cerneala-2" />
        </div>

        <div className="relative">
          <Image
            src="/img/about.jpg"
            alt="Copil care își probează ochelarii noi în oglinda cabinetului Joy Optic"
            width={1000}
            height={676}
            priority
            className="aspect-[4/3] w-full rounded-lg object-cover"
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        </div>
      </section>

      {/* Servicii */}
      <section id="servicii" className="border-y border-linie bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ce facem în cabinet</h2>
            <p className="mt-3 text-lg text-cerneala-2">
              De la consultația oftalmologică la ochelarii montați, totul se întâmplă în același loc.
            </p>
          </div>

          <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.title} className="border-t-2 border-cerneala pt-5">
                <h3 className="text-xl font-bold">
                  {s.href ? (
                    <Link href={s.href} className="hover:text-lentila">
                      {s.title}
                    </Link>
                  ) : (
                    s.title
                  )}
                </h3>
                <p className="mt-2 text-cerneala-2">{s.text}</p>
                {s.href && (
                  <Link href={s.href} className="mt-3 inline-block font-bold text-lentila underline-offset-4 hover:underline">
                    Detalii despre {s.title.toLowerCase()}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Despre */}
      <section id="despre" className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2">
        <Image
          src="/img/pages/67b598dc-565c-45e2-8b09-420bc266daad.jpg"
          alt="Pacientă cu ochelari cu ramă neagră"
          width={1200}
          height={529}
          className="aspect-[4/3] w-full rounded-lg object-cover object-[60%_center]"
          sizes="(min-width: 768px) 45vw, 100vw"
        />
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Despre Joy Optic</h2>
          <p className="mt-4 text-lg">
            Suntem un cabinet de optică medicală și oftalmologie din Câmpina. Medicii oftalmologi fac
            consultația, optometristul face măsurătorile, iar ochelarii se montează pe loc, cu
            aparatură automatizată.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Consultații făcute de medici oftalmologi cu experiență",
              "Rețete de ochelari și lentile de contact adaptate fiecărui pacient",
              "Montaj de ochelari cu aparatură automatizată",
              "Rame și lentile alese pentru confort și protecție",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <svg className="mt-1.5 h-4 w-4 flex-none text-lentila" viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="8" cy="8" r="2.5" fill="currentColor" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Programare */}
      <section id="programare" className="bg-ceata">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Programează-te</h2>
            <p className="mt-4 text-lg">
              Alege ziua și ora, apoi confirmă programarea din emailul pe care ți-l trimitem. Un
              coleg de la Joy Optic te contactează pentru confirmarea finală.
            </p>
            <p className="mt-6 text-cerneala-2">
              Preferi telefonul? Sună la{" "}
              <a href={site.phoneHref} className="font-bold text-cerneala underline underline-offset-4">
                {site.phone}
              </a>
              .
            </p>
            <dl className="mt-8 grid max-w-xs grid-cols-[1fr_auto] gap-y-1.5">
              {schedule.map((s) => (
                <div key={s.label} className="contents">
                  <dt>{s.label}</dt>
                  <dd className="font-bold">{s.open ? `${s.open} – ${s.close}` : "Închis"}</dd>
                </div>
              ))}
            </dl>
          </div>
          <BookingForm />
        </div>
      </section>

      {/* Echipa */}
      <section id="echipa" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Echipa</h2>
        <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((p) => (
            <li key={p.name}>
              <p className="text-xl font-bold">{p.name}</p>
              <p className="font-semibold text-lentila">{p.role}</p>
              <p className="mt-1 text-cerneala-2">{p.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Galerie */}
      <section aria-labelledby="galerie" className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="galerie" className="sr-only">
          Imagini din cabinet
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.map((src, i) => (
            <li key={src}>
              <Image
                src={src}
                alt={`Imagine din cabinetul Joy Optic ${i + 1}`}
                width={800}
                height={600}
                className="aspect-[4/3] w-full rounded-md object-cover"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Scrie-ne</h2>
          <p className="mt-4 text-lg">Ai o întrebare despre consultații, ochelari sau o comandă? Lasă-ne un mesaj și revenim prin email sau telefon.</p>
          <ContactForm className="mt-8" />
        </div>
        <div>
          <iframe
            src={site.mapsEmbed}
            title="Harta: Joy Optic, Str. Republicii nr. 19, Câmpina"
            className="aspect-[4/3] w-full rounded-lg border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="mt-4">
            {site.address}, {site.city}.{" "}
            <a href={site.mapsLink} className="font-bold text-lentila underline-offset-4 hover:underline">
              Deschide în Google Maps
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
