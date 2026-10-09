import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { schedule, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `${site.name}, ${site.address}, ${site.city}. Telefon ${site.phone}, email ${site.email}.`,
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 pt-14 sm:px-6 md:pt-20 lg:grid-cols-2">
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact</h1>
        <dl className="mt-8 space-y-5 text-lg">
          <div>
            <dt className="font-bold">Adresă</dt>
            <dd>
              {site.address}, {site.city}, {site.county}
            </dd>
          </div>
          <div>
            <dt className="font-bold">Telefon</dt>
            <dd>
              <a href={site.phoneHref} className="underline underline-offset-4">{site.phone}</a>
            </dd>
          </div>
          <div>
            <dt className="font-bold">Email</dt>
            <dd>
              <a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a>
            </dd>
          </div>
          <div>
            <dt className="font-bold">Program</dt>
            <dd>
              {schedule.map((s) => (
                <span key={s.label} className="block">
                  {s.label}: {s.open ? `${s.open} – ${s.close}` : "închis"}
                </span>
              ))}
            </dd>
          </div>
        </dl>
        <iframe
          src={site.mapsEmbed}
          title="Harta: Joy Optic, Str. Republicii nr. 19, Câmpina"
          className="mt-10 aspect-[4/3] w-full rounded-lg border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Trimite-ne un mesaj</h2>
        <ContactForm className="mt-6" />
      </div>
    </section>
  );
}
