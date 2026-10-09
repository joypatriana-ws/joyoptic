import type { Metadata } from "next";
import Link from "next/link";
import { isValidObjectId } from "mongoose";
import { connectDb } from "@/lib/db";
import { isValidToken } from "@/lib/email";
import { Booking } from "@/lib/models";
import { site } from "@/lib/site";
import { formatRo } from "@/lib/time";

export const metadata: Metadata = { title: "Confirmare programare", robots: { index: false } };

async function confirm(id: string, token: string) {
  if (!isValidObjectId(id)) return { ok: false as const };
  await connectDb();
  const booking = await Booking.findById(id);
  if (!booking || !isValidToken(booking, token)) return { ok: false as const };
  const already = booking.confirmed;
  if (!already) {
    booking.confirmed = true;
    await booking.save();
  }
  return { ok: true as const, already, when: formatRo(booking.start) };
}

export default async function ConfirmPage({ params }: { params: Promise<{ id: string; token: string }> }) {
  const { id, token } = await params;
  const r = await confirm(id, token);

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      {r.ok ? (
        <>
          <h1 className="text-4xl font-bold tracking-tight">
            {r.already ? "Programarea era deja confirmată" : "Programarea este confirmată"}
          </h1>
          <p className="mt-4 text-lg">
            Te așteptăm {r.when}, pe {site.address}, {site.city}.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold tracking-tight">Linkul de confirmare nu este valid</h1>
          <p className="mt-4 text-lg">
            Linkul poate fi incomplet sau programarea a fost mutată. Sună-ne la{" "}
            <a href={site.phoneHref} className="font-bold underline underline-offset-4">
              {site.phone}
            </a>{" "}
            și confirmăm telefonic.
          </p>
        </>
      )}
      <Link href="/" className="mt-8 inline-block font-bold text-lentila underline underline-offset-4">
        Înapoi la pagina principală
      </Link>
    </section>
  );
}
