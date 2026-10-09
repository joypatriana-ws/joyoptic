"use client";

// După MessagesClient din kulttur: lista din stânga, mesajul deschis în dreapta.

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Mail, MailOpen, Phone, Reply, Tag, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";

const PAGE_SIZE = 20;

export type Mesaj = {
  id: string;
  nume: string;
  email: string;
  telefon: string | null;
  subiect: string | null;
  mesaj: string;
  citit: boolean;
  creatLa: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "acum";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d === 1) return "ieri";
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export default function MesajeClient({ mesaje: initiale }: { mesaje: Mesaj[] }) {
  const router = useRouter();
  const [mesaje, setMesaje] = useState(initiale);
  const [selectat, setSelectat] = useState<string | null>(null);
  const [deSters, setDeSters] = useState<Mesaj | null>(null);
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement | null>(null);

  const necitite = mesaje.filter((m) => !m.citit).length;
  const deschis = mesaje.find((m) => m.id === selectat) ?? null;

  const pageCount = Math.max(1, Math.ceil(mesaje.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagina = useMemo(() => mesaje.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [mesaje, safePage]);

  const goToPage = (next: number) => {
    setPage(Math.max(1, Math.min(pageCount, next)));
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0 }));
  };

  const marcheaza = (id: string, citit: boolean) => {
    setMesaje((prev) => prev.map((m) => (m.id === id ? { ...m, citit } : m)));
    startTransition(async () => {
      await fetch(`/api/admin/mesaje/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citit }),
      });
      router.refresh(); // numărul de necitite din sidebar
    });
  };

  const sterge = (id: string) => {
    setDeSters(null);
    setMesaje((prev) => prev.filter((m) => m.id !== id));
    if (selectat === id) setSelectat(null);
    startTransition(async () => {
      await fetch(`/api/admin/mesaje/${id}`, { method: "DELETE" });
      router.refresh();
    });
  };

  const deschide = (id: string) => {
    setSelectat(id);
    const m = mesaje.find((x) => x.id === id);
    if (m && !m.citit) marcheaza(id, true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div>
        <h1 className="m-0 text-xl font-semibold text-gray-900">Mesaje</h1>
        <div className="mt-0.5 text-sm text-gray-400">
          {mesaje.length} mesaje{necitite > 0 && ` • ${necitite} necitite`} · din formularul de contact de pe site
        </div>
      </div>

      <div className="flex min-h-[28rem] flex-1 gap-4">
        {/* Lista */}
        <div className={`w-full shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white md:flex md:w-80 ${deschis ? "hidden" : "flex"}`}>
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {mesaje.length === 0 && <div className="flex h-full items-center justify-center text-sm text-gray-300">Niciun mesaj</div>}
            {pagina.map((m) => (
              <button
                key={m.id}
                onClick={() => deschide(m.id)}
                className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${selectat === m.id ? "bg-gray-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {m.citit ? (
                      <MailOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" />
                    ) : (
                      <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    )}
                    <div className="min-w-0">
                      <div className={`truncate text-sm ${m.citit ? "text-gray-500" : "font-medium text-gray-900"}`}>{m.nume}</div>
                      <div className="truncate text-xs text-gray-400">{m.email}</div>
                    </div>
                  </div>
                  <span className="mt-0.5 shrink-0 text-[10px] text-gray-300">{timeAgo(m.creatLa)}</span>
                </div>
                {m.subiect && <div className="mt-1 truncate pl-5 text-xs text-gray-400">{m.subiect}</div>}
              </button>
            ))}
          </div>
          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-gray-50/60 px-3 py-2">
              <button
                type="button"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage <= 1}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Înapoi
              </button>
              <span className="text-xs tabular-nums text-gray-500">
                {safePage} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage >= pageCount}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Înainte <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mesajul deschis */}
        <div className={`flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white ${deschis ? "block" : "hidden md:block"}`}>
          {!deschis ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-300">Selectează un mesaj</div>
          ) : (
            <div className="space-y-5 p-6">
              <button type="button" onClick={() => setSelectat(null)} className="inline-flex items-center gap-1 text-xs text-gray-500 md:hidden">
                <ChevronLeft className="h-3.5 w-3.5" /> Toate mesajele
              </button>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="m-0 text-lg font-semibold text-gray-900">{deschis.nume}</h2>
                  <span className="select-all text-sm text-gray-600">{deschis.email}</span>
                  {deschis.telefon && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <a href={`tel:${deschis.telefon}`} className="text-sm text-gray-500 hover:text-gray-800">
                        {deschis.telefon}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={`mailto:${deschis.email}?subject=${encodeURIComponent(`Re: ${deschis.subiect ?? "mesajul tău către Joy Optic"}`)}`}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-400 transition hover:text-gray-600"
                    title="Răspunde prin email"
                  >
                    <Reply className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => marcheaza(deschis.id, !deschis.citit)}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-400 transition hover:text-gray-600"
                    title={deschis.citit ? "Marchează ca necitit" : "Marchează ca citit"}
                  >
                    {deschis.citit ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setDeSters(deschis)}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-red-400/60 transition hover:text-red-400"
                    title="Șterge"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {deschis.subiect && (
                  <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                    <Tag className="h-3 w-3" /> {deschis.subiect}
                  </span>
                )}
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-400">
                  {new Date(deschis.creatLa).toLocaleString("ro-RO")}
                </span>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-600">{deschis.mesaj}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deSters !== null}
        title="Ștergi mesajul?"
        message={deSters ? `Mesajul de la ${deSters.nume} dispare definitiv.` : undefined}
        confirmLabel="Șterge"
        variant="danger"
        onConfirm={() => deSters && sterge(deSters.id)}
        onCancel={() => setDeSters(null)}
      />
    </div>
  );
}
