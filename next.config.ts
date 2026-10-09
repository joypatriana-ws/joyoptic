import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // URL-uri Croogo fără echivalent direct
    return [
      { source: "/promoted", destination: "/", permanent: true },
      { source: "/nodes/promoted", destination: "/", permanent: true },
      { source: "/page", destination: "/", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
