import type { NextConfig } from "next";

// URL-urile Croogo care pe site-ul nou sunt secțiuni ale paginii principale.
// Fragmentul (#…) nu ajunge la server, deci redirecționăm către pagina principală cu ancoră.
const homeSections: Record<string, string> = {
  hero: "/",
  "about-us": "/#despre",
  services: "/#servicii",
  doctors: "/#echipa",
  appointment: "/#programare",
  gallery: "/",
};

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/promoted", destination: "/", permanent: true },
      { source: "/page", destination: "/", permanent: true },
      { source: "/nodes/promoted", destination: "/", permanent: true },
      ...Object.entries(homeSections).map(([slug, destination]) => ({
        source: `/page/${slug}`,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
