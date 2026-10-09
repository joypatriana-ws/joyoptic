// Programare adăugată din admin (telefon / la cabinet), ca în kulttur.
// Se salvează direct confirmată; se poate și antedata, pentru evidență.
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin/require-admin-request";
import { connectDb } from "@/lib/db";
import { Booking } from "@/lib/models";
import { bookingTypes, doctors, hoursFor } from "@/lib/site";
import { bucharestToUtc } from "@/lib/time";
import { isDuplicateSlot, slotKey, takenSlots } from "@/lib/booking-slots";

const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;
const ORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const curata = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t.length ? t : null;
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const nume = curata(body.nume, 200);
    const telefon = curata(body.telefon, 30);
    const email = curata(body.email, 200);
    const data = curata(body.data, 10);
    const ora = curata(body.ora, 5);
    const mesaj = curata(body.mesaj, 1000);
    const tip = bookingTypes.find((t) => t.id === Number(body.tip));
    const medic = curata(body.medic, 100);

    if (!nume || !telefon || !data || !ora || !tip) {
      return NextResponse.json(
        { error: "lipsesc_campuri", message: "Nume, telefon, tip, dată și oră sunt obligatorii." },
        { status: 400 },
      );
    }
    if (!DATA_RE.test(data) || !ORA_RE.test(ora)) {
      return NextResponse.json({ error: "format_invalid", message: "Data sau ora au format greșit." }, { status: 400 });
    }
    if (!hoursFor(new Date(`${data}T12:00:00`)).includes(ora)) {
      return NextResponse.json(
        { error: "in_afara_programului", message: "Ora e în afara programului cabinetului." },
        { status: 400 },
      );
    }
    if (medic && !doctors.some((d) => d.name === medic)) {
      return NextResponse.json({ error: "medic_invalid", message: "Medicul ales nu există." }, { status: 400 });
    }

    const ocupat = { error: "ora_ocupata", message: "Intervalul e deja ocupat. Alege altă oră." };
    if ((await takenSlots(data)).includes(ora)) return NextResponse.json(ocupat, { status: 409 });

    await connectDb();
    const start = bucharestToUtc(data, ora);
    let creata;
    try {
      creata = await Booking.create({
      bookingTypeId: tip.id,
      bookingTypeTitle: tip.title,
      start,
      end: new Date(start.getTime() + 15 * 60_000),
      slot: slotKey(data, ora),
      confirmed: true,
      source: "admin",
      name: nume,
      phone: telefon,
      email: email ?? "",
      doctor: medic ?? "",
      message: mesaj ?? "",
      });
    } catch (e) {
      if (isDuplicateSlot(e)) return NextResponse.json(ocupat, { status: 409 });
      throw e;
    }
    return NextResponse.json({ ok: true, id: String(creata._id) });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
