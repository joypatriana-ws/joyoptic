import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword, passwordProblem } from "@/lib/admin/password";
import { getAdminSession, requireAdminRequest } from "@/lib/admin/require-admin-request";
import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";

/** Schimbă numele, parola sau starea (activ / dezactivat) unui cont. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;

  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Cont negăsit." }, { status: 404 });
  const body = (await request.json()) as { nume?: unknown; parola?: unknown; activ?: unknown };
  const set: Record<string, unknown> = {};

  if (typeof body.nume === "string") {
    if (!body.nume.trim()) return NextResponse.json({ error: "Numele e obligatoriu." }, { status: 400 });
    set.name = body.nume.trim();
  }
  if (typeof body.parola === "string") {
    const problema = passwordProblem(body.parola);
    if (problema) return NextResponse.json({ error: problema }, { status: 400 });
    set.passwordHash = await hashPassword(body.parola);
  }
  if (typeof body.activ === "boolean") {
    // nu te poți dezactiva singur (ai rămâne pe dinafară)
    const session = await getAdminSession(request);
    if (!body.activ && session?.userId === id) {
      return NextResponse.json({ error: "Nu îți poți dezactiva propriul cont." }, { status: 400 });
    }
    set.active = body.activ;
  }

  await connectDb();
  const r = await User.updateOne({ _id: id }, { $set: set });
  if (!r.matchedCount) return NextResponse.json({ error: "Cont negăsit." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
