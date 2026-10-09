import type { Metadata } from "next";
import { Poppins, Raleway, Roboto } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Fonturile temei Medilab: Roboto (text), Poppins (titluri), Raleway (meniu)
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin", "latin-ext"], weight: ["300", "400", "500", "700"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"] });
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin", "latin-ext"], weight: ["400", "500"] });

// Meta din setările Croogo (Meta.description, Meta.keywords, Meta.robots)
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Bine ati venit",
  description: "Optică Medicală și Oftalmologie",
  keywords: "joy optic",
  robots: "index, follow",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={`${roboto.variable} ${poppins.variable} ${raleway.variable}`}>
      <body>{children}</body>
    </html>
  );
}
