import type { Metadata } from "next";
import { Footer } from "@/components/theme/footer";
import { Header } from "@/components/theme/header";
import { ErrorPage } from "@/components/theme/error-page";
import { ThemeScripts } from "@/components/theme/theme-scripts";
import { isBlockActive } from "@/lib/content";

export const metadata: Metadata = { title: "Pagina nu a fost găsită", robots: { index: false } };

/** Adresele care nu se potrivesc cu nicio rută (ex. /ceva/altceva): aceeași pagină 404, cu header și footer. */
export default async function NotFound() {
  const showOffers = await isBlockActive("special-offers").catch(() => false);
  return (
    <>
      <Header showOffers={showOffers} />
      <main className="main">
        <ErrorPage
          code="404"
          title="Pagina nu a fost găsită"
          text="Pagina căutată nu mai există sau adresa a fost scrisă greșit. Te ajutăm să găsești ce cauți."
        />
      </main>
      <Footer />
      <ThemeScripts />
    </>
  );
}
