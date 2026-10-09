import type { Metadata } from "next";
import { ErrorPage } from "@/components/theme/error-page";

export const metadata: Metadata = { title: "Pagina nu a fost găsită", robots: { index: false } };

/** notFound() din paginile site-ului (ex. /page-inexistenta, un articol șters). */
export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="Pagina nu a fost găsită"
      text="Pagina căutată nu mai există sau adresa a fost scrisă greșit. Te ajutăm să găsești ce cauți."
    />
  );
}
