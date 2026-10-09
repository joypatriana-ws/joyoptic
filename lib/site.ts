// Date fixe ale site-ului, preluate din tema JoyOptic și din meniurile Croogo (tabela links).

import { pagePath, sectionId } from "./slugs.mjs";

export const site = {
  name: "Joy Optic",
  url: "https://joyoptic.ro",
  email: "contact@joyoptic.ro",
  phone: "0787 698 398",
  phoneTopbar: "078 769 8398",
  phoneHref: "tel:+40787698398",
  address: "Str. Republicii nr. 19",
  city: "Câmpina",
  // din certificatul de înregistrare ONRC
  company: "JOY PATRIANA OPTIC S.R.L.",
  cui: "46933024",
  regCom: "J29/2858/2022",
  registeredOffice: "Mun. Câmpina, Str. Republicii nr. 19, bl. 15C, sc. A, parter, jud. Prahova",
  facebook: "https://www.facebook.com/joyoptic08/",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2830.212136933364!2d25.733491!3d45.1256073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b3007850198c7f%3A0x7608a986b0854d92!2sJOY%20OPTIC!5e0!3m2!1sen!2sro!4v1708600000000",
};

/**
 * Adresa publică a site-ului, pentru linkurile din emailuri (ex. confirmarea programării).
 * SITE_URL dacă e setat; altfel adresa de producție dată de Vercel (`.vercel.app` până se leagă domeniul,
 * apoi joyoptic.ro, automat); altfel joyoptic.ro.
 */
export function publicUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return site.url;
}

/** Meniul de pe prima pagină (Layouts/promoted.ctp), cu ancore. */
export const homeMenu = [
  { title: "Acasă", href: `#${sectionId("hero")}` },
  { title: "Despre noi", href: `#${sectionId("about")}` },
  { title: "Servicii", href: `#${sectionId("services")}` },
  { title: "Oferte", href: `#${sectionId("special-offers")}` },
  { title: "Echipa", href: `#${sectionId("doctors")}` },
  { title: "Contact", href: `#${sectionId("contact")}` },
];

/** Meniul „main" din Croogo, pe celelalte pagini (Layouts/default.ctp). */
export const mainMenu = [
  { title: "Acasă", href: "/" },
  { title: "Despre noi", href: pagePath("about-us") },
  { title: "Servicii", href: pagePath("services") },
  { title: "Echipa", href: pagePath("doctors") },
  { title: "Întrebări frecvente", href: pagePath("faq") },
  { title: "Contact", href: "/contact" },
];

/** Meniul „footer" din Croogo („Linkuri Utile"). */
export const footerMenu = [
  { title: "Acasă", href: "/" },
  { title: "Despre Noi", href: pagePath("about-us") },
  { title: "Servicii", href: pagePath("services") },
  { title: "Contact", href: "/contact" },
];

/** Meniul „services" din Croogo („Serviciile Noastre"). */
export const servicesMenu = [
  { title: "Examen Permis Auto", href: pagePath("examen-oftalmologic-pentru-permis-auto") },
  { title: "Consultații oftalmologice", href: pagePath("consultatii-oftalmologice") },
  { title: "Prescriere ochelari", href: pagePath("prescriere-ochelari") },
];

/**
 * Un singur tip de consultație (confirmat de cabinet). Tipurile din Croogo (booking_types, „departamentele")
 * rămân doar în istoricul programărilor vechi.
 */
export const CONSULTATIE = "Consult oftalmologic";

/**
 * Medicii (Elements/home_appointment.ctp + Dr. Labib, adăugat de cabinet). Programările se fac pe medic:
 * fiecare are calendarul lui, cu intervale de 15 minute. `name` e și valoarea salvată în programare.
 */
export const doctors = [
  { name: "Dr. ANGHELACHE Daniela", specialization: "Oftalmologie" },
  { name: "Dr. BARBUCEANU Sorin", specialization: "Optometrie" },
  { name: "Dr. Popteanu Ioana Claudia", specialization: "Oftalmopediatrie" },
  { name: "Dr. Mahdi Labib", specialization: "Medic primar" },
];

/** Subiectele din formularul de contact (Nodes/promoted.ctp). */
export const contactSubjects = [
  { value: "Consultatie oftalmologica", label: "Consultație oftalmologică" },
  { value: "Prescriptie ochelari", label: "Prescripție ochelari" },
  { value: "Examen oftalmologic permis auto", label: "Examen oftalmologic permis auto" },
  { value: "Prescriptie lentile de contact", label: "Prescripție lentile de contact" },
  { value: "Tratamente oftalmologice", label: "Tratamente oftalmologice" },
  { value: "Afectiuni oculare", label: "Afecțiuni oculare" },
  { value: "Comenzi si livrari", label: "Comenzi și livrări" },
  { value: "Programare", label: "Programare" },
  { value: "Intrebari generale", label: "Întrebări generale" },
];

export const gallery = [
  { src: "/img/gallery/gallery-2.jpg", alt: "Imagine 2" },
  { src: "/img/gallery/gallery-4.jpg", alt: "Imagine 4" },
  { src: "/img/gallery/gallery-5.jpg", alt: "Imagine 5" },
  { src: "/img/gallery/gallery-6.jpg", alt: "Imagine 6" },
];

/** Telefon românesc, ca în validarea formularelor vechi. */
export const phonePattern = /^(07[1-9]\d{7}|02\d{7}|03\d{7})$/;

/** O consultație durează 15 minute (confirmat de cabinet). */
export const SLOT_MINUTES = 15;

function slots(from: string, to: string): string[] {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const out: string[] = [];
  for (let m = toMin(from); m + SLOT_MINUTES <= toMin(to); m += SLOT_MINUTES) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
}

/**
 * Intervalele de programare ale zilei, din 15 în 15 minute, în programul cabinetului:
 * luni–vineri 09:00–19:00, sâmbătă 09:00–12:00, duminică închis.
 */
export function hoursFor(date: Date): string[] {
  const day = date.getDay();
  if (day === 0) return [];
  if (day === 6) return slots("09:00", "12:00");
  return slots("09:00", "19:00");
}
