import { NextRequest, NextResponse } from "next/server";
import { takenSlots } from "@/lib/booking-slots";

/**
 * Intervalele deja ocupate într-o zi, într-un departament (fiecare departament are programările lui),
 * ca formularul să nu le mai ofere. Doar orele, fără date despre pacienți.
 */
export async function GET(request: NextRequest) {
  const data = request.nextUrl.searchParams.get("data") ?? "";
  const tip = Number(request.nextUrl.searchParams.get("tip"));
  return NextResponse.json({ ocupate: await takenSlots(data, tip) }, { headers: { "Cache-Control": "no-store" } });
}
