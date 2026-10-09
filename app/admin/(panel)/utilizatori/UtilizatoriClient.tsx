"use client";

// După UsersClient din kulttur, fără roluri (la JoyOptic toți au acces complet).

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle, Plus, UserCheck, UserX, X } from "lucide-react";

export type Utilizator = {
  id: string;
  nume: string;
  email: string;
  activ: boolean;
  areParola: boolean;
  ultimaLogare: string | null;
};

const camp = "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-accent";
const eticheta = "block text-xs font-medium text-gray-600";

export default function UtilizatoriClient({ utilizatori, eu }: { utilizatori: Utilizator[]; eu: string }) {
  const router = useRouter();
  const [modal, setModal] = useState<{ tip: "nou" } | { tip: "parola"; u: Utilizator } | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);
  const [lucreaza, setLucreaza] = useState<string | null>(null);

  async function schimbaStarea(u: Utilizator) {
    setEroare(null);
    setLucreaza(u.id);
    const r = await fetch(`/api/admin/utilizatori/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activ: !u.activ }),
    });
    setLucreaza(null);
    if (!r.ok) {
      setEroare(((await r.json()) as { error?: string }).error ?? "Nu s-a putut salva.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-xl font-semibold text-gray-900">Utilizatori</h1>
          <div className="mt-0.5 text-sm text-gray-400">Cine are acces la administrarea site-ului.</div>
        </div>
        <button
          type="button"
          onClick={() => setModal({ tip: "nou" })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#218838]"
        >
          <Plus size={16} /> Adaugă utilizator
        </button>
      </div>

      {eroare && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{eroare}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Nume</th>
              <th className="hidden px-4 py-3 sm:table-cell">Ultima logare</th>
              <th className="px-4 py-3">Stare</th>
              <th className="px-4 py-3 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {utilizatori.map((u) => (
              <tr key={u.id} className={u.activ ? "" : "bg-gray-50/60 text-gray-400"}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {u.nume} {u.id === eu && <span className="text-xs font-normal text-gray-400">(tu)</span>}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="hidden px-4 py-3 text-xs text-gray-500 sm:table-cell">
                  {u.ultimaLogare ? new Date(u.ultimaLogare).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" }) : "niciodată"}
                </td>
                <td className="px-4 py-3">
                  {!u.activ ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Dezactivat</span>
                  ) : !u.areParola ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Fără parolă</span>
                  ) : (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-[#1e7e34]">Activ</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setModal({ tip: "parola", u })}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      title={u.areParola ? "Schimbă parola" : "Setează parola"}
                    >
                      <KeyRound size={16} />
                    </button>
                    {u.id !== eu && (
                      <button
                        type="button"
                        onClick={() => schimbaStarea(u)}
                        disabled={lucreaza === u.id}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                        title={u.activ ? "Dezactivează" : "Activează"}
                      >
                        {lucreaza === u.id ? <LoaderCircle size={16} className="animate-spin" /> : u.activ ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.tip === "nou" && <UtilizatorNouModal onInchide={() => setModal(null)} onSalvat={() => { setModal(null); router.refresh(); }} />}
      {modal?.tip === "parola" && <ParolaModal u={modal.u} onInchide={() => setModal(null)} onSalvat={() => { setModal(null); router.refresh(); }} />}
    </div>
  );
}

function Modal({ titlu, onInchide, onSubmit, children, trimite, eroare, buton }: {
  titlu: string;
  onInchide: () => void;
  onSubmit: (e: FormEvent) => void;
  children: React.ReactNode;
  trimite: boolean;
  eroare: string | null;
  buton: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={onInchide} role="presentation">
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <h2 className="m-0 text-base font-semibold text-gray-900">{titlu}</h2>
          <button type="button" onClick={onInchide} className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" aria-label="Închide">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 p-5">{children}</div>
        <div className="border-t border-gray-100 p-4">
          {eroare && <div className="mb-2 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{eroare}</div>}
          <div className="flex gap-2">
            <button type="submit" disabled={trimite} className="rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#218838] disabled:opacity-40">
              {trimite ? "Se salvează…" : buton}
            </button>
            <button type="button" onClick={onInchide} className="rounded-lg px-3.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100">
              Renunță
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function UtilizatorNouModal({ onInchide, onSalvat }: { onInchide: () => void; onSalvat: () => void }) {
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [trimite, setTrimite] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);

  async function salveaza(e: FormEvent) {
    e.preventDefault();
    setTrimite(true);
    setEroare(null);
    const r = await fetch("/api/admin/utilizatori", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nume, email, parola }),
    });
    setTrimite(false);
    if (!r.ok) return setEroare(((await r.json()) as { error?: string }).error ?? "Nu s-a putut salva.");
    onSalvat();
  }

  return (
    <Modal titlu="Utilizator nou" onInchide={onInchide} onSubmit={salveaza} trimite={trimite} eroare={eroare} buton="Creează contul">
      <label className="block">
        <span className={eticheta}>Nume</span>
        <input value={nume} onChange={(e) => setNume(e.target.value)} required className={camp} />
      </label>
      <label className="block">
        <span className={eticheta}>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={camp} />
      </label>
      <label className="block">
        <span className={eticheta}>Parolă</span>
        <input type="password" value={parola} onChange={(e) => setParola(e.target.value)} required minLength={10} autoComplete="new-password" className={camp} />
        <span className="mt-1 block text-[11px] text-gray-400">Minimum 10 caractere. Comunic-o persoanei pe alt canal decât emailul.</span>
      </label>
    </Modal>
  );
}

function ParolaModal({ u, onInchide, onSalvat }: { u: Utilizator; onInchide: () => void; onSalvat: () => void }) {
  const [parola, setParola] = useState("");
  const [trimite, setTrimite] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);

  async function salveaza(e: FormEvent) {
    e.preventDefault();
    setTrimite(true);
    setEroare(null);
    const r = await fetch(`/api/admin/utilizatori/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parola }),
    });
    setTrimite(false);
    if (!r.ok) return setEroare(((await r.json()) as { error?: string }).error ?? "Nu s-a putut salva.");
    onSalvat();
  }

  return (
    <Modal titlu={`${u.areParola ? "Schimbă" : "Setează"} parola — ${u.nume}`} onInchide={onInchide} onSubmit={salveaza} trimite={trimite} eroare={eroare} buton="Salvează parola">
      <label className="block">
        <span className={eticheta}>Parola nouă</span>
        <input type="password" value={parola} onChange={(e) => setParola(e.target.value)} required minLength={10} autoComplete="new-password" autoFocus className={camp} />
        <span className="mt-1 block text-[11px] text-gray-400">Minimum 10 caractere.</span>
      </label>
    </Modal>
  );
}
