"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { nav, site } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-linie bg-hartie/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <Image src="/img/logo.png" alt="" width={46} height={22} priority />
          {site.name}
        </Link>

        <nav aria-label="Principal" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-7 text-[0.95rem] text-cerneala-2">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-cerneala">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={site.phoneHref}
          className="ml-auto hidden font-bold text-cerneala sm:block md:ml-0"
        >
          {site.phone}
        </a>
        <Link
          href="/#programare"
          className="hidden rounded-md bg-lentila px-4 py-2 font-bold text-white hover:bg-lentila-2 sm:block"
        >
          Programează-te
        </Link>

        <button
          type="button"
          className="ml-auto -mr-2 p-2 md:hidden sm:ml-0"
          aria-expanded={open}
          aria-controls="meniu-mobil"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Închide meniul" : "Deschide meniul"}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="meniu-mobil" aria-label="Principal" className="border-t border-linie md:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-3 text-lg">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="block py-2.5">
                  {l.title}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex gap-3 border-t border-linie pt-4 pb-1">
              <a href={site.phoneHref} className="flex-1 rounded-md border border-linie py-2.5 text-center font-bold">
                Sună
              </a>
              <Link href="/#programare" onClick={close} className="flex-1 rounded-md bg-lentila py-2.5 text-center font-bold text-white">
                Programează-te
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
