"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";

/**
 * Restul din main.js: AOS (animațiile data-aos), GLightbox (.glightbox: galeria și video-ul de prezentare)
 * și deschiderea întrebărilor din FAQ. Se reinițializează la fiecare schimbare de pagină.
 */
export function ThemeScripts() {
  const pathname = usePathname();

  useEffect(() => {
    // ca în main.js: AOS pornește la `load`, după fonturi și imagini, ca pozițiile secțiunilor să fie finale
    const init = () => AOS.init({ duration: 600, easing: "ease-in-out", once: true, mirror: false });
    if (document.readyState === "complete") init();
    else window.addEventListener("load", init, { once: true });
    return () => window.removeEventListener("load", init);
  }, []);

  useEffect(() => {
    if (document.readyState === "complete") AOS.refreshHard();

    let lightbox: { destroy: () => void } | undefined;
    import("glightbox").then(({ default: GLightbox }) => {
      lightbox = GLightbox({ selector: ".glightbox" });
    });

    // FAQ: click pe întrebare sau pe săgeată → .faq-active (aici data-active)
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const trigger = target.closest(".faq-item h3, .faq-item .faq-toggle");
      const item = trigger?.closest<HTMLElement>(".faq-item");
      if (!item) return;
      item.toggleAttribute("data-active");
    }
    document.addEventListener("click", onClick);

    return () => {
      lightbox?.destroy();
      document.removeEventListener("click", onClick);
    };
  }, [pathname]);

  return null;
}
