import { connectDb } from "@/lib/db";
import { Booking } from "@/lib/models";
import { bucharestParts } from "@/lib/admin/bookings";
import ProgramariClient, { type Programare } from "./ProgramariClient";

export const dynamic = "force-dynamic";

async function iaProgramarile(): Promise<Programare[]> {
  await connectDb();
  const docs = await Booking.find().sort({ start: -1 }).limit(1000).lean();
  return docs.map((b) => {
    const { data, ora } = bucharestParts(new Date(b.start));
    return {
      id: String(b._id),
      nume: b.name,
      email: b.email || null,
      telefon: b.phone || null,
      data,
      ora,
      tip: b.bookingTypeTitle,
      tipId: b.bookingTypeId,
      medic: b.doctor || null,
      mesaj: b.message || null,
      confirmata: Boolean(b.confirmed),
      anulata: Boolean(b.cancelled),
      sursa: b.source === "admin" ? "admin" : "site",
      creataLa: new Date(b.createdAt).toISOString(),
    };
  });
}

/** Programările într-un calendar lunar (ProgramariClient din kulttur, adaptat). */
export default async function PaginaProgramari() {
  return <ProgramariClient programari={await iaProgramarile()} />;
}
