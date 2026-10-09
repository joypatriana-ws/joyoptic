import { isValidObjectId } from "mongoose";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Page } from "@/lib/models";
import EditorPagina from "./EditorPagina";

export const dynamic = "force-dynamic";

export default async function EditarePagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDb();
  const p = await Page.findById(id).lean();
  if (!p) notFound();

  return (
    <EditorPagina
      pagina={{
        id: String(p._id),
        titlu: p.title,
        html: p.bodyHtml,
        publicata: Boolean(p.published),
        pePrimaPagina: Boolean(p.promoted),
        url: p.legacySlug === "hero" ? "/" : `/${p.slug}`,
        eHero: p.legacySlug === "hero",
      }}
    />
  );
}
