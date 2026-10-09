// Clasele temei JoyOptic (Medilab + Bootstrap 5) traduse în utilitare Tailwind.
//
// Sunt folosite în două locuri:
//  - de componentele React (header, programare, contact etc.)
//  - de scripts/convert-theme-html.mjs, care convertește HTML-ul paginilor din DB la import.
// Fișierul e scanat de Tailwind (@source în globals.css), deci toate clasele de aici sunt generate.
//
// Fiecare valoare reproduce regula din main.css / bootstrap.css a clasei respective;
// regulile pe descendenți (ex. `.section-title h2::after`) devin variante `[&_h2]:after:…`.

/** Clase Bootstrap simple, independente de context. Utilitarele de spațiere sunt !important, ca în Bootstrap. */
export const bootstrap = {
  container: "container-bs",
  "container-fluid": "w-full px-3 mx-auto",
  "d-flex": "flex",
  "flex-column": "flex-col",
  "align-items-center": "items-center",
  "align-items-start": "items-start",
  "align-items-stretch": "items-stretch",
  "align-self-start": "self-start",
  "justify-content-center": "justify-center",
  "justify-content-between": "justify-between",
  "position-relative": "relative",
  "text-center": "text-center",
  "text-white": "text-white",
  "text-light": "text-[#f8f9fa]",
  "mb-4": "mb-6!",
  "mt-2": "mt-2!",
  "mt-3": "mt-4!",
  "mt-4": "mt-6!",
  "mt-5": "mt-12!",
  "mt-sm-0": "sm:mt-0!",
  "me-1": "me-1!",
  "py-5": "py-12!",
  "pt-3": "pt-4!",
  "img-fluid": "max-w-full h-auto",
  rounded: "rounded-[0.375rem]",
  lead: "text-[1.25rem] font-light",
  "list-group": "flex flex-col pl-0 mb-0 rounded-none",
  "list-group-flush": "",
  "list-group-item":
    "relative block px-4 py-2 text-body bg-white border-b border-black/[.175] last:border-b-0",
  btn: "inline-block px-3 py-1.5 text-center align-middle border border-transparent rounded-[0.375rem]",
  "btn-link": "underline",
  alert: "relative p-4 mb-4 border rounded-[0.375rem]",
  "alert-primary": "text-[#052c65] bg-[#cfe2ff] border-[#9ec5fe]",
  // coloane (în interiorul .row; lățimea implicită 100% vine din row)
  "col-md-2": "md:w-1/6",
  "col-md-4": "md:w-1/3",
  "col-md-6": "md:w-1/2",
  "col-md-12": "md:w-full",
  "col-lg-2": "lg:w-1/6",
  "col-lg-3": "lg:w-1/4",
  "col-lg-4": "lg:w-1/3",
  "col-lg-6": "lg:w-1/2",
  "col-lg-8": "lg:w-2/3",
  "col-lg-10": "lg:w-5/6",
  "col-xl-4": "xl:w-1/3",
  "offset-lg-3": "lg:ml-[25%]",
};

/** .row cu gutter-ele Bootstrap (gx/gy în rem, jumătate pe fiecare parte). */
export function rowClasses(gx = 1.5, gy = 0) {
  const x = {
    0: "mx-0 *:px-0",
    1.5: "-mx-3 *:px-3",
    3: "-mx-6 *:px-6",
  }[gx];
  const y = {
    0: "",
    1.5: "-mt-6 *:mt-6",
  }[gy];
  return `flex flex-wrap ${x} ${y} *:shrink-0 *:w-full *:max-w-full`.trim();
}

/** Gutter-ele Bootstrap folosite: g-0, gx-5, gy-4. */
export const gutters = { "g-0": [0, 0], "gx-5": [3, null], "gy-4": [null, 1.5] };

/**
 * section / .section din main.css. `light` = .light-background (fundal #f1f7fc).
 * Hero-ul își are propriul padding și overflow: hidden, deci nu le primește de aici.
 */
export function sectionClasses({ light = false, hero = false } = {}) {
  return [
    "text-default scroll-mt-[60px] xl:scroll-mt-[72px]",
    light ? "bg-light" : "bg-white",
    hero ? "" : "py-[60px] overflow-clip",
  ]
    .join(" ")
    .trim();
}

/** .section-title (h2 cu cele două linii dedesubt) */
export const sectionTitle = [
  "text-center pb-[50px] relative",
  "[&_h2]:text-[32px] [&_h2]:font-medium [&_h2]:mb-5 [&_h2]:pb-5 [&_h2]:relative",
  "[&_h2]:before:content-[''] [&_h2]:before:absolute [&_h2]:before:block [&_h2]:before:w-40 [&_h2]:before:h-px [&_h2]:before:bg-default/40 [&_h2]:before:inset-x-0 [&_h2]:before:bottom-px [&_h2]:before:m-auto",
  "[&_h2]:after:content-[''] [&_h2]:after:absolute [&_h2]:after:block [&_h2]:after:w-[60px] [&_h2]:after:h-[3px] [&_h2]:after:bg-accent [&_h2]:after:inset-x-0 [&_h2]:after:bottom-0 [&_h2]:after:m-auto",
  "[&_p]:mt-[30px] [&_p]:text-[1.25rem]",
].join(" ");

/**
 * Clase Medilab, pe context (secțiunea în care apar).
 * Cheia `context clasa` are prioritate față de `clasa`.
 */
export const medilab = {
  // ---------- Hero ----------
  hero: [
    "w-full min-h-[calc(100vh-112px)] py-20 flex items-center justify-center relative overflow-hidden",
    "[&>img]:absolute [&>img]:inset-0 [&>img]:block [&>img]:w-full [&>img]:h-full [&>img]:object-cover [&>img]:z-[1]",
    "max-md:min-h-[56vh] max-md:py-10 max-md:items-start max-md:[&>img]:hidden",
    "[&>.container-bs]:z-[3]",
  ].join(" "),
  "hero welcome": [
    "[&_h2]:m-0 [&_h2]:text-[48px] [&_h2]:font-bold [&_p]:m-0 [&_p]:text-[24px]",
    // în main.css mărimile de mobil (28px / 16px) sunt anulate de regula de desktop scrisă după @media;
    // pe mobil rămân doar alinierea la stânga și culorile verzi
    "max-md:[&_h2]:text-left max-md:[&_h2]:text-accent!",
    "max-md:[&_p]:text-left max-md:[&_p]:text-[color-mix(in_srgb,var(--color-accent),white_30%)]!",
  ].join(" "),
  "hero content": "mt-10!",
  "hero why-box": [
    "text-white bg-accent p-[30px] rounded",
    "[&_h3]:text-white [&_h3]:font-bold [&_h3]:text-[34px] [&_h3]:mb-[30px] [&_p]:mb-[30px]",
  ].join(" "),
  "hero more-btn": [
    "text-white bg-white/20 inline-block pt-1.5 pb-2 px-[30px] rounded-[50px] transition-all duration-400 ease-in-out",
    "hover:bg-white hover:text-accent [&_i]:text-[14px]",
  ].join(" "),
  "hero icon-box": [
    "text-center rounded-[10px] bg-white/80 shadow-[0px_2px_15px_rgba(0,0,0,0.1)] pt-5 px-5 pb-10 w-full",
    "[&_img]:w-auto [&_img]:h-[70px] [&_img]:block [&_img]:mx-auto [&_img]:relative",
    "[&_h4]:text-[20px] [&_h4]:font-bold [&_h4]:mt-2.5 [&_h4]:mb-5",
    "[&_p]:text-[16px] [&_p]:text-default/70",
  ].join(" "),
  "hero i": "",

  // ---------- About ----------
  "about content": [
    "[&_h3]:text-[2rem] [&_h3]:font-bold",
    "[&_ul]:list-none [&_ul]:p-0 [&_li]:flex [&_li]:items-center [&_li]:mt-10 [&_li]:text-[1.1rem]",
    "[&_ul_i]:shrink-0 [&_ul_i]:text-[48px] [&_ul_i]:text-accent [&_ul_i]:mr-5",
    "[&_p:last-child]:mb-0",
  ].join(" "),

  // ---------- Services ----------
  "service-item": [
    "group bg-surface text-center border border-default/15 py-20 px-5 transition-all duration-300 ease-in-out h-full",
    "hover:bg-accent hover:border-accent",
    "[&_h3]:font-bold [&_h3]:mt-2.5 [&_h3]:mb-[15px] [&_h3]:text-[22px]",
    "[&_p]:leading-[1.4] [&_p]:text-[1.1rem] [&_p]:mb-0",
    "hover:[&_h3]:text-white hover:[&_p]:text-white",
  ].join(" "),
  "services icon": [
    "relative mx-auto w-16 h-16 bg-accent rounded flex items-center justify-center mb-5 transition duration-300 transform-3d",
    "before:content-[''] before:absolute before:-left-2 before:-top-2 before:h-full before:w-full before:bg-accent/20 before:rounded-[5px] before:transition-all before:duration-300 before:ease-out before:-translate-z-px",
    "[&_i]:text-white [&_i]:text-[28px] [&_i]:transition [&_i]:duration-300",
    "group-hover:bg-surface group-hover:before:bg-white/30 group-hover:[&_i]:text-accent",
  ].join(" "),

  // ---------- Doctors ----------
  "team-member": [
    "bg-surface shadow-[0px_2px_15px_rgba(0,0,0,0.1)] relative rounded-[5px] transition duration-500 p-[30px] h-full hover:-translate-y-2.5",
    "max-[468px]:flex-col max-[468px]:justify-center! max-[468px]:items-center!",
    "[&_h4]:font-bold [&_h4]:mb-[5px] [&_h4]:text-[20px]",
    "[&_span]:block [&_span]:text-[15px] [&_span]:pb-2.5 [&_span]:relative [&_span]:font-medium",
    "[&_span]:after:content-[''] [&_span]:after:absolute [&_span]:after:block [&_span]:after:w-[50px] [&_span]:after:h-px [&_span]:after:bg-default/15 [&_span]:after:bottom-0 [&_span]:after:left-0",
    "max-[468px]:[&_span]:after:left-[calc(50%-25px)]",
    "[&_p]:mt-2.5 [&_p]:mb-0 [&_p]:text-[14px]",
  ].join(" "),
  pic: "overflow-hidden w-[150px] rounded-full shrink-0 [&_img]:transition [&_img]:duration-300",
  "member-info": "pl-[30px] max-[468px]:pt-[30px] max-[468px]:pl-0 max-[468px]:text-center",

  // ---------- FAQ (deschiderea: data-active pus de components/theme-scripts.tsx) ----------
  "faq-container": "",
  "faq-item": [
    "faq-item group relative p-5 mb-[15px] last:mb-0 bg-white border border-accent/25 rounded-[5px] overflow-hidden",
    "data-active:bg-accent data-active:border-accent data-active:text-white",
  ].join(" "),
  "faq-question": [
    "font-medium text-[18px] leading-6 mt-0 mb-0 ml-0 mr-[30px] transition duration-300 cursor-pointer flex items-center",
    "hover:text-accent group-data-active:text-white group-data-active:hover:text-white",
  ].join(" "),
  "faq-content": [
    "grid grid-rows-[0fr] transition-all duration-300 ease-in-out invisible opacity-0",
    "group-data-active:grid-rows-[1fr] group-data-active:visible group-data-active:opacity-100 group-data-active:pt-2.5",
    "[&_p]:mb-0 [&_p]:overflow-hidden",
  ].join(" "),
  "faq-toggle": [
    "faq-toggle absolute top-5 right-5 text-[16px] leading-0 transition duration-300 cursor-pointer",
    "hover:text-accent group-data-active:rotate-90 group-data-active:text-accent",
  ].join(" "),

  // ---------- Blog ----------
  "blog-content": "",
};

/** Clase păstrate ca atare: iconițe (fontul bootstrap-icons) și cârligele pentru JS. */
export const keep = (c) => c === "bi" || c.startsWith("bi-") || c === "glightbox";

/** Clase de rulare (AOS, lazy-load) sau de secțiune, eliminate din HTML. */
export const drop = new Set(["aos-init", "aos-animate", "lazy-load", "i", "about", "services", "doctors", "faq"]);
