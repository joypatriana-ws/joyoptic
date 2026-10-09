import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, createAdminToken } from "@/lib/admin/token";

const FAIL_MESSAGE = "Email sau parolă incorectă";

/** Login cu email + parolă (modelul din kulttur). */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: FAIL_MESSAGE }, { status: 401 });

    await connectDb();
    const user = await User.findOne({ email, active: true }).lean();
    // cont importat din Croogo, încă fără parolă: tot „incorect", fără să spunem că emailul există
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: FAIL_MESSAGE }, { status: 401 });
    }

    User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } }).catch(() => {});

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, await createAdminToken(String(user._id)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}
