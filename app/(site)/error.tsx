"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/theme/error-page";

/** Eroare neașteptată într-o pagină a site-ului (500). Header-ul și footer-ul rămân. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      code="500"
      title="A apărut o eroare"
      text="Ceva nu a mers cum trebuie din partea noastră. Încearcă din nou peste câteva momente sau sună-ne și te programăm telefonic."
      action={
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-[50px] bg-accent px-[30px] py-2.5 text-[16px] text-white transition duration-300 hover:bg-accent/85"
        >
          <i className="bi bi-arrow-clockwise" aria-hidden="true" /> Încearcă din nou
        </button>
      }
    />
  );
}
