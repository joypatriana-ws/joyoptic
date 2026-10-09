"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

type Oferta = { media: string; title: string; html: string };

const ICONITE = [
  { src: "/img/offers/offer1.svg", nume: "Ochelari" },
  { src: "/img/offers/offer2.svg", nume: "Etichetă reducere" },
  { src: "/img/offers/offer3.svg", nume: "Ochi" },
];

const camp = "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-accent";
const eticheta = "block text-xs font-medium text-gray-600";

/** Secțiunea „Oferte Speciale” de pe prima pagină: pornită / oprită și textele cardurilor. */
export default function OferteClient({ activ: initialActiv, oferte: initiale }: { activ: boolean; oferte: Oferta[] }) {
  const [activ, setActiv] = useState(initialActiv);
  const [oferte, setOferte] = useState(initiale);
  const [salveaza, setSalveaza] = useState(false);
  const [mesaj, setMesaj] = useState<{ ok: boolean; text: string } | null>(null);

  async function trimite(body: object, ok: string) {
    setSalveaza(true);
    setMesaj(null);
    const r = await fetch("/api/admin/oferte", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSalveaza(false);
    if (!r.ok) {
      setMesaj({ ok: false, text: ((await r.json()) as { error?: string }).error ?? "Nu s-a putut salva." });
      return false;
    }
    setMesaj({ ok: true, text: ok });
    return true;
  }

  async function comuta() {
    const nou = !activ;
    if (await trimite({ activ: nou }, nou ? "Ofertele apar acum pe site." : "Ofertele au fost ascunse de pe site.")) setActiv(nou);
  }

  const schimba = (i: number, cheie: keyof Oferta, valoare: string) =>
    setOferte((l) => l.map((o, j) => (j === i ? { ...o, [cheie]: valoare } : o)));

  return (
    <div className="max-w-3xl">
      <h1 className="m-0 text-xl font-semibold text-gray-900">Oferte</h1>
      <div className="mt-0.5 mb-6 text-sm text-gray-400">Secțiunea „Oferte Speciale” de pe prima pagină și linkul „Oferte” din meniu.</div>

      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <div className="font-medium text-gray-900">{activ ? "Ofertele sunt afișate pe site" : "Ofertele sunt ascunse"}</div>
          <div className="mt-0.5 text-sm text-gray-500">
            {activ ? "Apar pe prima pagină și în meniu." : "Nu apar nici pe prima pagină, nici în meniu."}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={activ}
          aria-label="Afișează ofertele pe site"
          disabled={salveaza}
          onClick={comuta}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${activ ? "bg-accent" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${activ ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      {mesaj && (
        <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${mesaj.ok ? "bg-accent/10 text-[#1e7e34]" : "bg-red-50 text-red-700"}`}>{mesaj.text}</div>
      )}

      <div className="space-y-4">
        {oferte.map((o, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Oferta {i + 1}</span>
              {oferte.length > 1 && (
                <button
                  type="button"
                  onClick={() => setOferte((l) => l.filter((_, j) => j !== i))}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={13} /> Scoate
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <label className="block">
                <span className={eticheta}>Titlu</span>
                <input value={o.title} onChange={(e) => schimba(i, "title", e.target.value)} className={camp} />
              </label>
              <label className="block">
                <span className={eticheta}>Iconiță</span>
                <select value={o.media} onChange={(e) => schimba(i, "media", e.target.value)} className={camp}>
                  {ICONITE.map((ic) => (
                    <option key={ic.src} value={ic.src}>
                      {ic.nume}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className={eticheta}>Text</span>
                <textarea value={o.html} onChange={(e) => schimba(i, "html", e.target.value)} rows={3} className={camp} />
                <span className="mt-1 block text-[11px] text-gray-400">
                  Pentru text îngroșat scrie {"<strong>"}text{"</strong>"}.
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOferte((l) => [...l, { media: ICONITE[0].src, title: "", html: "" }])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3.5 py-2 text-xs font-medium text-gray-600 hover:border-accent hover:text-[#1e7e34]"
        >
          <Plus size={14} /> Adaugă ofertă
        </button>
        <button
          type="button"
          disabled={salveaza}
          onClick={() => trimite({ oferte }, "Ofertele au fost salvate.")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-white hover:bg-[#218838] disabled:opacity-40"
        >
          <Check size={14} /> {salveaza ? "Se salvează…" : "Salvează ofertele"}
        </button>
      </div>
    </div>
  );
}
