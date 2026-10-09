import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Joy Optic",
    short_name: "Joy Optic",
    description: "Optică Medicală și Oftalmologie",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#28a745",
    icons: [
      { src: "/img/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/img/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
