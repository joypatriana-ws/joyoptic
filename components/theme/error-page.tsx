import Link from "next/link";
import type { ReactNode } from "react";
import { sectionClasses } from "@/lib/theme-classes.mjs";
import { pagePath } from "@/lib/slugs.mjs";
import { site } from "@/lib/site";

const pill =
  "inline-flex items-center gap-2 rounded-[50px] px-[30px] py-2.5 text-[16px] transition duration-300";

/** Paginile de eroare (404 / 500) în stilul temei: cod mare, explicație, ce poți face mai departe. */
export function ErrorPage({
  code,
  title,
  text,
  action,
}: {
  code: string;
  title: string;
  text: string;
  /** butonul principal (ex. „Încearcă din nou”); implicit „Înapoi la prima pagină” */
  action?: ReactNode;
}) {
  const linkuri = [
    { title: "Servicii", href: pagePath("services") },
    { title: "Examen oftalmologic pentru permis auto", href: pagePath("examen-oftalmologic-pentru-permis-auto") },
    { title: "Întrebări frecvente", href: pagePath("faq") },
    { title: "Contact", href: "/contact" },
  ];

  return (
    <section className={`${sectionClasses({ light: true })} py-20!`}>
      <div className="container-bs text-center" data-aos="fade-up">
        <div className="font-heading text-[clamp(88px,18vw,150px)] leading-none font-bold text-accent" aria-hidden="true">
          {code}
        </div>
        <h1 className="mt-4 mb-4 text-[32px] font-semibold text-heading">{title}</h1>
        <p className="mx-auto mb-8 max-w-[560px] text-[1.15rem] text-default/80">{text}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {action ?? (
            <Link href="/" className={`${pill} bg-accent text-white hover:bg-accent/85 hover:text-white`}>
              <i className="bi bi-house" aria-hidden="true" /> Înapoi la prima pagină
            </Link>
          )}
          <Link
            href={pagePath("appointment")}
            className={`${pill} border border-accent text-accent hover:bg-accent hover:text-white`}
          >
            <i className="bi bi-calendar-check" aria-hidden="true" /> Programează-te
          </Link>
        </div>

        <div className="mx-auto mt-12 max-w-[640px] rounded-[10px] bg-white p-6 text-left shadow-[0px_2px_15px_rgba(0,0,0,0.1)]">
          <h2 className="mb-3 text-[18px] font-bold text-heading">Poate căutai:</h2>
          <ul className="m-0 grid list-none gap-x-6 gap-y-2 p-0 sm:grid-cols-2">
            {linkuri.map((l) => (
              <li key={l.href} className="flex items-center gap-2">
                <i className="bi bi-chevron-right text-[12px] text-accent" aria-hidden="true" />
                <Link href={l.href}>{l.title}</Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 mb-0 border-t border-default/10 pt-4 text-[15px]">
            Sau sună-ne la{" "}
            <a href={site.phoneHref} className="font-semibold">
              {site.phone}
            </a>{" "}
            — luni–vineri 09:00–19:00, sâmbătă 09:00–12:00.
          </p>
        </div>
      </div>
    </section>
  );
}
