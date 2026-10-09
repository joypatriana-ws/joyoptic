"use client";

// După ProgramariClient din kulttur: calendar lunar + ziua aleasă + detalii cu starea,
// adaptat pentru cabinet (tip consultație, medic, programul 09–19 / sâmbătă 09–12).

import { useMemo, useState, useTransition } from "react";
import { Ban, Check, ChevronLeft, ChevronRight, Clock, Mail, Phone, Plus, RotateCcw, Trash2, X } from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { Select, TimeSelect } from "@/components/custom-select";
import { bookingTypes, doctors, hoursFor } from "@/lib/site";

export type Programare = {
  id: string;
  nume: string;
  email: string | null;
  telefon: string | null;
  data: string; // YYYY-MM-DD, ora României
  ora: string; // HH:MM
  tip: string;
  medic: string | null;
  mesaj: string | null;
  confirmata: boolean;
  anulata: boolean;
  sursa: "site" | "admin";
  creataLa: string;
};

type Stare = "asteptare" | "confirmata" | "anulata";

function stareaLui(p: Programare): Stare {
  if (p.anulata) return "anulata";
  if (p.confirmata) return "confirmata";
  return "asteptare";
}

const ZILE = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const LUNI = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

/** Culoarea unei programări, pe stare — aceeași logică peste tot în pagină. */
function culoare(p: Programare): { fundal: string; text: string; eticheta: string } {
  if (p.anulata) return { fundal: "#fee2e2", text: "#991b1b", eticheta: "Anulată" };
  if (p.confirmata) return { fundal: "#dcfce7", text: "#166534", eticheta: "Confirmată" };
  return { fundal: "#fef3c7", text: "#92400e", eticheta: "În așteptare" };
}

function cheieZi(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const oreleZilei = (data: string) => hoursFor(new Date(`${data}T12:00:00`));

export default function ProgramariClient({ programari: initiale }: { programari: Programare[] }) {
  const [programari, setProgramari] = useState(initiale);
  const [deschisa, setDeschisa] = useState<Programare | null>(null);
  const [adauga, setAdauga] = useState(false);
  const [salveaza, setSalveaza] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);
  const [deSters, setDeSters] = useState<Programare | null>(null);
  const [, startTransition] = useTransition();
  const azi = new Date();

  async function schimbaStarea(p: Programare, stare: Stare) {
    setSalveaza(true);
    setEroare(null);
    try {
      const r = await fetch(`/api/admin/programari/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stare }),
      });
      const d = (await r.json()) as { message?: string };
      if (!r.ok) {
        setEroare(d.message ?? "Nu s-a putut schimba starea.");
        return;
      }
      const noua: Programare = { ...p, confirmata: stare === "confirmata", anulata: stare === "anulata" };
      startTransition(() => {
        setProgramari((lista) => lista.map((x) => (x.id === p.id ? noua : x)));
        setDeschisa(noua);
      });
    } catch {
      setEroare("Nu s-a putut schimba starea.");
    } finally {
      setSalveaza(false);
    }
  }

  async function sterge(p: Programare) {
    setDeSters(null);
    setSalveaza(true);
    setEroare(null);
    try {
      const r = await fetch(`/api/admin/programari/${p.id}`, { method: "DELETE" });
      if (!r.ok) {
        setEroare("Nu s-a putut șterge programarea.");
        return;
      }
      setProgramari((lista) => lista.filter((x) => x.id !== p.id));
      setDeschisa(null);
    } catch {
      setEroare("Nu s-a putut șterge programarea.");
    } finally {
      setSalveaza(false);
    }
  }

  const [luna, setLuna] = useState(() => new Date(azi.getFullYear(), azi.getMonth(), 1));
  const [ziAleasa, setZiAleasa] = useState<string | null>(cheieZi(azi));

  /** Programările grupate pe zi, ca să nu filtrăm lista la fiecare celulă. */
  const peZi = useMemo(() => {
    const m = new Map<string, Programare[]>();
    for (const p of programari) {
      const lista = m.get(p.data) ?? [];
      lista.push(p);
      m.set(p.data, lista);
    }
    for (const lista of m.values()) lista.sort((a, b) => a.ora.localeCompare(b.ora));
    return m;
  }, [programari]);

  /** Celulele lunii, începând de luni. */
  const celule = useMemo(() => {
    const prima = new Date(luna.getFullYear(), luna.getMonth(), 1);
    const offset = (prima.getDay() + 6) % 7; // luni = 0
    const start = new Date(prima);
    start.setDate(start.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [luna]);

  const dinLuna = (d: Date) => d.getMonth() === luna.getMonth();
  const eAzi = (d: Date) => cheieZi(d) === cheieZi(azi);
  const aleseZi = ziAleasa ? (peZi.get(ziAleasa) ?? []) : [];

  const active = programari.filter((p) => !p.anulata).length;
  const viitoare = programari.filter((p) => p.data >= cheieZi(azi) && !p.anulata).length;
  const neconfirmate = programari.filter((p) => p.data >= cheieZi(azi) && !p.anulata && !p.confirmata).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-semibold text-gray-900">Programări</h1>
          <div className="mt-1 text-sm text-gray-500">
            {viitoare} {viitoare === 1 ? "programare viitoare" : "programări viitoare"}
            {neconfirmate > 0 && <> · {neconfirmate} neconfirmate</>} · {active} active în total
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setLuna(new Date(luna.getFullYear(), luna.getMonth() - 1, 1))}
            className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Luna anterioară"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setLuna(new Date(azi.getFullYear(), azi.getMonth(), 1));
              setZiAleasa(cheieZi(azi));
            }}
            className="rounded px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Azi
          </button>
          <button
            type="button"
            onClick={() => setLuna(new Date(luna.getFullYear(), luna.getMonth() + 1, 1))}
            className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Luna următoare"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Calendarul lunii ── */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-900">
            {LUNI[luna.getMonth()]} {luna.getFullYear()}
          </div>
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {ZILE.map((z) => (
              <div key={z} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {z}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {celule.map((d) => {
              const cheie = cheieZi(d);
              const ale = peZi.get(cheie) ?? [];
              const selectata = cheie === ziAleasa;
              return (
                <button
                  key={cheie}
                  type="button"
                  onClick={() => setZiAleasa(cheie)}
                  className={`min-h-[86px] border-b border-r border-gray-100 p-1.5 text-left align-top transition-colors last:border-r-0 ${
                    selectata ? "bg-accent/5 ring-1 ring-inset ring-accent/40" : "hover:bg-gray-50"
                  } ${dinLuna(d) ? "" : "bg-gray-50/60"}`}
                >
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-xs ${
                      eAzi(d) ? "bg-heading font-semibold text-white" : dinLuna(d) ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {ale.slice(0, 3).map((p) => {
                      const c = culoare(p);
                      return (
                        <div
                          key={p.id}
                          className="truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight"
                          style={{ backgroundColor: c.fundal, color: c.text }}
                          title={`${p.ora} ${p.nume}`}
                        >
                          {p.ora} {p.nume}
                        </div>
                      );
                    })}
                    {ale.length > 3 && <div className="px-1 text-[10px] text-gray-400">+{ale.length - 3}</div>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 px-4 py-2.5 text-[11px] text-gray-500">
            {[
              ["#fef3c7", "În așteptare"],
              ["#dcfce7", "Confirmată"],
              ["#fee2e2", "Anulată"],
            ].map(([bg, et]) => (
              <span key={et} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: bg }} />
                {et}
              </span>
            ))}
          </div>
        </div>

        {/* ── Ziua aleasă ── */}
        <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="m-0 text-sm font-semibold text-gray-900">
            {ziAleasa
              ? new Date(`${ziAleasa}T00:00:00`).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })
              : "Alege o zi"}
          </h2>

          {ziAleasa && oreleZilei(ziAleasa).length > 0 && (
            <button
              type="button"
              onClick={() => {
                setEroare(null);
                setAdauga(true);
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-accent hover:bg-accent/5 hover:text-[#1e7e34]"
            >
              <Plus size={14} /> {ziAleasa < cheieZi(azi) ? "Adaugă vizită" : "Adaugă programare"}
            </button>
          )}

          {ziAleasa && oreleZilei(ziAleasa).length === 0 && (
            <div className="mt-3 text-sm text-gray-400">Duminica cabinetul e închis.</div>
          )}

          {aleseZi.length === 0 ? (
            oreleZilei(ziAleasa ?? "").length > 0 && <div className="mt-3 text-sm text-gray-400">Nicio programare în ziua asta.</div>
          ) : (
            <div className="mt-3 space-y-2.5">
              {aleseZi.map((p) => {
                const c = culoare(p);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setEroare(null);
                      setDeschisa(p);
                    }}
                    className="w-full rounded-lg border border-gray-100 p-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        <Clock size={13} className="text-gray-400" />
                        {p.ora}
                      </span>
                      <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: c.fundal, color: c.text }}>
                        {c.eticheta}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-800">{p.nume}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{p.tip}</div>
                    {p.medic && <div className="mt-0.5 text-xs text-gray-500">{p.medic}</div>}
                    {p.telefon && (
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={12} /> {p.telefon}
                      </span>
                    )}
                    {p.mesaj && <div className="mt-1.5 text-xs italic text-gray-500">„{p.mesaj}”</div>}
                    <span className="mt-2 block text-[11px] font-medium text-[#1e7e34]">Vezi detaliile →</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {adauga && ziAleasa && (
        <ProgramareNouaModal
          data={ziAleasa}
          oreLuate={aleseZi.filter((p) => !p.anulata).map((p) => p.ora)}
          onInchide={() => setAdauga(false)}
          onSalvat={() => {
            setAdauga(false);
            window.location.reload();
          }}
        />
      )}

      {deschisa && (
        <ProgramareModal
          p={deschisa}
          salveaza={salveaza}
          eroare={eroare}
          onInchide={() => setDeschisa(null)}
          onStare={(stare) => schimbaStarea(deschisa, stare)}
          onSterge={() => setDeSters(deschisa)}
        />
      )}

      <ConfirmModal
        open={deSters !== null}
        title="Ștergi programarea?"
        message={deSters ? `${deSters.nume}, ${deSters.data} ora ${deSters.ora}. Programarea dispare definitiv din evidență. Dacă doar nu mai vine, folosește „Anulează”.` : undefined}
        confirmLabel="Șterge"
        variant="danger"
        onConfirm={() => deSters && sterge(deSters)}
        onCancel={() => setDeSters(null)}
      />
    </div>
  );
}

/** Programare luată la telefon sau la cabinet. Se salvează direct confirmată. */
function ProgramareNouaModal({
  data,
  oreLuate,
  onInchide,
  onSalvat,
}: {
  data: string;
  oreLuate: string[];
  onInchide: () => void;
  onSalvat: () => void;
}) {
  const [nume, setNume] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [ora, setOra] = useState("");
  const [tip, setTip] = useState("1");
  const [medic, setMedic] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [trimite, setTrimite] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);

  const dataLunga = new Date(`${data}T00:00:00`).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Ore deja scurse: se pot alege (evidență), dar formularul spune clar că e retroactiv.
  const acum = new Date();
  const aziStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest", year: "numeric", month: "2-digit", day: "2-digit" }).format(acum);
  const oraAcum = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Bucharest", hour: "2-digit", minute: "2-digit", hour12: false }).format(acum);
  const eZiTrecuta = data < aziStr;
  const oreTrecute = eZiTrecuta ? oreleZilei(data) : data === aziStr ? oreleZilei(data).filter((o) => o <= oraAcum) : [];
  const alegeRetroactiv = oreTrecute.includes(ora);

  async function salveaza(e: React.FormEvent) {
    e.preventDefault();
    setTrimite(true);
    setEroare(null);
    try {
      const r = await fetch("/api/admin/programari", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nume, telefon, email: email || null, data, ora, tip, medic: medic || null, mesaj: mesaj || null }),
      });
      const d = (await r.json()) as { message?: string };
      if (!r.ok) {
        setEroare(d.message ?? "Nu s-a putut salva.");
        return;
      }
      onSalvat();
    } catch {
      setEroare("Nu s-a putut salva.");
    } finally {
      setTrimite(false);
    }
  }

  const camp = "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-accent";
  const eticheta = "block text-xs font-medium text-gray-600";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={onInchide} role="presentation">
      <form onSubmit={salveaza} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h2 className="m-0 text-base font-semibold text-gray-900">
              {alegeRetroactiv ? "Adaugă vizită (antedatare)" : "Programare de la telefon / cabinet"}
            </h2>
            <div className="mt-0.5 text-sm text-gray-500">{dataLunga}</div>
          </div>
          <button type="button" onClick={onInchide} className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" aria-label="Închide">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <div>
            <span className={eticheta}>Ora *</span>
            <TimeSelect
              name="ora"
              slots={oreleZilei(data).filter((o) => !oreLuate.includes(o))}
              value={ora}
              onChange={setOra}
              placeholder="Alege ora"
              emptyText="Nu mai e niciun interval liber în ziua asta."
              buttonClassName={camp}
            />
          </div>

          {alegeRetroactiv && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
              <strong className="font-semibold text-gray-800">Antedatare.</strong>{" "}
              {eZiTrecuta
                ? "Ziua a trecut — se salvează ca vizită care a avut loc, pentru evidență."
                : "Ora a trecut deja azi — se salvează ca vizită care a avut loc, nu ca programare viitoare."}
            </div>
          )}

          <label className="block">
            <span className={eticheta}>Tipul consultației *</span>
            <Select
              name="tip"
              value={tip}
              onChange={setTip}
              placeholder="Alege tipul"
              options={bookingTypes.map((t) => ({ value: String(t.id), label: t.title }))}
              buttonClassName={camp}
            />
          </label>

          <label className="block">
            <span className={eticheta}>Medic</span>
            <Select
              name="medic"
              value={medic}
              onChange={setMedic}
              placeholder="—"
              options={[{ value: "", label: "—" }, ...doctors.map((d) => ({ value: d.name, label: `${d.name} - ${d.specialization}` }))]}
              buttonClassName={camp}
            />
          </label>

          <label className="block">
            <span className={eticheta}>Nume *</span>
            <input value={nume} onChange={(e) => setNume(e.target.value)} required className={camp} placeholder="Numele pacientului" />
          </label>

          <label className="block">
            <span className={eticheta}>Telefon *</span>
            <input value={telefon} onChange={(e) => setTelefon(e.target.value)} required className={camp} placeholder="07..." />
          </label>

          <label className="block">
            <span className={eticheta}>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={camp} placeholder="opțional" />
          </label>

          <label className="block">
            <span className={eticheta}>Notă</span>
            <textarea value={mesaj} onChange={(e) => setMesaj(e.target.value)} rows={2} className={camp} placeholder="Orice e util pentru consultație" />
          </label>
        </div>

        <div className="border-t border-gray-100 p-4">
          {eroare && <div className="mb-2 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{eroare}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={trimite || !ora || !nume.trim() || !telefon.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#218838] disabled:opacity-40"
            >
              <Check size={14} /> {trimite ? "Se salvează…" : "Salvează programarea"}
            </button>
            <button type="button" onClick={onInchide} className="rounded-lg px-3.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100">
              Renunță
            </button>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Se salvează direct ca programare confirmată. Pacientul nu primește email.</div>
        </div>
      </form>
    </div>
  );
}

/** Rândul „etichetă: valoare” din modal. Nu se afișează dacă nu avem valoarea. */
function Rand({ eticheta, valoare }: { eticheta: string; valoare: string | null | undefined }) {
  if (!valoare) return null;
  return (
    <div className="flex gap-3 py-1.5">
      <dt className="w-36 shrink-0 text-xs text-gray-400">{eticheta}</dt>
      <dd className="m-0 min-w-0 flex-1 break-words text-xs text-gray-800">{valoare}</dd>
    </div>
  );
}

function ProgramareModal({
  p,
  salveaza,
  eroare,
  onInchide,
  onStare,
  onSterge,
}: {
  p: Programare;
  salveaza: boolean;
  eroare: string | null;
  onInchide: () => void;
  onStare: (stare: Stare) => void;
  onSterge: () => void;
}) {
  const c = culoare(p);
  const stare = stareaLui(p);
  const dataLunga = new Date(`${p.data}T00:00:00`).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const butoane: { stare: Stare; text: string; Icon: typeof Check; cls: string }[] = [
    { stare: "confirmata", text: "Confirmă", Icon: Check, cls: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { stare: "asteptare", text: "În așteptare", Icon: RotateCcw, cls: "bg-amber-100 text-amber-900 hover:bg-amber-200" },
    { stare: "anulata", text: "Anulează", Icon: Ban, cls: "bg-red-50 text-red-700 hover:bg-red-100" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={onInchide} role="presentation">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="m-0 truncate text-base font-semibold text-gray-900">{p.nume}</h2>
              <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: c.fundal, color: c.text }}>
                {c.eticheta}
              </span>
            </div>
            <div className="mt-0.5 text-sm text-gray-500">
              {dataLunga} · ora {p.ora}
            </div>
          </div>
          <button type="button" onClick={onInchide} className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" aria-label="Închide">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            {p.telefon && (
              <a href={`tel:${p.telefon}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 transition-colors hover:border-gray-400">
                <Phone size={13} /> {p.telefon}
              </a>
            )}
            {p.email && (
              <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 transition-colors hover:border-gray-400">
                <Mail size={13} /> {p.email}
              </a>
            )}
          </div>

          {p.mesaj && <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm italic text-gray-700">„{p.mesaj}”</div>}

          <dl className="mt-4 mb-0 divide-y divide-gray-50">
            <Rand eticheta="Tipul consultației" valoare={p.tip} />
            <Rand eticheta="Medic" valoare={p.medic} />
            <Rand eticheta="Sursă" valoare={p.sursa === "admin" ? "Adăugată din admin" : "Formularul de pe site"} />
            <Rand eticheta="Trimisă la" valoare={new Date(p.creataLa).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })} />
          </dl>
        </div>

        <div className="border-t border-gray-100 p-4">
          {eroare && <div className="mb-2 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{eroare}</div>}
          <div className="flex flex-wrap items-center gap-2">
            {butoane.map(({ stare: st, text, Icon, cls }) => (
              <button
                key={st}
                type="button"
                disabled={salveaza || stare === st}
                onClick={() => onStare(st)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
              >
                <Icon size={14} /> {text}
              </button>
            ))}
            <button
              type="button"
              disabled={salveaza}
              onClick={onSterge}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
            >
              <Trash2 size={14} /> Șterge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
