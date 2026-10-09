// Conținutul fix al site-ului, preluat de pe joyoptic.ro (tema Croogo JoyOptic).

export const site = {
  name: "Joy Optic",
  tagline: "Optică medicală și oftalmologie",
  url: "https://joyoptic.ro",
  email: "contact@joyoptic.ro",
  phone: "0787 698 398",
  phoneHref: "tel:+40787698398",
  address: "Str. Republicii nr. 19",
  city: "Câmpina",
  county: "Prahova",
  postcode: "105600",
  facebook: "https://www.facebook.com/joyoptic08/",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2830.212136933364!2d25.733491!3d45.1256073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b3007850198c7f%3A0x7608a986b0854d92!2sJOY%20OPTIC!5e0!3m2!1sro!2sro!4v1708600000000",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=JOY+OPTIC+C%C3%A2mpina",
};

// day: 0 = duminică … 6 = sâmbătă, ca Date.getDay()
export const schedule = [
  { label: "Luni – Vineri", days: [1, 2, 3, 4, 5], open: "09:00", close: "19:00" },
  { label: "Sâmbătă", days: [6], open: "09:00", close: "12:00" },
  { label: "Duminică", days: [0], open: null, close: null },
] as const;

export const nav = [
  { title: "Servicii", href: "/#servicii" },
  { title: "Echipa", href: "/#echipa" },
  { title: "Întrebări frecvente", href: "/page/faq" },
  { title: "Contact", href: "/contact" },
];

export const services = [
  {
    title: "Consultații oftalmologice",
    text: "Evaluare făcută de medici oftalmologi, cu măsurători precise și recomandări explicate pe înțeles.",
    href: "/page/consultatii-oftalmologice",
  },
  {
    title: "Examen oftalmologic pentru permis auto",
    text: "Avizul oftalmologic pentru permis, eliberat în aceeași vizită.",
    href: "/page/examen-oftalmologic-pentru-permis-auto",
  },
  {
    title: "Prescriere ochelari",
    text: "Rețetă corectă și sfaturi pentru rame și lentile potrivite stilului și activității tale.",
    href: "/page/prescriere-ochelari",
  },
  {
    title: "Lentile de contact",
    text: "Găsim lentilele potrivite, le probăm împreună și îți arătăm cum să le porți și să le întreții.",
  },
  {
    title: "Diagnostic și monitorizare",
    text: "Depistăm și urmărim afecțiunile ochilor cu investigații moderne, apoi îți explicăm opțiunile de tratament.",
  },
  {
    title: "Rame, ochelari de soare și montaj",
    text: "Rame și lentile cu protecție UV, montate și ajustate în cabinet cu aparatură automatizată.",
  },
];

export const team = [
  { name: "Dr. Daniela Anghelache", role: "Medic primar oftalmolog", note: "Diagnostic și tratamente oftalmologice." },
  { name: "Dr. Sorin Bărbuceanu", role: "Medic primar oftalmolog", note: "Consultații și tratamente oftalmologice." },
  { name: "Dr. Ioana Claudia Popteanu", role: "Medic specialist oftalmologie", note: "Diagnostic și tratament pentru afecțiuni oculare, inclusiv la copii." },
  { name: "Denisa Munteanu", role: "Optometrist", note: "Măsurători optometrice și prescripția ochelarilor." },
  { name: "Melania Apostu", role: "Consultant vânzări", note: "Te ajută să alegi ramele și lentilele potrivite." },
];

// Valorile `value` trebuie să rămână identice cu cele din programările vechi (câmpul doctor).
export const doctors = [
  { value: "Dr. ANGHELACHE Daniela", label: "Dr. Daniela Anghelache — oftalmologie" },
  { value: "Dr. BARBUCEANU Sorin", label: "Dr. Sorin Bărbuceanu — oftalmologie" },
  { value: "Dr. Popteanu Ioana Claudia", label: "Dr. Ioana Claudia Popteanu — oftalmopediatrie" },
];

export const bookingTypes = [
  { id: 1, title: "Consultație oftalmologică generală" },
  { id: 2, title: "Prescripție și adaptare optică" },
  { id: 3, title: "Consultație de specialitate" },
  { id: 4, title: "Control periodic" },
];

export const contactSubjects = [
  "Consultație oftalmologică",
  "Prescripție ochelari",
  "Examen oftalmologic permis auto",
  "Lentile de contact",
  "Comenzi și livrări",
  "Programare",
  "Altceva",
];

export const gallery = [
  "/img/gallery/gallery-2.jpg",
  "/img/gallery/gallery-4.jpg",
  "/img/gallery/gallery-5.jpg",
  "/img/gallery/gallery-6.jpg",
];

/** Orele de programare (din oră în oră, ca pe site-ul vechi) pentru ziua dată, sau [] dacă e închis. */
export function slotsFor(date: Date): string[] {
  const day = schedule.find((s) => (s.days as readonly number[]).includes(date.getDay()));
  if (!day?.open || !day.close) return [];
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const out: string[] = [];
  for (let m = toMin(day.open); m < toMin(day.close); m += 60) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
}
