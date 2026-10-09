// Google Consent Mode v2 — helpers + persistență cookie.
// Vezi https://developers.google.com/tag-platform/security/guidance/consent-mode
// Portat din NovaFitUpgrade (lib/consent.ts), kit-ul din docs/consent. Vezi docs/consent/README.md.

export const CONSENT_COOKIE_NAME = "joyoptic_consent";
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an

export type ConsentChoice = "granted" | "denied";

/** Cele 7 categorii standard din Consent Mode v2. */
export interface ConsentState {
  ad_storage: ConsentChoice;
  ad_user_data: ConsentChoice;
  ad_personalization: ConsentChoice;
  analytics_storage: ConsentChoice;
  functionality_storage: ConsentChoice;
  personalization_storage: ConsentChoice;
  security_storage: ConsentChoice;
}

/** Reject-all explicit — folosit de butonul „Refuză tot" din banner. */
export const DEFAULT_DENIED: ConsentState = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "granted",
};

/**
 * Default la load, pentru vizitatorul care n-a ales încă: NIMIC nu se stochează.
 *
 * `analytics_storage` a fost `granted` pe temeiul interesului legitim. Temeiul ține
 * pentru GDPR, dar ePrivacy (la noi Legea 506/2004) cere acord pentru orice *stocare*
 * pe terminalul vizitatorului, indiferent de temei — iar `_ga` e exact asta. Deci
 * `denied` până la clic. NU oprește măsurarea: cu Consent Mode v2, GA4 primește în
 * continuare ping-uri fără cookie și modelează conversiile. Pierdem cookie-ul, nu datele.
 *
 * `functionality_storage` rămâne granted: ține limba/coșul, adică exact ce a cerut
 * vizitatorul singur — scutit de acord ca strict necesar. Vezi docs/consent/README.md.
 */
export const DEFAULT_CONSENT: ConsentState = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "granted",
  personalization_storage: "denied",
  security_storage: "granted",
};

export const ALL_GRANTED: ConsentState = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
  functionality_storage: "granted",
  personalization_storage: "granted",
  security_storage: "granted",
};

export function buildConsentCookieValue(state: ConsentState): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const value = encodeURIComponent(JSON.stringify(state));
  return `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function readConsentCookieClient(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${CONSENT_COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as ConsentState;
  } catch {
    return null;
  }
}

export function persistConsentClient(state: ConsentState): void {
  if (typeof document === "undefined") return;
  document.cookie = buildConsentCookieValue(state);
}

/**
 * Trimite noul consimțământ către Google Tag, în clipa alegerii.
 *
 * ATENȚIE la formă: `gtag()` împinge obiectul `arguments`, și doar forma aia o
 * recunoaște Google Tag drept comandă. Varianta veche împingea un Array simplu
 * (`["consent","update",state]`), care ajungea în `dataLayer` dar nu era citit
 * niciodată — deci clicul pe banner nu schimba nimic pentru GTM. Părea că merge
 * doar la reîncărcare, unde scriptul sincron cheamă `gtag()` adevărat.
 * Vezi docs/consent/README.md §2.
 */
export function pushConsentUpdate(state: ConsentState): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    gtag?: (...a: unknown[]) => void;
    dataLayer?: unknown[];
  };
  // Dacă scriptul sincron încă n-a rulat, definim `gtag` exact cum o face
  // snippet-ul Google — nu improvizăm altă formă.
  if (typeof w.gtag !== "function") {
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
  }
  w.gtag("consent", "update", state);

  // Un eveniment propriu, pe care GTM îl poate folosi drept declanșator: tagurile
  // terțe (Meta Pixel) sunt blocate până la acord, ratează „All Pages" și GTM nu
  // le reia singur — pornesc abia la pagina următoare. Cu asta au pe ce să se
  // declanșeze pe loc, fără să pierdem prima pagină (pagina pe care intră traficul plătit).
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({
    event: "consimtamant_actualizat",
    consimtamant_publicitate: state.ad_storage,
    consimtamant_analiza: state.analytics_storage,
  });
}
