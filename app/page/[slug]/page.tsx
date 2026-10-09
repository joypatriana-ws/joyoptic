import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Appointment } from "@/components/theme/appointment";
import { Gallery } from "@/components/theme/gallery";
import { NodeBody } from "@/components/theme/node-body";
import { getPage } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  return page ? { title: page.title, alternates: { canonical: `/page/${page.slug}` } } : {};
}

/** Nodes/view_page.ctp: corpul paginii + formularul de programare. Galeria are șablonul ei (view_8.ctp). */
export default async function NodePage({ params }: Props) {
  const page = await getPage((await params).slug);
  if (!page) notFound();

  if (page.slug === "gallery") return <Gallery />;

  return (
    <>
      <NodeBody html={page.bodyHtml} />
      <Appointment />
    </>
  );
}
