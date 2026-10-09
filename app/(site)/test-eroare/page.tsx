import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/** Doar pentru verificarea paginii 500 în dezvoltare; în producție nu există (404). */
export default function TestEroare() {
  if (process.env.NODE_ENV === "production") notFound();
  throw new Error("Eroare de test pentru pagina 500");
}
