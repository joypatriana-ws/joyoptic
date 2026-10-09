/** Data (YYYY-MM-DD) și ora (HH:MM) unei programări, pe ora României. */
export function bucharestParts(d: Date): { data: string; ora: string } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Bucharest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return { data: `${p.year}-${p.month}-${p.day}`, ora: `${p.hour}:${p.minute}` };
}

export type Stare = "asteptare" | "confirmata" | "anulata";

export const SCHIMBARI: Record<Stare, { confirmed: boolean; cancelled: boolean }> = {
  asteptare: { confirmed: false, cancelled: false },
  confirmata: { confirmed: true, cancelled: false },
  anulata: { confirmed: false, cancelled: true },
};
