import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin/require-admin-request";
import { connectDb } from "@/lib/db";
import { Message } from "@/lib/models";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "negasit" }, { status: 404 });
  const { citit } = (await request.json()) as { citit?: boolean };
  await connectDb();
  await Message.updateOne({ _id: id }, { $set: { read: Boolean(citit) } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdminRequest(request);
  if (auth) return auth;
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "negasit" }, { status: 404 });
  await connectDb();
  await Message.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
