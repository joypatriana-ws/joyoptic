const TZ = "Europe/Bucharest";

/** „2026-10-09" + „18:00" în ora României → momentul UTC corespunzător (ține cont de ora de vară). */
export function bucharestToUtc(date: string, time: string): Date {
  const asUtc = new Date(`${date}T${time}:00Z`);
  const offsetMs =
    new Date(asUtc.toLocaleString("en-US", { timeZone: TZ })).getTime() -
    new Date(asUtc.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
  return new Date(asUtc.getTime() - offsetMs);
}

/** „joi, 9 octombrie 2026, ora 18:00" */
export function formatRo(d: Date): string {
  const day = new Intl.DateTimeFormat("ro-RO", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  const hour = new Intl.DateTimeFormat("ro-RO", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${day}, ora ${hour}`;
}
