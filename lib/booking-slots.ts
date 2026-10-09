import { connectDb } from "./db";
import { Booking } from "./models";

/** Cheia intervalului: „YYYY-MM-DD HH:MM" pe ora României. */
export const slotKey = (data: string, ora: string) => `${data} ${ora}`;

/** Orele ocupate (de programări neanulate) ale unui medic într-o zi „YYYY-MM-DD". */
export async function takenSlots(data: string, doctor: string): Promise<string[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !doctor) return [];
  await connectDb();
  const docs = await Booking.find({ doctor, slot: { $gte: `${data} `, $lt: `${data}~` }, cancelled: false })
    .select("slot")
    .lean();
  return docs.map((d) => d.slot.slice(11));
}

/** Eroarea MongoDB de index unic (intervalul tocmai a fost luat de altă programare). */
export const isDuplicateSlot = (e: unknown) => (e as { code?: number })?.code === 11000;
