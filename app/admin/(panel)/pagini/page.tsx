import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { connectDb } from "@/lib/db";
import { Page } from "@/lib/models";

export const dynamic = "force-dynamic";

/** Paginile site-ului (nodurile „page” din Croogo). */
export default async function PaginaPagini() {
  await connectDb();
  const pagini = await Page.find().sort({ legacyId: 1 }).lean();

  return (
    <div className="max-w-4xl">
      <h1 className="m-0 text-xl font-semibold text-gray-900">Pagini</h1>
      <div className="mt-0.5 mb-6 text-sm text-gray-400">
        Paginile marcate „Pe prima pagină” apar ca secțiuni pe pagina principală, în ordinea de mai jos.
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Pagină</th>
              <th className="hidden px-4 py-3 sm:table-cell">Stare</th>
              <th className="px-4 py-3 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagini.map((p) => {
              const special = p.legacySlug === "appointment" || p.legacySlug === "gallery";
              const url = p.legacySlug === "hero" ? "/" : `/${p.slug}`;
              return (
                <tr key={String(p._id)}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.legacySlug === "hero" ? "Secțiunea de sus a primei pagini" : url}</div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {p.published ? (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-[#1e7e34]">Publicată</span>
                      ) : p.legacySlug !== "hero" ? (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Nepublicată</span>
                      ) : null}
                      {p.promoted && <span className="rounded-full bg-[#e0f2fe] px-2 py-0.5 text-xs text-[#075985]">Pe prima pagină</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {!special && (
                        <Link
                          href={`/admin/pagini/${String(p._id)}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil size={14} /> Editează
                        </Link>
                      )}
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        title="Vezi pe site"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-gray-400">
        „Programare” și „Galerie” sunt formularul de programare și galeria temei; conținutul lor nu se editează ca text.
      </div>
    </div>
  );
}
