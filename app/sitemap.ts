import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const pages = [
  "about-us",
  "services",
  "doctors",
  "appointment",
  "gallery",
  "examen-oftalmologic-pentru-permis-auto",
  "consultatii-oftalmologice",
  "prescriere-ochelari",
  "lentile-de-contact",
  "faq",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, priority: 1 },
    { url: `${site.url}/contact` },
    { url: `${site.url}/blog/importanta-unui-consult-oftalmologic-regulat` },
    ...pages.map((slug) => ({ url: `${site.url}/page/${slug}` })),
  ];
}
