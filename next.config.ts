import type { NextConfig } from "next";
import { pageSlugs } from "./lib/slugs.mjs";

const nextConfig: NextConfig = {
  // build-urile de test (ex. ale lui Claude) pot folosi alt folder, ca să nu strice cache-ul lui `pnpm dev` din .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    return [
      // /page/<slug> din Croogo → URL-ul nou în română, la rădăcină
      ...Object.entries(pageSlugs).map(([legacy, slug]) => ({
        source: `/page/${legacy}`,
        destination: legacy === "hero" ? "/" : `/${slug}`,
        statusCode: 301 as const,
      })),
      // URL-uri Croogo fără echivalent direct
      { source: "/page", destination: "/", statusCode: 301 as const },
      { source: "/promoted", destination: "/", statusCode: 301 as const },
      { source: "/nodes/promoted", destination: "/", statusCode: 301 as const },
      { source: "/blog", destination: "/", statusCode: 301 as const },
    ];
  },
};

export default nextConfig;
