import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/token";
import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";
import UtilizatoriClient, { type Utilizator } from "./UtilizatoriClient";

export const dynamic = "force-dynamic";

export default async function PaginaUtilizatori() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;

  await connectDb();
  const docs = await User.find().sort({ createdAt: 1 }).lean();
  const utilizatori: Utilizator[] = docs.map((u) => ({
    id: String(u._id),
    nume: u.name,
    email: u.email,
    activ: Boolean(u.active),
    areParola: Boolean(u.passwordHash),
    ultimaLogare: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
  }));

  return <UtilizatoriClient utilizatori={utilizatori} eu={session?.userId ?? ""} />;
}
