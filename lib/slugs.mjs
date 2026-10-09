// Slug-urile paginilor: vechiul /page/<slug> din Croogo → URL-ul nou în română, la rădăcină.
// Folosit de scripts/import-from-sql.mjs (slug-ul salvat în DB) și de next.config.ts (redirect 301).

export const pageSlugs = {
  "about-us": "despre-noi",
  services: "servicii",
  doctors: "echipa",
  faq: "intrebari-frecvente",
  appointment: "programare",
  gallery: "galerie",
  "examen-oftalmologic-pentru-permis-auto": "examen-oftalmologic-pentru-permis-auto",
  "consultatii-oftalmologice": "consultatii-oftalmologice",
  "prescriere-ochelari": "prescriere-ochelari",
  "lentile-de-contact": "lentile-de-contact",
  // hero-ul e doar secțiune pe prima pagină, nu are URL propriu
  hero: "hero",
};

/** URL-ul nou al unei pagini, după slug-ul vechi din Croogo. */
export const pagePath = (legacySlug) => `/${pageSlugs[legacySlug] ?? legacySlug}`;

// Id-urile secțiunilor (ancorele din meniu): id-ul din tema veche → id-ul în română.
export const sectionIds = {
  hero: "acasa",
  about: "despre-noi",
  services: "servicii",
  "special-offers": "oferte",
  doctors: "echipa",
  appointment: "programare",
  gallery: "galerie",
  faq: "intrebari-frecvente",
  contact: "contact",
};

/** id-ul în română al unei secțiuni din tema veche */
export const sectionId = (legacyId) => sectionIds[legacyId] ?? legacyId;
