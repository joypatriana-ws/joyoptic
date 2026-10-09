import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin/require-admin-request";
import { connectDb } from "@/lib/db";
import { Block } from "@/lib/models";

type Oferta = { media: string; title: string; html: string };

const MEDIA = new Set(["/img/offers/offer1.svg", "/img/offers/offer2.svg", "/img/offers/offer3.svg"]);

/** Pornește / oprește secțiunea de oferte și salvează cardurile. */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;

  const body = (await request.json()) as { activ?: unknown; oferte?: unknown };
  const set: Record<string, unknown> = {};
  if (typeof body.activ === "boolean") set.active = body.activ;
  if (Array.isArray(body.oferte)) {
    const oferte = (body.oferte as Partial<Oferta>[]).map((o) => ({
      media: typeof o.media === "string" && MEDIA.has(o.media) ? o.media : "/img/offers/offer1.svg",
      title: typeof o.title === "string" ? o.title.trim().slice(0, 120) : "",
      html: typeof o.html === "string" ? o.html.trim().slice(0, 1000) : "",
    }));
    if (oferte.some((o) => !o.title || !o.html)) {
      return NextResponse.json({ error: "Fiecare ofertă are nevoie de titlu și text." }, { status: 400 });
    }
    set.items = oferte;
  }

  await connectDb();
  await Block.updateOne({ alias: "special-offers" }, { $set: set }, { upsert: true });
  // secțiunea e pe prima pagină, iar linkul „Oferte" e în meniul din layout
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
