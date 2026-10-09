import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/theme/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: "Ce date personale prelucrează Joy Optic prin site, de ce, cui le transmitem și ce drepturi ai.",
  alternates: { canonical: "/politica-de-confidentialitate" },
};

// Conținut verificat din cod: ce colectează formularele și unde ajung datele.
// Păstrarea datelor: cât e necesar, apoi cât cere legea (confirmat de cabinet, fără termen propriu).
export default function PoliticaConfidentialitate() {
  return (
    <LegalPage
      title="Politica de confidențialitate"
      intro="Ce date ne trimiți prin site, de ce le folosim, cui ajung și ce drepturi ai."
    >
      <h2>Cine suntem</h2>
      <p>
        Datele sunt prelucrate de <strong>{site.company}</strong> ({site.name}), cabinet de optică medicală și oftalmologie, cu sediul
        în {site.registeredOffice}, CUI {site.cui}, nr. Registrul Comerțului {site.regCom}. Ne poți scrie la{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> sau ne poți suna la <a href={site.phoneHref}>{site.phone}</a> pentru orice
        întrebare despre datele tale.
      </p>

      <h2>Ce date colectăm și de ce</h2>
      <ul>
        <li>
          <strong>Formularul de programare:</strong> nume, email, telefon, medicul, data și ora alese și, dacă scrii, un mesaj. Le
          folosim ca să înregistrăm programarea, să ți-o confirmăm prin email și să te contactăm în legătură cu ea. Temeiul este cererea
          ta (art. 6 alin. 1 lit. b din GDPR).
        </li>
        <li>
          <strong>Formularul de contact:</strong> nume, email, telefon, subiectul și mesajul. Le folosim ca să-ți răspundem. Temeiul
          este interesul legitim de a răspunde la mesajul tău (art. 6 alin. 1 lit. f din GDPR).
        </li>
      </ul>
      <p>
        Te rugăm să nu trimiți prin formulare informații medicale detaliate; le discutăm la consultație. Nu folosim datele din formulare
        pentru reclame sau newsletter.
      </p>

      <h2>Cui transmitem datele</h2>
      <p>Datele nu sunt vândute și nu sunt date altor firme pentru marketing. Le prelucrează, în numele nostru, doar furnizorii tehnici ai site-ului:</p>
      <ul>
        <li>
          <strong>Vercel</strong> — găzduirea site-ului;
        </li>
        <li>
          <strong>MongoDB Atlas</strong> — baza de date în care se păstrează programările și mesajele;
        </li>
        <li>
          <strong>Resend</strong> — trimiterea emailurilor de confirmare și a notificărilor către cabinet;
        </li>
        <li>
          <strong>ImprovMX</strong> și <strong>Google (Gmail)</strong> — primirea emailurilor trimise la {site.email};
        </li>
        <li>
          <strong>Google</strong> — harta din pagina de contact (vezi <Link href="/cookies">Politica de cookie-uri</Link>).
        </li>
      </ul>

      <h2>Cât timp păstrăm datele</h2>
      <p>
        Păstrăm datele cât timp sunt necesare pentru programare sau pentru a-ți răspunde, iar apoi doar cât ne obligă legea. Poți cere
        oricând ștergerea lor.
      </p>

      <h2>Drepturile tale</h2>
      <p>
        Ai dreptul să afli ce date avem despre tine, să le corectezi, să ceri ștergerea sau restricționarea lor, să te opui prelucrării și
        să ceri transmiterea lor. Pentru oricare dintre acestea, scrie-ne la <a href={`mailto:${site.email}`}>{site.email}</a>. Dacă
        consideri că drepturile tale nu au fost respectate, te poți adresa Autorității Naționale de Supraveghere a Prelucrării Datelor
        cu Caracter Personal (
        <a href="https://www.dataprotection.ro" target="_blank" rel="noreferrer">
          dataprotection.ro
        </a>
        ).
      </p>

      <h2>Cookie-uri</h2>
      <p>
        Ce cookie-uri folosim și cum îți schimbi alegerea găsești în <Link href="/cookies">Politica de cookie-uri</Link>.
      </p>
    </LegalPage>
  );
}
