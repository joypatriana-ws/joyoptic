import type { Metadata } from "next";
import { Poppins, Raleway, Roboto } from "next/font/google";
import { Flash } from "@/components/theme/flash";
import { Footer } from "@/components/theme/footer";
import { Header } from "@/components/theme/header";
import { Preloader } from "@/components/theme/preloader";
import { ScrollTop } from "@/components/theme/scroll-top";
import { ThemeScripts } from "@/components/theme/theme-scripts";
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
  icons: { icon: "/img/favicon.ico", apple: "/img/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={`${roboto.variable} ${poppins.variable} ${raleway.variable}`}>
      <body className="index-page">
        <Header />
        <main className="main">
          <Flash />
          {children}
        </main>
        <Footer />
        <ScrollTop />
        <Preloader />
        <ThemeScripts />
      </body>
    </html>
  );
}
