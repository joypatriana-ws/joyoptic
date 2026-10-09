import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { sendBookingEmails } from "@/lib/email";
import { Booking } from "@/lib/models";
import { bookingTypes, doctors, hoursFor, phonePattern } from "@/lib/site";
import { bucharestToUtc } from "@/lib/time";
import { isDuplicateSlot, slotKey, takenSlots } from "@/lib/booking-slots";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Alege o dată validă."),
  hour: z.string().regex(/^\d{2}:\d{2}$/, "Alege o oră validă."),
  bookingType: z.coerce.number().refine((id) => bookingTypes.some((t) => t.id === id), "Alege un departament."),
  doctor: z
    .string()
    .default("")
    .refine((d) => d === "" || doctors.some((x) => x.name === d), "Alege un medic."),
  name: z.string().trim().min(1, "Te rugăm să completezi numele."),
  phone: z.string().trim().regex(phonePattern, "Te rugăm să introduci un număr de telefon valid."),
  email: z.string().trim().pipe(z.email("Introduceți o adresă de email validă.")),
  message: z.string().trim().max(5000).default(""),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Formularul conține erori.",
        errors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Bot: câmpul ascuns a fost completat. Răspundem ca la succes, fără să salvăm.
  if (d.website) return NextResponse.json({ message: "Programarea a fost salvată cu succes!" });

  const start = bucharestToUtc(d.date, d.hour);
  const allowed = hoursFor(new Date(`${d.date}T12:00:00`));
  if (!allowed.includes(d.hour) || start.getTime() < Date.now()) {
    return NextResponse.json(
      { message: "Alege o dată și o oră din programul cabinetului (duminica este închis).", errors: { hour: "Alege o oră validă." } },
      { status: 400 },
    );
  }

  const ocupat = { message: "Intervalul ales tocmai a fost ocupat. Alege altă oră.", errors: { hour: "Interval ocupat." } };
  if ((await takenSlots(d.date)).includes(d.hour)) return NextResponse.json(ocupat, { status: 409 });

  await connectDb();
  let booking;
  try {
    booking = await Booking.create({
    bookingTypeId: d.bookingType,
    bookingTypeTitle: bookingTypes.find((t) => t.id === d.bookingType)!.title,
    start,
    end: new Date(start.getTime() + 15 * 60_000),
    slot: slotKey(d.date, d.hour),
    name: d.name,
    phone: d.phone,
    email: d.email,
    doctor: d.doctor,
    message: d.message,
    });
  } catch (e) {
    // doi pacienți au trimis aproape simultan pe același interval
    if (isDuplicateSlot(e)) return NextResponse.json(ocupat, { status: 409 });
    throw e;
  }

  await sendBookingEmails(booking.toObject());

  return NextResponse.json({ message: "Programarea a fost salvată cu succes!" });
}
