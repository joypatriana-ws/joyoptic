"use client";

import { useEffect, useState } from "react";

/** #scroll-top din layout: apare după 100px de scroll. */
export function ScrollTop() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onScroll = () => setActive(window.scrollY > 100);
    onScroll();
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#"
      id="scroll-top"
      aria-label="Înapoi sus"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={`fixed right-[15px] bottom-[15px] z-[99999] flex h-10 w-10 items-center justify-center rounded bg-accent transition-all duration-400 hover:bg-accent/80 ${active ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <i className="bi bi-arrow-up-short text-[24px] leading-0 text-white" />
    </a>
  );
}
