import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { isValidToken } from "@/lib/email";
import { Booking } from "@/lib/models";

/** BookingsController::confirm: confirmă și trimite înapoi pe prima pagină, cu mesaj flash. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string; token: string }> }) {
  const { id, token } = await params;
  const back = (flash: string) => NextResponse.redirect(new URL(`/?flash=${flash}`, req.url));

  if (!id || !token) return back("link-invalid");
  if (!isValidObjectId(id)) return back("programare-invalida");

  await connectDb();
  const booking = await Booking.findById(id);
  if (!booking) return back("programare-invalida");
  if (!isValidToken(booking, token)) return back("cod-invalid");
  if (booking.confirmed) return back("deja-confirmata");

  try {
    booking.confirmed = true;
    await booking.save();
    return back("confirmata");
  } catch {
    return back("eroare-confirmare");
  }
}
