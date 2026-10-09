import { NextRequest, NextResponse } from "next/server";
import { hashPassword, passwordProblem } from "@/lib/admin/password";
import { requireAdminRequest } from "@/lib/admin/require-admin-request";
import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";

/** Cont nou de admin, cu parola setată de cine îl creează (ca în kulttur). */
export async function POST(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;

  const body = (await request.json()) as { email?: unknown; nume?: unknown; parola?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const nume = typeof body.nume === "string" ? body.nume.trim() : "";
  const parola = typeof body.parola === "string" ? body.parola : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Email invalid." }, { status: 400 });
  if (!nume) return NextResponse.json({ error: "Numele e obligatoriu." }, { status: 400 });
  const problema = passwordProblem(parola);
  if (problema) return NextResponse.json({ error: problema }, { status: 400 });

  await connectDb();
  if (await User.exists({ email })) return NextResponse.json({ error: "Există deja un cont cu acest email." }, { status: 409 });
  const u = await User.create({ email, name: nume, passwordHash: await hashPassword(parola), active: true });
  return NextResponse.json({ ok: true, id: String(u._id) });
}
