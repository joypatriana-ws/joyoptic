import { Appointment } from "@/components/theme/appointment";
import { Contact } from "@/components/theme/contact";
import { Gallery } from "@/components/theme/gallery";
import { NodeBody } from "@/components/theme/node-body";
import { listPromotedPages } from "@/lib/content";

export const revalidate = 300;

/** Nodes/promoted.ctp: hero, apoi paginile promovate în ordine, apoi contactul. */
export default async function Home() {
  const pages = await listPromotedPages();
  const hero = pages.find((p) => p.slug === "hero");

  return (
    <>
      {hero && <NodeBody html={hero.bodyHtml} />}
      {pages
        .filter((p) => p.slug !== "hero")
        .map((p) =>
          p.slug === "gallery" ? (
            <Gallery key={p.slug} />
          ) : p.slug === "appointment" ? (
            <Appointment key={p.slug} />
          ) : (
            <NodeBody key={p.slug} html={p.bodyHtml} />
          ),
        )}
      <Contact />
    </>
  );
}
