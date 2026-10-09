"use client";

import { useEffect, useState } from "react";

// Mesajele din BookingsController::confirm și stilurile .message din main.css
const MESSAGES: Record<string, { text: string; kind: "success" | "error" | "info" }> = {
  "link-invalid": { text: "Link-ul de confirmare este invalid.", kind: "error" },
  "programare-invalida": { text: "Programarea invalidă.", kind: "error" },
  "cod-invalid": { text: "Codul de confirmare este invalid. Vă rugăm să ne contactați pentru asistență.", kind: "error" },
  "deja-confirmata": { text: "Programarea a fost deja confirmată.", kind: "info" },
  confirmata: { text: "Programarea a fost confirmată cu succes!", kind: "success" },
  "eroare-confirmare": { text: "A apărut o eroare la confirmarea programării. Încearcă din nou.", kind: "error" },
};

const KIND = {
  success: "bg-[#dff0d8] text-[#3c763d] border-[#d6e9c6]",
  error: "bg-[#f2dede] text-[#a94442] border-[#ebccd1]",
  info: "bg-[#d9edf7] text-[#31708f] border-[#bce8f1]",
};

/** element('flash') din layout: mesajul de după o redirecționare (?flash=…), afișat o singură dată. */
export function Flash() {
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const k = url.searchParams.get("flash");
    if (!k) return;
    url.searchParams.delete("flash");
    window.history.replaceState(null, "", url);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- citit o singură dată din URL după redirect
    setKey(k);
  }, []);

  const msg = key ? MESSAGES[key] : null;
  if (!msg) return null;
  return (
    <div id="flash-messages" className="mx-auto my-5 max-w-[600px] p-2.5 text-center">
      <div className={`mb-2.5 rounded-[5px] border p-2.5 text-[16px] ${KIND[msg.kind]}`}>{msg.text}</div>
    </div>
  );
}
