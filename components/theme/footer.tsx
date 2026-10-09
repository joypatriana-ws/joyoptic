import Link from "next/link";
import { rowClasses } from "@/lib/theme-classes.mjs";
import { footerMenu, servicesMenu, site } from "@/lib/site";

const legalMenu = [
  { href: "/politica-de-confidentialitate", title: "Politica de confidențialitate" },
  { href: "/cookies", title: "Politica de cookie-uri" },
];

const linksCol = "mb-[30px] md:w-1/4 lg:w-1/6";
const h4 = "relative pb-3 text-[16px] font-bold";
const ul = "m-0 list-none p-0";
const li = "flex items-center py-2.5 first:pt-0";
const a = "inline-block leading-none text-default/70 hover:text-accent";

/** <footer id="footer" class="footer light-background"> din Layouts/promoted.ctp */
export function Footer() {
  return (
    <footer id="footer" className="relative border-t border-accent/25 bg-light text-[14px] text-default">
      <div className="container-bs pt-[50px]">
        <div className={rowClasses(1.5, 1.5)}>
          {/* Despre Joy Optic */}
          <div className="md:w-1/2 lg:w-1/4">
            <Link href="/" className="mb-[25px] flex items-center leading-none">
              <span className="font-heading text-[26px] font-bold tracking-[1px] text-heading">{site.name}</span>
            </Link>
            <div className="pt-4 [&_p]:mb-[5px] [&_p]:font-heading [&_p]:text-[14px]">
              <p>{site.address}</p>
              <p>Câmpina, Prahova</p>
              <p className="mt-4">
                <strong>Telefon:</strong> <span>{site.phone}</span>
              </p>
              <p>
                <strong>Email:</strong> <span>{site.email}</span>
              </p>
            </div>
            <div className="mt-6 flex">
              <a
                href={site.facebook}
                className="mr-2.5 flex h-10 w-10 items-center justify-center rounded-full border border-default/50 text-[16px] text-default/80 transition duration-300 hover:border-accent hover:text-accent"
              >
                <i className="bi bi-facebook" />
              </a>
            </div>
          </div>

          {/* Linkuri Utile */}
          <div className={linksCol}>
            <h4 className={h4}>Linkuri Utile</h4>
            <ul className={ul}>
              {footerMenu.map((l) => (
                <li key={l.href} className={li}>
                  <Link href={l.href} className={a}>
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicii */}
          <div className={linksCol}>
            <h4 className={h4}>Serviciile Noastre</h4>
            <ul className={ul}>
              {servicesMenu.map((l) => (
                <li key={l.href} className={li}>
                  <Link href={l.href} className={a}>
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informații legale (ca în NovaFit) */}
          <div className="mb-[30px] md:w-1/2 lg:w-1/6">
            <h4 className={h4}>Informații legale</h4>
            <ul className={ul}>
              {legalMenu.map((l) => (
                <li key={l.href} className={li}>
                  <Link href={l.href} className={a}>
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Program */}
          <div className="mb-[30px] md:w-1/2 lg:w-1/4">
            <h4 className={h4}>Program</h4>
            <ul className={ul}>
              <li className={li}>
                <strong className="me-1">Luni - Vineri:</strong> 09:00 - 19:00
              </li>
              <li className={li}>
                <strong className="me-1">Sâmbătă:</strong> 09:00 - 12:00
              </li>
              <li className={li}>
                <strong className="me-1">Duminică:</strong> Închis
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container-bs mt-6 border-t border-default/10 py-[25px] text-center">
        <p className="mb-0">
          © {new Date().getFullYear()} <strong className="px-1">{site.name}</strong> | Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  );
}
