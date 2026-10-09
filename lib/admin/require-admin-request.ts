import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";
import { ADMIN_COOKIE, verifyAdminToken, type AdminSession } from "./token";

/**
 * Pentru API routes din /api/admin: token valid + cont încă activ.
 * Returnează 401 dacă e respins, null dacă e permis (ca în kulttur).
 * Contul se verifică în DB, ca dezactivarea unui utilizator să-l scoată imediat.
 */
export async function requireAdminRequest(request: NextRequest): Promise<NextResponse | null> {
  const session = await getAdminSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDb();
  const user = await User.findById(session.userId).select("active").lean();
  if (!user?.active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return null;
}

/** Sesiunea admin (userId) sau null. */
export async function getAdminSession(request: NextRequest): Promise<AdminSession | null> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}
