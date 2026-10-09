import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { pageSlugs } from "@/lib/slugs.mjs";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = Object.entries(pageSlugs)
    .filter(([legacy]) => legacy !== "hero")
    .map(([, slug]) => ({ url: `${site.url}/${slug}` }));

  return [
    { url: site.url, priority: 1 },
    { url: `${site.url}/contact` },
    ...pages,
    { url: `${site.url}/blog/importanta-unui-consult-oftalmologic-regulat` },
  ];
}
