import { NextRequest, NextResponse } from "next/server";
import { takenSlots } from "@/lib/booking-slots";

/** Intervalele deja ocupate într-o zi, ca formularul să nu le mai ofere. Doar orele, fără date despre pacienți. */
export async function GET(request: NextRequest) {
  const data = request.nextUrl.searchParams.get("data") ?? "";
  return NextResponse.json({ ocupate: await takenSlots(data) }, { headers: { "Cache-Control": "no-store" } });
}
