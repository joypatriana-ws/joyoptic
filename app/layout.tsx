import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { site } from "@/lib/site";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline} în ${site.city}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Cabinet de optică medicală și oftalmologie în Câmpina: consultații oftalmologice, examen pentru permis auto, prescriere ochelari și lentile de contact.",
  openGraph: {
    siteName: site.name,
    locale: "ro_RO",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/img/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/img/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/img/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={atkinson.variable}>
      <body>
        <a
          href="#continut"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2"
        >
          Sari la conținut
        </a>
        <Header />
        <main id="continut">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
