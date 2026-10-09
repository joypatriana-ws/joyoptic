// Starea unei programări din admin: confirmată / în așteptare / anulată, sau ștergere.
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin/require-admin-request";
import { SCHIMBARI, type Stare } from "@/lib/admin/bookings";
import { connectDb } from "@/lib/db";
import { Booking } from "@/lib/models";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;

  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "negasita" }, { status: 404 });
  const { stare } = (await request.json()) as { stare?: Stare };
  if (!stare || !(stare in SCHIMBARI)) return NextResponse.json({ error: "stare_invalida" }, { status: 400 });

  await connectDb();
  try {
    const r = await Booking.updateOne({ _id: id }, { $set: SCHIMBARI[stare] });
    if (!r.matchedCount) return NextResponse.json({ error: "negasita" }, { status: 404 });
  } catch (e) {
    // o programare anulată nu poate reveni dacă între timp intervalul a fost luat
    if ((e as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: "ora_ocupata", message: "Intervalul e deja luat de altă programare din același departament. Fă o programare nouă pe alt interval." },
        { status: 409 },
      );
    }
    throw e;
  }
  return NextResponse.json({ ok: true, stare });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;

  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "negasita" }, { status: 404 });
  await connectDb();
  await Booking.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
