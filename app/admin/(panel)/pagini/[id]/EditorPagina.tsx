"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Code2, ExternalLink, ImageIcon, MousePointerClick } from "lucide-react";

type Pagina = {
  id: string;
  titlu: string;
  html: string;
  publicata: boolean;
  pePrimaPagina: boolean;
  url: string;
  eHero: boolean;
};

// Elementele de text care se pot edita prin click. Structura (secțiuni, coloane, clase) rămâne blocată.
const EDITABILE = "h1,h2,h3,h4,h5,h6,p,li,summary,dt,dd,span,blockquote";

/** Marchează textele editabile din HTML-ul randat (doar cel mai de sus, nu și copiii lui). */
function pregatesteEditarea(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(EDITABILE).forEach((el) => {
    if (el.closest("[data-editabil]")) return;
    if (!el.textContent?.trim()) return;
    // un element care conține alte blocuri editabile (ex. div > p) se editează pe copii
    if (el.querySelector("h1,h2,h3,h4,h5,h6,p,li,ul,ol,div")) return;
    el.setAttribute("data-editabil", "");
    el.contentEditable = "true";
  });
  // FAQ deschis, ca răspunsurile să se vadă și să se poată edita
  root.querySelectorAll<HTMLElement>(".faq-item").forEach((el) => el.setAttribute("data-active", ""));
}

/** HTML-ul curat de salvat: fără atributele de editare. */
function serializeaza(root: HTMLElement): string {
  const copie = root.cloneNode(true) as HTMLElement;
  copie.querySelectorAll("[data-editabil]").forEach((el) => {
    el.removeAttribute("data-editabil");
    el.removeAttribute("contenteditable");
  });
  copie.querySelectorAll(".faq-item[data-active]").forEach((el) => el.removeAttribute("data-active"));
  copie.querySelectorAll("[data-imagine-aleasa]").forEach((el) => el.removeAttribute("data-imagine-aleasa"));
  return copie.innerHTML;
}

export default function EditorPagina({ pagina }: { pagina: Pagina }) {
  const [titlu, setTitlu] = useState(pagina.titlu);
  const [publicata, setPublicata] = useState(pagina.publicata);
  const [pePrimaPagina, setPePrimaPagina] = useState(pagina.pePrimaPagina);
  const [mod, setMod] = useState<"vizual" | "cod">("vizual");
  const [cod, setCod] = useState(pagina.html);
  const [modificat, setModificat] = useState(false);
  const [salveaza, setSalveaza] = useState(false);
  const [mesaj, setMesaj] = useState<{ ok: boolean; text: string } | null>(null);
  const [imagine, setImagine] = useState<HTMLImageElement | null>(null);
  const vizual = useRef<HTMLDivElement>(null);
  // HTML-ul curent, ținut în ref ca să nu re-randăm zona editată la fiecare tastă
  const htmlCurent = useRef(pagina.html);

  const incarcaVizual = useCallback((html: string) => {
    const el = vizual.current;
    if (!el) return;
    el.innerHTML = html;
    pregatesteEditarea(el);
  }, []);

  useEffect(() => {
    if (mod === "vizual") incarcaVizual(htmlCurent.current);
  }, [mod, incarcaVizual]);

  // avertizare la plecarea de pe pagină cu modificări nesalvate
  useEffect(() => {
    if (!modificat) return;
    const avertizeaza = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avertizeaza);
    return () => window.removeEventListener("beforeunload", avertizeaza);
  }, [modificat]);

  function laModificare() {
    if (vizual.current) htmlCurent.current = serializeaza(vizual.current);
    setModificat(true);
    setMesaj(null);
  }

  function schimbaMod(nou: "vizual" | "cod") {
    if (nou === mod) return;
    if (nou === "cod") {
      if (vizual.current) htmlCurent.current = serializeaza(vizual.current);
      setCod(htmlCurent.current);
      setImagine(null);
    } else {
      htmlCurent.current = cod;
    }
    setMod(nou);
  }

  async function salvare() {
    const html = mod === "cod" ? cod : vizual.current ? serializeaza(vizual.current) : htmlCurent.current;
    htmlCurent.current = html;
    setSalveaza(true);
    setMesaj(null);
    try {
      const r = await fetch(`/api/admin/pagini/${pagina.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titlu, html, publicata, pePrimaPagina }),
      });
      if (!r.ok) {
        setMesaj({ ok: false, text: ((await r.json()) as { error?: string }).error ?? "Nu s-a putut salva." });
        return;
      }
      setModificat(false);
      setMesaj({ ok: true, text: "Pagina a fost salvată. Modificările apar pe site imediat." });
    } catch {
      setMesaj({ ok: false, text: "Nu s-a putut salva. Verifică conexiunea și încearcă din nou." });
    } finally {
      setSalveaza(false);
    }
  }

  function laClick(e: React.MouseEvent<HTMLDivElement>) {
    const tinta = e.target as HTMLElement;
    // linkurile nu navighează în editor
    if (tinta.closest("a")) e.preventDefault();
    vizual.current?.querySelectorAll("[data-imagine-aleasa]").forEach((el) => el.removeAttribute("data-imagine-aleasa"));
    if (tinta instanceof HTMLImageElement) {
      tinta.setAttribute("data-imagine-aleasa", "");
      setImagine(tinta);
    } else if (!tinta.closest("[data-panou-imagine]")) {
      setImagine(null);
    }
  }

  function laTasta(e: React.KeyboardEvent<HTMLDivElement>) {
    // Enter = rând nou în același element (nu creează div-uri noi în structură)
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
    }
  }

  function laLipire(e: React.ClipboardEvent<HTMLDivElement>) {
    // doar text simplu: formatarea copiată din Word / alte site-uri ar strica stilul temei
    e.preventDefault();
    document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
  }

  const camp = "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-accent";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* bara de sus */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/pagini" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Înapoi la pagini">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="m-0 text-xl font-semibold text-gray-900">{titlu || "Pagină fără titlu"}</h1>
            <div className="text-xs text-gray-400">{pagina.eHero ? "Secțiunea de sus a primei pagini" : pagina.url}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={pagina.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            <ExternalLink size={14} /> Vezi pe site
          </a>
          <button
            type="button"
            onClick={salvare}
            disabled={salveaza}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-white hover:bg-[#218838] disabled:opacity-40"
          >
            <Check size={14} /> {salveaza ? "Se salvează…" : modificat ? "Salvează modificările" : "Salvează"}
          </button>
        </div>
      </div>

      {mesaj && (
        <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${mesaj.ok ? "bg-accent/10 text-[#1e7e34]" : "bg-red-50 text-red-700"}`}>{mesaj.text}</div>
      )}

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1fr_280px]">
        {/* conținutul */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-1 border-b border-gray-200 px-3 py-2">
            {(
              [
                ["vizual", "Vizual", MousePointerClick],
                ["cod", "Cod HTML", Code2],
              ] as const
            ).map(([cheie, text, Icon]) => (
              <button
                key={cheie}
                type="button"
                onClick={() => schimbaMod(cheie)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                  mod === cheie ? "bg-accent/10 text-[#1e7e34]" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Icon size={14} /> {text}
              </button>
            ))}
            <span className="ml-auto hidden text-[11px] text-gray-400 sm:block">
              {mod === "vizual" ? "Dă click pe un text ca să-l modifici. Click pe o imagine ca s-o schimbi." : "Doar dacă știi HTML: structura și clasele contează pentru aspect."}
            </span>
          </div>

          {mod === "vizual" ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* HTML-ul paginii, cu stilurile site-ului; animațiile AOS sunt oprite ca totul să fie vizibil */}
              <div
                ref={vizual}
                onInput={laModificare}
                onClick={laClick}
                onKeyDown={laTasta}
                onPaste={laLipire}
                className={[
                  "[&_[data-aos]]:opacity-100! [&_[data-aos]]:transform-none!",
                  "[&_[data-editabil]]:cursor-text [&_[data-editabil]]:rounded-sm [&_[data-editabil]]:outline-offset-2",
                  "[&_[data-editabil]:hover]:outline [&_[data-editabil]:hover]:outline-1 [&_[data-editabil]:hover]:outline-dashed [&_[data-editabil]:hover]:outline-accent",
                  "[&_[data-editabil]:focus]:outline-2 [&_[data-editabil]:focus]:outline-accent [&_[data-editabil]:focus]:outline-solid",
                  "[&_img]:cursor-pointer [&_[data-imagine-aleasa]]:outline-3 [&_[data-imagine-aleasa]]:outline-accent [&_[data-imagine-aleasa]]:outline-solid",
                ].join(" ")}
              />
            </div>
          ) : (
            <textarea
              value={cod}
              onChange={(e) => {
                setCod(e.target.value);
                setModificat(true);
                setMesaj(null);
              }}
              spellCheck={false}
              className="min-h-[60vh] flex-1 resize-none p-4 font-mono text-[12px] leading-relaxed text-gray-800 outline-none"
            />
          )}
        </div>

        {/* setări + imaginea aleasă */}
        <div className="space-y-4 self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="block">
              <span className="block text-xs font-medium text-gray-600">Titlu (apare în tab-ul browserului și în Google)</span>
              <input
                value={titlu}
                onChange={(e) => {
                  setTitlu(e.target.value);
                  setModificat(true);
                }}
                className={camp}
              />
            </label>
            {!pagina.eHero && (
              <div className="mt-4 space-y-2.5">
                <Bifa eticheta="Publicată (pagina are adresa ei pe site)" valoare={publicata} onSchimba={(v) => { setPublicata(v); setModificat(true); }} />
                <Bifa eticheta="Pe prima pagină (ca secțiune)" valoare={pePrimaPagina} onSchimba={(v) => { setPePrimaPagina(v); setModificat(true); }} />
              </div>
            )}
          </div>

          {imagine && mod === "vizual" && (
            <div data-panou-imagine className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ImageIcon size={15} /> Imaginea aleasă
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element -- previzualizare din conținutul paginii */}
              <img src={imagine.getAttribute("src") ?? ""} alt="" className="mb-3 max-h-32 w-full rounded-lg bg-gray-50 object-contain" />
              <label className="block">
                <span className="block text-xs font-medium text-gray-600">Adresa imaginii</span>
                <input
                  defaultValue={imagine.getAttribute("src") ?? ""}
                  key={`src-${imagine.getAttribute("src")}`}
                  onChange={(e) => {
                    imagine.setAttribute("src", e.target.value);
                    laModificare();
                  }}
                  className={camp}
                />
              </label>
              <label className="mt-3 block">
                <span className="block text-xs font-medium text-gray-600">Descriere (pentru Google și cititoare de ecran)</span>
                <input
                  defaultValue={imagine.getAttribute("alt") ?? ""}
                  key={`alt-${imagine.getAttribute("src")}`}
                  onChange={(e) => {
                    imagine.setAttribute("alt", e.target.value);
                    laModificare();
                  }}
                  className={camp}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Bifa({ eticheta, valoare, onSchimba }: { eticheta: string; valoare: boolean; onSchimba: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
      <input type="checkbox" checked={valoare} onChange={(e) => onSchimba(e.target.checked)} className="h-4 w-4 accent-[#28a745]" />
      {eticheta}
    </label>
  );
}
