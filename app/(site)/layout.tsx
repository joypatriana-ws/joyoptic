import AnalyticsScripts from "@/components/theme/analytics-scripts";
import { CookieBanner } from "@/components/theme/cookie-consent";
import { Flash } from "@/components/theme/flash";
import { Footer } from "@/components/theme/footer";
import { Header } from "@/components/theme/header";
import { Preloader } from "@/components/theme/preloader";
import { ScrollTop } from "@/components/theme/scroll-top";
import { ThemeScripts } from "@/components/theme/theme-scripts";
import { isBlockActive } from "@/lib/content";

/** Layouts/promoted.ctp + default.ctp: site-ul public */
export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // linkul „Oferte" din meniu apare doar când secțiunea de oferte e activă
  const showOffers = await isBlockActive("special-offers");

  return (
    <>
      {/* Consent Mode v2: primul, înaintea oricărui tag (docs/consent) */}
      <AnalyticsScripts />
      <Header showOffers={showOffers} />
      <main className="main">
        <Flash />
        {children}
      </main>
      <Footer />
      <ScrollTop />
      <Preloader />
      <ThemeScripts />
      <CookieBanner />
    </>
  );
}
