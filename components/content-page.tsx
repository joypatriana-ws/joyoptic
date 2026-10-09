import Link from "next/link";
import type { ContentItem } from "@/lib/content";

/** Pagină de conținut (serviciu, FAQ, articol), cu îndemn la programare la final. */
export function ContentPage({ item, kicker }: { item: ContentItem; kicker?: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 md:pt-20">
      {kicker}
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{item.title}</h1>
      <div className="continut mt-8 text-lg" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />

      <aside className="mt-16 flex max-w-[68ch] flex-wrap items-center justify-between gap-4 rounded-lg bg-ceata p-6">
        <p className="text-lg font-bold">Vrei să vii la o consultație?</p>
        <Link href="/#programare" className="rounded-md bg-lentila px-5 py-3 font-bold text-white hover:bg-lentila-2">
          Programează-te online
        </Link>
      </aside>
    </article>
  );
}
