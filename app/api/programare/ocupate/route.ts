import { NextRequest, NextResponse } from "next/server";
import { takenSlots } from "@/lib/booking-slots";
import { doctors } from "@/lib/site";

/**
 * Intervalele deja ocupate într-o zi la un medic (fiecare medic are programările lui),
 * ca formularul să nu le mai ofere. Doar orele, fără date despre pacienți.
 */
export async function GET(request: NextRequest) {
  const data = request.nextUrl.searchParams.get("data") ?? "";
  const medic = request.nextUrl.searchParams.get("medic") ?? "";
  if (!doctors.some((d) => d.name === medic)) return NextResponse.json({ ocupate: [] });
  return NextResponse.json({ ocupate: await takenSlots(data, medic) }, { headers: { "Cache-Control": "no-store" } });
}
