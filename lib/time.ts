const TZ = "Europe/Bucharest";

/** „2026-10-09" + „18:00" în ora României → momentul UTC corespunzător (ține cont de ora de vară). */
export function bucharestToUtc(date: string, time: string): Date {
  const asUtc = new Date(`${date}T${time}:00Z`);
  const offsetMs =
    new Date(asUtc.toLocaleString("en-US", { timeZone: TZ })).getTime() -
    new Date(asUtc.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
  return new Date(asUtc.getTime() - offsetMs);
}
