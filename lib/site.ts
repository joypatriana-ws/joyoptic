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
  facebook: "https://www.facebook.com/joyoptic08/",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2830.212136933364!2d25.733491!3d45.1256073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b3007850198c7f%3A0x7608a986b0854d92!2sJOY%20OPTIC!5e0!3m2!1sen!2sro!4v1708600000000",
};

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

/** Tabela booking_types („Selectează departamentul"). */
export const bookingTypes = [
  { id: 1, title: "Consultații oftalmologice generale" },
  { id: 2, title: "Prescripții și adaptări optice" },
  { id: 3, title: "Consultații specializate" },
  { id: 4, title: "Monitorizare și controale periodice" },
];

/** Medicii din formularul de programare (Elements/home_appointment.ctp). */
export const doctors = [
  { name: "Dr. ANGHELACHE Daniela", specialization: "Oftalmologie" },
  { name: "Dr. BARBUCEANU Sorin", specialization: "Optometrie" },
  { name: "Dr. Popteanu Ioana Claudia", specialization: "Oftalmopediatrie" },
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

const workHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

/**
 * Orele din select-ul de programare: 09:00–19:00, sâmbăta până la 12:00, duminica închis.
 * (Pe site-ul vechi filtrul de sâmbătă se aplica după ziua de azi; aici după ziua aleasă.)
 */
export function hoursFor(date: Date): string[] {
  const day = date.getDay();
  if (day === 0) return [];
  if (day === 6) return workHours.filter((h) => h <= "12:00");
  return workHours;
}
