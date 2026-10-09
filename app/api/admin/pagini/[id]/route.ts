import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin/require-admin-request";
import { connectDb } from "@/lib/db";
import { Page } from "@/lib/models";

/** Salvează titlul, conținutul și starea unei pagini. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;

  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Pagină negăsită." }, { status: 404 });
  const body = (await request.json()) as { titlu?: unknown; html?: unknown; publicata?: unknown; pePrimaPagina?: unknown };

  const set: Record<string, unknown> = {};
  if (typeof body.titlu === "string") {
    if (!body.titlu.trim()) return NextResponse.json({ error: "Titlul e obligatoriu." }, { status: 400 });
    set.title = body.titlu.trim();
  }
  if (typeof body.html === "string") set.bodyHtml = body.html;
  if (typeof body.publicata === "boolean") set.published = body.publicata;
  if (typeof body.pePrimaPagina === "boolean") set.promoted = body.pePrimaPagina;

  await connectDb();
  const p = await Page.findByIdAndUpdate(id, { $set: set }, { new: true }).lean();
  if (!p) return NextResponse.json({ error: "Pagină negăsită." }, { status: 404 });

  revalidatePath("/");
  revalidatePath(`/${p.slug}`);
  return NextResponse.json({ ok: true });
}
