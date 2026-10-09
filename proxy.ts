import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/token";

const ADMIN_PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/auth/login"]);

/** Protejează /admin și /api/admin: fără token valid → la login (pagini) sau 401 (API). */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (ADMIN_PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const login = new URL("/admin/login", request.url);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
