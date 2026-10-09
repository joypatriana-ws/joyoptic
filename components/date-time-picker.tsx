"use client";

// Data și ora programării într-un singur câmp: calendarul lunii + ora (coloană) + minutele orei alese.
// Valorile ajung în formular prin două inputuri ascunse, validate (date + hour), deci API-ul rămâne același.

import { useEffect, useId, useRef, useState } from "react";
import { Floating, useOutsideClose } from "./floating";

const ZILE = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
const MINUTE = ["00", "15", "30", "45"];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromIso = (s: string) => new Date(`${s}T12:00:00`);

/** „luni, 12 octombrie" */
export function ziLunga(data: string) {
  return fromIso(data).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
}

const sageata = (
  <svg width="16" height="12" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0 text-[#343a40]">
    <path d="m2 5 6 6 6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const calendarIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 opacity-70">
    <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export function DateTimePicker({
  value,
  onChange,
  slotsFor,
  takenFor,
  required,
  buttonClassName,
  placeholder = "Data și ora",
  disabled,
  disabledText,
}: {
  value: { date: string; hour: string };
  onChange: (v: { date: string; hour: string }) => void;
  /** intervalele de program ale unei zile (fără cele trecute); [] = închis */
  slotsFor: (date: string) => string[];
  /** intervalele ocupate dintr-o zi (din server) */
  takenFor: (date: string) => Promise<string[]>;
  required?: boolean;
  buttonClassName: string;
  placeholder?: string;
  /** ex. până se alege departamentul (orele libere depind de el) */
  disabled?: boolean;
  disabledText?: string;
}) {
  const [open, setOpen] = useState(false);
  const azi = new Date();
  const [luna, setLuna] = useState(() => new Date(azi.getFullYear(), azi.getMonth(), 1));
  // alegerea din panou; se aplică doar la „Confirmă"
  const [zi, setZi] = useState("");
  const [ora, setOra] = useState("");
  const [minut, setMinut] = useState("");
  const [ocupate, setOcupate] = useState<{ zi: string; ore: string[] } | null>(null);
  const panouId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const panou = useRef<HTMLDivElement>(null);
  useOutsideClose(open, [wrap, panou], () => setOpen(false));

  // orele ocupate se recitesc la fiecare deschidere, ca să nu fie învechite
  useEffect(() => {
    if (!zi || !open) return;
    let anulat = false;
    takenFor(zi)
      .then((ore) => !anulat && setOcupate({ zi, ore }))
      .catch(() => !anulat && setOcupate({ zi, ore: [] }));
    return () => {
      anulat = true;
    };
  }, [zi, takenFor, open]);

  function deschide() {
    // panoul pornește de la valoarea confirmată
    setZi(value.date);
    setOra(value.hour.slice(0, 2));
    setMinut(value.hour.slice(3));
    if (value.date) setLuna(new Date(fromIso(value.date).getFullYear(), fromIso(value.date).getMonth(), 1));
    setOpen(true);
  }

  // intervalele libere ale zilei alese, grupate pe ore
  const incarcat = ocupate?.zi === zi;
  const libere = zi && incarcat ? slotsFor(zi).filter((s) => !ocupate.ore.includes(s)) : [];
  const ore = [...new Set(libere.map((s) => s.slice(0, 2)))];
  const alegere = ora && minut && libere.includes(`${ora}:${minut}`) ? `${ora}:${minut}` : "";
  const minuteLibere = (h: string) => new Set(libere.filter((s) => s.startsWith(`${h}:`)).map((s) => s.slice(3)));

  // celulele lunii, începând de luni
  const prima = new Date(luna.getFullYear(), luna.getMonth(), 1);
  const start = new Date(prima);
  start.setDate(1 - ((prima.getDay() + 6) % 7));
  const celule = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const potInapoi = luna > new Date(azi.getFullYear(), azi.getMonth(), 1);

  const text = value.date && value.hour ? `${ziLunga(value.date)}, ora ${value.hour}` : placeholder;

  return (
    <div ref={wrap} className="relative">
      <input tabIndex={-1} aria-hidden="true" name="date" value={value.date} required={required} onChange={() => {}} className="pointer-events-none absolute bottom-0 left-1/3 h-px w-px opacity-0" />
      <input tabIndex={-1} aria-hidden="true" name="hour" value={value.hour} required={required} onChange={() => {}} className="peer pointer-events-none absolute bottom-0 left-2/3 h-px w-px opacity-0" />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panouId}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : deschide())}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className={`flex items-center gap-2 text-left disabled:cursor-not-allowed ${buttonClassName}`}
      >
        {calendarIcon}
        <span className={`flex-1 truncate first-letter:uppercase ${value.date && value.hour ? "" : "opacity-60"}`}>{disabled && disabledText ? disabledText : text}</span>
        {sageata}
      </button>

      {open && (
        <Floating
          anchor={wrap}
          panelRef={panou}
          id={panouId}
          role="dialog"
          label="Alege data și ora"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className="w-[min(36rem,calc(100vw-24px))] rounded-lg border border-black/10 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
        >
          <div className="grid sm:grid-cols-[1fr_auto]">
            {/* 1. ziua */}
            <div className="p-4 sm:border-r sm:border-black/5">
              <Pas nr={1} titlu="Ziua" gata={Boolean(zi)} activ={!zi} />
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  disabled={!potInapoi}
                  onClick={() => setLuna(new Date(luna.getFullYear(), luna.getMonth() - 1, 1))}
                  className="rounded p-1.5 text-heading hover:bg-accent/10 disabled:opacity-25"
                  aria-label="Luna anterioară"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="m10 3-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="font-heading text-[15px] font-semibold text-heading first-letter:uppercase">
                  {LUNI[luna.getMonth()]} {luna.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => setLuna(new Date(luna.getFullYear(), luna.getMonth() + 1, 1))}
                  className="rounded p-1.5 text-heading hover:bg-accent/10"
                  aria-label="Luna următoare"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {ZILE.map((z) => (
                  <span key={z} className="py-1 text-[12px] font-medium text-default/60">
                    {z}
                  </span>
                ))}
                {celule.map((d) => {
                  const cheie = iso(d);
                  const dinLuna = d.getMonth() === luna.getMonth();
                  const inchis = cheie < iso(azi) || slotsFor(cheie).length === 0;
                  const ales = cheie === zi;
                  return (
                    <button
                      key={cheie}
                      type="button"
                      disabled={inchis || !dinLuna}
                      onClick={() => {
                        setZi(cheie);
                        setOra("");
                        setMinut("");
                      }}
                      aria-pressed={ales}
                      className={`h-10 rounded-md text-[14px] transition-colors ${
                        !dinLuna
                          ? "invisible"
                          : ales
                            ? "bg-accent font-semibold text-white"
                            : inchis
                              ? "cursor-not-allowed text-default/25"
                              : `text-body hover:bg-accent/10 ${cheie === iso(azi) ? "font-semibold text-accent ring-1 ring-inset ring-accent/40" : ""}`
                      }`}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 text-[12px] text-default/60">Duminica cabinetul este închis.</div>
            </div>

            {/* 2. ora, 3. minutul — „segmented pills" */}
            <div className="border-t border-black/5 p-4 sm:w-64 sm:border-t-0">
              <Pas nr={2} titlu="Ora" gata={Boolean(ora)} activ={Boolean(zi) && !ora} />
              {!zi ? (
                <Indiciu>Alege întâi ziua din calendar.</Indiciu>
              ) : !incarcat ? (
                <Indiciu>Se încarcă orele libere…</Indiciu>
              ) : ore.length === 0 ? (
                <Indiciu>Nicio oră liberă în ziua aleasă. Alege altă zi.</Indiciu>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {ore.map((h) => (
                    <button
                      key={h}
                      type="button"
                      aria-pressed={h === ora}
                      onClick={() => {
                        setOra(h);
                        setMinut("");
                      }}
                      className={`h-10 rounded-md border font-heading text-[15px] transition-colors ${
                        h === ora ? "border-accent bg-accent font-semibold text-white" : "border-black/10 text-heading hover:border-accent hover:text-accent"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}

              {ora && (
                <div className="mt-4 border-t border-black/5 pt-3">
                  <Pas nr={3} titlu={`Minutul (ora ${ora})`} gata={Boolean(alegere)} activ={!alegere} />
                  <div className="grid grid-cols-4 gap-1.5">
                    {MINUTE.map((m) => {
                      const liber = minuteLibere(ora).has(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={!liber}
                          aria-pressed={m === minut}
                          onClick={() => setMinut(m)}
                          title={liber ? undefined : "Ocupat"}
                          className={`h-10 rounded-md border text-[15px] transition-colors ${
                            m === minut && liber
                              ? "border-accent bg-accent font-semibold text-white"
                              : liber
                                ? "border-black/10 text-body hover:border-accent hover:text-accent"
                                : "cursor-not-allowed border-black/5 bg-black/[.02] text-default/25"
                          }`}
                        >
                          :{m}
                        </button>
                      );
                    })}
                  </div>
                  {MINUTE.some((m) => !minuteLibere(ora).has(m)) && (
                    <div className="mt-2 text-[12px] text-default/50">Intervalele estompate sunt deja ocupate.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ce urmează + confirmare */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 bg-light/60 px-4 py-3">
            <span className="text-[14px] text-default">
              {!zi ? (
                <>Alege ziua în care vrei să vii.</>
              ) : !ora ? (
                <>
                  <strong className="first-letter:uppercase">{ziLunga(zi)}</strong> — acum alege ora.
                </>
              ) : !alegere ? (
                <>
                  <strong className="first-letter:uppercase">{ziLunga(zi)}</strong>, ora {ora} — alege minutul.
                </>
              ) : (
                <>
                  Programare: <strong className="first-letter:uppercase">{ziLunga(zi)}</strong>, ora <strong>{alegere}</strong>
                </>
              )}
            </span>
            <button
              type="button"
              disabled={!alegere}
              onClick={() => {
                onChange({ date: zi, hour: alegere });
                setOpen(false);
              }}
              className="rounded-[50px] bg-accent px-6 py-2 text-[14px] text-white transition-colors hover:bg-[#218838] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirmă
            </button>
          </div>
        </Floating>
      )}
    </div>
  );
}

/** Titlul unui pas: număr (sau bifă când e gata), evidențiat când e pasul curent. */
function Pas({ nr, titlu, gata, activ }: { nr: number; titlu: string; gata: boolean; activ: boolean }) {
  return (
    <div className={`mb-3 flex items-center gap-2 text-[13px] font-medium ${activ || gata ? "text-heading" : "text-default/50"}`}>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
          gata ? "bg-accent text-white" : activ ? "bg-accent/15 text-[#1e7e34] ring-1 ring-accent" : "bg-black/5 text-default/60"
        }`}
      >
        {gata ? "✓" : nr}
      </span>
      {titlu}
    </div>
  );
}

function Indiciu({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-32 items-center justify-center rounded-md bg-black/[.02] px-3 text-center text-[14px] text-default/60">{children}</div>;
}
