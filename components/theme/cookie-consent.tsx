"use client";

// Bannerul și panoul de setări din NovaFitUpgrade (docs/consent), în stilul temei JoyOptic.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ALL_GRANTED,
  DEFAULT_CONSENT,
  DEFAULT_DENIED,
  persistConsentClient,
  pushConsentUpdate,
  readConsentCookieClient,
  type ConsentChoice,
  type ConsentState,
} from "@/lib/consent";

export const POLICY_HREF = "/politica-de-confidentialitate";
export const COOKIES_HREF = "/cookies";

const CATEGORII = {
  esentiale: { title: "Esențiale", body: "Necesare pentru funcționarea site-ului (de exemplu, alegerea ta despre cookie-uri). Mereu active." },
  analiza: { title: "Analiză", body: "Ne ajută să înțelegem cum este folosit site-ul (Google Analytics). Se activează doar cu acordul tău." },
  marketing: { title: "Marketing", body: "Permit reclame personalizate și măsurarea campaniilor (Google Ads, Meta). Se activează doar cu acordul tău." },
  personalizare: { title: "Personalizare", body: "Salvează preferințe pentru o experiență consistentă. Se activează doar cu acordul tău." },
};

type Toggles = { analiza: boolean; marketing: boolean; personalizare: boolean };

function togglesToConsent(t: Toggles): ConsentState {
  const g: ConsentChoice = "granted";
  const d: ConsentChoice = "denied";
  return {
    ad_storage: t.marketing ? g : d,
    ad_user_data: t.marketing ? g : d,
    ad_personalization: t.marketing ? g : d,
    analytics_storage: t.analiza ? g : d,
    functionality_storage: t.personalizare ? g : d,
    personalization_storage: t.personalizare ? g : d,
    security_storage: g,
  };
}

const consentToToggles = (c: ConsentState): Toggles => ({
  analiza: c.analytics_storage === "granted",
  marketing: c.ad_storage === "granted",
  personalizare: c.personalization_storage === "granted",
});

function aplica(state: ConsentState) {
  pushConsentUpdate(state);
  persistConsentClient(state);
}

const btnPlin = "flex-[1_1_140px] rounded-[50px] bg-accent px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-accent/85";
const btnGol = "flex-[1_1_140px] rounded-[50px] border border-accent px-5 py-2.5 text-[14px] font-medium text-accent transition hover:bg-accent/10";

function Comutator({ checked, onToggle, disabled, label }: { checked: boolean; onToggle?: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onToggle?.(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${checked ? "bg-accent" : "bg-black/15"}`}
    >
      <span aria-hidden className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Categorii({ t, setT }: { t: Toggles; setT: (f: (p: Toggles) => Toggles) => void }) {
  const rand = (cheie: keyof typeof CATEGORII, checked: boolean, onToggle?: (v: boolean) => void) => (
    <div key={cheie} className="flex items-start gap-3 rounded-[10px] border border-black/[.06] bg-surface px-3.5 py-3">
      <div className="flex-1">
        <div className="mb-0.5 text-[14px] font-semibold text-heading">{CATEGORII[cheie].title}</div>
        <div className="text-[13px] leading-snug text-default/75">{CATEGORII[cheie].body}</div>
      </div>
      <Comutator checked={checked} onToggle={onToggle} disabled={!onToggle} label={CATEGORII[cheie].title} />
    </div>
  );
  return (
    <div className="flex flex-col gap-2.5">
      {rand("esentiale", true)}
      {rand("analiza", t.analiza, (v) => setT((p) => ({ ...p, analiza: v })))}
      {rand("marketing", t.marketing, (v) => setT((p) => ({ ...p, marketing: v })))}
      {rand("personalizare", t.personalizare, (v) => setT((p) => ({ ...p, personalizare: v })))}
    </div>
  );
}

/** Bannerul: Accept tot / Refuz tot / Modifică, la fel de accesibile, pe primul ecran. */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mod, setMod] = useState<"implicit" | "setari">("implicit");
  const [t, setT] = useState<Toggles>({ analiza: false, marketing: false, personalizare: false });
  const pathname = usePathname();

  useEffect(() => {
    // ca în NovaFit: nu pe localhost (în dezvoltare se testează pe IP-ul din rețea)
    if (/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(window.location.host)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cookie-ul se citește doar în browser
    setVisible(!readConsentCookieClient());
  }, []);

  // pe /cookies panoul e deja în pagină
  if (!visible || pathname === COOKIES_HREF) return null;

  const alege = (state: ConsentState) => {
    aplica(state);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Folosim cookie-uri"
      className="fixed inset-x-4 bottom-4 z-[99998] mx-auto max-w-[540px] rounded-2xl border border-black/[.06] bg-white p-5 text-default shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
    >
      <div className="mb-2 flex items-center gap-2 font-heading text-[16px] font-semibold text-heading">
        <i className="bi bi-shield-check text-accent" aria-hidden="true" /> Folosim cookie-uri
      </div>

      {mod === "setari" ? (
        <div className="mb-4 max-h-[50vh] overflow-y-auto">
          <Categorii t={t} setT={setT} />
        </div>
      ) : (
        <p className="mb-4 text-[14px] leading-relaxed text-default/80">
          Folosim cookie-uri pentru funcționarea site-ului și, doar cu acordul tău, pentru măsurarea audienței și marketing. Poți
          accepta, refuza sau alege ce permiți.{" "}
          <Link prefetch={false} href={POLICY_HREF} className="underline underline-offset-2">
            Politica de confidențialitate
          </Link>
          .
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {mod === "setari" ? (
          <>
            <button type="button" onClick={() => alege(togglesToConsent(t))} className={btnPlin}>
              Salvează preferințele
            </button>
            <button type="button" onClick={() => setMod("implicit")} className={btnGol}>
              Înapoi
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => alege(ALL_GRANTED)} className={btnPlin}>
              Accept tot
            </button>
            <button type="button" onClick={() => alege(DEFAULT_DENIED)} className={btnGol}>
              Refuz tot
            </button>
            <button
              type="button"
              onClick={() => {
                setT(consentToToggles(readConsentCookieClient() ?? DEFAULT_CONSENT));
                setMod("setari");
              }}
              className={btnGol}
            >
              Modifică
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Panoul de pe /cookies: alegerea se poate schimba oricând, la fel de ușor cum a fost dată. */
export function CookieSettingsPanel() {
  const [t, setT] = useState<Toggles>({ analiza: false, marketing: false, personalizare: false });
  const [salvat, setSalvat] = useState<number | null>(null);

  useEffect(() => {
    const c = readConsentCookieClient();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cookie-ul se citește doar în browser
    if (c) setT(consentToToggles(c));
  }, []);

  const salveaza = (state: ConsentState) => {
    aplica(state);
    setT(consentToToggles(state));
    setSalvat(Date.now());
  };

  return (
    <div className="rounded-[10px] bg-white p-6 shadow-[0px_2px_15px_rgba(0,0,0,0.1)]">
      <h2 className="mb-4 text-[20px] font-bold text-heading">Setările tale</h2>
      <Categorii t={t} setT={setT} />
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => salveaza(togglesToConsent(t))} className={btnPlin}>
          Salvează preferințele
        </button>
        <button type="button" onClick={() => salveaza(DEFAULT_DENIED)} className={btnGol}>
          Refuz tot
        </button>
        <button type="button" onClick={() => salveaza(ALL_GRANTED)} className={btnGol}>
          Accept tot
        </button>
      </div>
      {salvat && (
        <div key={salvat} role="status" className="mt-3 text-[14px] text-accent">
          Preferințele au fost salvate.
        </div>
      )}
    </div>
  );
}
