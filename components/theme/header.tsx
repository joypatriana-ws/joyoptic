"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { homeMenu, mainMenu, site } from "@/lib/site";
import { pagePath, sectionId } from "@/lib/slugs.mjs";

/**
 * <header id="header" class="header sticky-top"> din Layouts/promoted.ctp (prima pagină, meniu cu ancore)
 * și Layouts/default.ctp (celelalte pagini, meniul „main" din Croogo).
 * Comportamentele din main.js: .scrolled după 100px, meniul mobil, scrollspy.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const menu = isHome ? homeMenu : mainMenu;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(`#${sectionId("hero")}`);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 100);
      if (!isHome) return;
      // navmenuScrollspy din main.js
      const position = window.scrollY + 200;
      for (const { href } of homeMenu) {
        const section = document.querySelector<HTMLElement>(href);
        if (section && position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
          setActiveHash(href);
        }
      }
    }
    onScroll();
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
  }, [mobileOpen]);

  const isActive = (href: string) => (isHome ? href === activeHash : href === pathname);

  return (
    <header
      id="header"
      className={`sticky top-0 z-[997] bg-white text-default transition-all duration-500 ${scrolled ? "shadow-[0px_0_18px_rgba(0,0,0,0.1)]" : ""}`}
    >
      {/* Top Bar */}
      <div
        className={`flex items-center bg-accent p-0 text-[14px] transition-all duration-500 ${scrolled ? "invisible h-0 overflow-hidden" : "h-10"}`}
      >
        <div className="container-bs flex justify-center md:justify-between">
          <div className="flex items-center">
            <i className="bi bi-envelope flex items-center not-italic text-white">
              <a
                href={`mailto:${site.email}`}
                className="pl-[5px] leading-0 text-white hover:text-white hover:underline max-[575px]:text-[13px]"
              >
                {site.email}
              </a>
            </i>
            <i className="bi bi-phone ms-6 flex items-center not-italic text-white">
              <span className="pl-[5px] text-white max-[575px]:text-[13px]">{site.phoneTopbar}</span>
            </i>
          </div>
          <div className="hidden items-center md:flex">
            <a href={site.facebook} className="ml-5 leading-0 text-white/60 transition hover:text-white">
              <i className="bi bi-facebook text-[20px]" />
            </a>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="flex min-h-[60px] items-center py-2.5">
        <div className="container-bs relative flex items-center justify-between">
          <Link href="/" className="me-auto flex items-center leading-none max-xl:order-1">
            <h1 className="m-0 text-[30px] font-bold text-heading">{site.name}</h1>
          </Link>

          <nav
            id="navmenu"
            className={`p-0 max-xl:order-3 max-xl:z-[9997] ${mobileOpen ? "max-xl:fixed max-xl:inset-0 max-xl:overflow-hidden max-xl:bg-[rgba(33,37,41,0.8)] max-xl:transition" : ""}`}
          >
            <ul
              className={`m-0 list-none p-0 xl:flex xl:items-center ${
                mobileOpen
                  ? "max-xl:absolute max-xl:inset-[60px_20px_20px_20px] max-xl:z-[9998] max-xl:block max-xl:overflow-y-auto max-xl:rounded-md max-xl:border max-xl:border-default/10 max-xl:bg-white max-xl:py-2.5"
                  : "max-xl:hidden"
              }`}
            >
              {menu.map((l) => {
                const active = isActive(l.href);
                return (
                  <li key={l.href} className="relative xl:px-[14px] xl:py-[15px] xl:whitespace-nowrap xl:last:pr-0">
                    <Link
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "relative flex items-center justify-between font-nav whitespace-nowrap transition duration-300",
                        // desktop
                        "xl:px-0.5 xl:text-[15px] xl:font-normal",
                        "xl:before:invisible xl:before:absolute xl:before:-bottom-1.5 xl:before:left-0 xl:before:h-0.5 xl:before:w-0 xl:before:bg-nav-hover xl:before:transition-all xl:before:duration-300 xl:before:ease-in-out xl:before:content-['']",
                        "xl:hover:before:visible xl:hover:before:w-full",
                        // mobil
                        "max-xl:px-5 max-xl:py-2.5 max-xl:text-[17px] max-xl:font-medium",
                        active
                          ? "text-nav-hover xl:before:visible xl:before:w-full"
                          : "text-heading hover:text-nav-hover",
                      ].join(" ")}
                    >
                      {l.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className={`bi cursor-pointer leading-0 transition-colors duration-300 xl:hidden ${
                mobileOpen
                  ? "bi-x absolute top-[15px] right-[15px] z-[9999] mr-0 text-[32px] text-white"
                  : "bi-list mr-2.5 text-[28px] text-heading"
              }`}
            />
          </nav>

          <Link
            href={isHome ? `#${sectionId("appointment")}` : pagePath("appointment")}
            className="ml-[30px] hidden rounded-[50px] bg-accent px-[25px] py-2 text-[14px] text-white transition duration-300 hover:bg-accent/85 hover:text-white focus:text-white sm:block max-xl:order-2 max-xl:mr-[15px] max-xl:ml-0 max-xl:px-[15px] max-xl:py-1.5"
          >
            Programează-te
          </Link>
        </div>
      </div>
    </header>
  );
}
