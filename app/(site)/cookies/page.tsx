import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsPanel } from "@/components/theme/cookie-consent";
import { LegalPage } from "@/components/theme/legal-page";

export const metadata: Metadata = {
  title: "Politica de cookie-uri",
  description: "Ce cookie-uri folosește site-ul Joy Optic și cum îți poți schimba oricând preferințele.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Politica de cookie-uri" intro="Aici îți poți schimba oricând alegerea și afla ce face fiecare categorie de cookie-uri.">
      <CookieSettingsPanel />

      <h2>Ce sunt cookie-urile?</h2>
      <p>
        Cookie-urile sunt fișiere mici pe care browserul le păstrează când vizitezi un site, ca acesta să-și amintească anumite
        alegeri (de exemplu, ce ai ales despre cookie-uri) până la vizita următoare.
      </p>

      <h2>Cookie-uri esențiale</h2>
      <p>
        Necesare pentru funcționarea site-ului. Folosim unul singur, <strong>joyoptic_consent</strong>, care ține minte alegerea ta
        despre cookie-uri timp de 12 luni. Nu poate fi dezactivat și nu te identifică.
      </p>

      <h2>Cookie-uri de analiză și de marketing</h2>
      <p>
        Dacă vom folosi Google Analytics, Google Ads sau Meta pentru a măsura audiența și campaniile, acestea vor putea pune
        cookie-uri <strong>doar după acordul tău</strong>, dat din bannerul de cookie-uri sau din panoul de mai sus.
      </p>

      <h2>Harta Google</h2>
      <p>
        Harta din secțiunea de contact este oferită de Google Maps și se încarcă abia după ce interacționezi cu pagina. Google poate
        folosi propriile cookie-uri, conform{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
          politicii de confidențialitate Google
        </a>
        .
      </p>

      <h2>Cum îmi schimb alegerea?</h2>
      <p>
        Din panoul de mai sus, oricând. Schimbarea se aplică imediat. Despre datele pe care ni le trimiți prin formulare găsești detalii
        în <Link href="/politica-de-confidentialitate">Politica de confidențialitate</Link>.
      </p>
    </LegalPage>
  );
}
