import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { sendBookingEmails } from "@/lib/email";
import { Booking } from "@/lib/models";
import { bookingTypes, doctors, slotsFor } from "@/lib/site";
import { bucharestToUtc } from "@/lib/time";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Alege ziua programării."),
  hour: z.string().regex(/^\d{2}:\d{2}$/, "Alege ora programării."),
  bookingType: z.coerce.number().refine((id) => bookingTypes.some((t) => t.id === id), "Alege tipul consultației."),
  doctor: z
    .string()
    .default("")
    .refine((d) => d === "" || doctors.some((x) => x.value === d), "Medicul ales nu există."),
  name: z.string().trim().min(3, "Scrie numele și prenumele."),
  phone: z
    .string()
    .transform((p) => p.replace(/[\s().-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{9,15}$/, "Scrie un număr de telefon valid, de exemplu 0787 698 398.")),
  email: z.string().trim().pipe(z.email("Scrie o adresă de email validă.")),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Verifică câmpurile marcate.",
        errors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Bot: câmpul ascuns a fost completat. Răspundem ca la succes, fără să salvăm.
  if (d.website) return NextResponse.json({ message: "Programarea a fost trimisă." });

  const start = bucharestToUtc(d.date, d.hour);
  const allowed = slotsFor(new Date(`${d.date}T12:00:00`));
  if (!allowed.includes(d.hour) || start.getTime() < Date.now()) {
    return NextResponse.json(
      { message: "Ora aleasă nu mai este disponibilă.", errors: { hour: "Alege o oră din programul cabinetului, în viitor." } },
      { status: 400 },
    );
  }

  await connectDb();
  const booking = await Booking.create({
    bookingTypeId: d.bookingType,
    bookingTypeTitle: bookingTypes.find((t) => t.id === d.bookingType)!.title,
    start,
    end: new Date(start.getTime() + 15 * 60_000),
    name: d.name,
    phone: d.phone,
    email: d.email,
    doctor: d.doctor,
  });

  await sendBookingEmails(booking.toObject());

  return NextResponse.json({
    message: `Ți-am trimis un email la ${d.email}. Apasă linkul din el ca să confirmi programarea.`,
  });
}
