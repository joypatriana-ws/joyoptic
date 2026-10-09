import Link from "next/link";
import { schedule, services, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 bg-cerneala text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">{site.name}</p>
          <address className="mt-3 not-italic leading-relaxed">
            {site.address}
            <br />
            {site.city}, {site.county}
            <br />
            <a href={site.phoneHref} className="hover:text-white">{site.phone}</a>
            <br />
            <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
          </address>
        </div>

        <div>
          <p className="font-bold text-white">Program</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
            {schedule.map((s) => (
              <div key={s.label} className="contents">
                <dt>{s.label}</dt>
                <dd>{s.open ? `${s.open} – ${s.close}` : "Închis"}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className="font-bold text-white">Servicii</p>
          <ul className="mt-3 space-y-1">
            {services
              .filter((s) => s.href)
              .map((s) => (
                <li key={s.href}>
                  <Link href={s.href!} className="hover:text-white">
                    {s.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-5 text-sm sm:px-6">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <a href={site.facebook} className="hover:text-white">
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
