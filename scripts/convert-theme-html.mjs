// Convertește HTML-ul paginilor Croogo (markup Bootstrap 5 + Medilab) în același HTML cu clase Tailwind.
// Structura, textele și atributele rămân neschimbate; se înlocuiesc doar clasele și căile imaginilor.

import * as cheerio from "cheerio";
import {
  bootstrap,
  drop,
  gutters,
  keep,
  medilab,
  rowClasses,
  sectionClasses,
  sectionTitle,
} from "../lib/theme-classes.mjs";

const CONTEXTS = ["hero", "about", "services", "doctors", "faq"];

/** Secțiunea Medilab în care se află elementul (hero, about…), pentru regulile pe context. */
function contextOf($, el) {
  const sec = $(el).closest("section");
  const cls = (sec.attr("class") ?? "").split(/\s+/);
  return CONTEXTS.find((c) => cls.includes(c)) ?? "";
}

function convertClasses($, el, ctx, unknown) {
  const classes = ($(el).attr("class") ?? "").split(/\s+/).filter(Boolean);
  const out = [];

  if (classes.includes("section")) {
    out.push(sectionClasses({ light: classes.includes("light-background"), hero: classes.includes("hero") }));
  }
  if (classes.includes("row")) {
    let [gx, gy] = [1.5, 0];
    for (const c of classes) {
      if (gutters[c]) {
        gx = gutters[c][0] ?? gx;
        gy = gutters[c][1] ?? gy;
      }
    }
    out.push(rowClasses(gx, gy));
  }

  for (const c of classes) {
    if (["section", "light-background", "row"].includes(c) || gutters[c]) continue;
    if (keep(c)) {
      out.push(c);
      continue;
    }
    if (c === "section-title") {
      out.push(sectionTitle);
      continue;
    }
    const tw = medilab[`${ctx} ${c}`] ?? medilab[c] ?? bootstrap[c];
    if (tw !== undefined) out.push(tw);
    else if (!drop.has(c)) unknown.add(c);
  }

  const value = out.join(" ").replace(/\s+/g, " ").trim();
  if (value) $(el).attr("class", value);
  else $(el).removeAttr("class");
}

/**
 * @param {string} html HTML-ul din câmpul `body` al unui node Croogo
 * @returns {{ html: string, unknown: string[] }} HTML-ul convertit și clasele necunoscute (de verificat)
 */
export function convertThemeHtml(html) {
  const $ = cheerio.load(html, null, false);
  const unknown = new Set();

  // contextele se citesc înainte de conversie, cât clasele secțiunilor sunt încă cele originale
  const elements = $("[class]").toArray().map((el) => [el, contextOf($, el)]);
  for (const [el, ctx] of elements) convertClasses($, el, ctx, unknown);

  // atribute rămase de la AOS / editor, fără efect
  $("[data-]").removeAttr("data-");

  // căile temei vechi → public/img
  $("img[src], a[href]").each((_, el) => {
    for (const attr of ["src", "href"]) {
      const v = $(el).attr(attr);
      if (v) $(el).attr(attr, v.replace(/^\/theme\/(?:joy_optic|JoyOptic)\/assets\/img\//, "/img/"));
    }
  });

  let out = $.html()
    // paragrafe goale lăsate de editor în jurul comentariilor (<p>​<!-- … --></p>)
    .replace(/<p>​?(<!--[\s\S]*?-->)?<\/p>\s*/g, "$1")
    // date de contact vechi rămase în texte
    .replace(/0722 509 424/g, "0787 698 398")
    .replace(/tel:\+40722509424/g, "tel:+40787698398")
    .replace(/joypatriana8@gmail\.com/g, "contact@joyoptic.ro");

  return { html: out, unknown: [...unknown] };
}
