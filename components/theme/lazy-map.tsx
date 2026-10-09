"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

// Ca în NovaFitUpgrade (components/contact/lazy-map.tsx): iframe-ul Google Maps se încarcă abia la prima
// interacțiune cu pagina (scroll / atingere / mouse / tastă) — fără conexiuni la Google la simpla deschidere.
export function LazyMap({ height = 270 }: { height?: number }) {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load) return;
    const on = () => setLoad(true);
    const events = ["scroll", "pointerdown", "pointermove", "touchstart", "keydown"];
    events.forEach((e) => window.addEventListener(e, on, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, on));
  }, [load]);

  if (!load) {
    return (
      <div className="flex w-full items-center justify-center bg-light" style={{ height }}>
        <i className="bi bi-geo-alt text-[40px] text-accent/40" aria-hidden="true" />
      </div>
    );
  }

  return (
    <iframe
      title="Harta Joy Optic"
      style={{ border: 0, width: "100%", height }}
      src={site.mapsEmbed}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
