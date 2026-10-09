import { connectDb } from "@/lib/db";
import { Message } from "@/lib/models";
import { contactSubjects } from "@/lib/site";
import MesajeClient, { type Mesaj } from "./MesajeClient";

export const dynamic = "force-dynamic";

async function iaMesajele(): Promise<Mesaj[]> {
  await connectDb();
  const docs = await Message.find().sort({ createdAt: -1 }).limit(500).lean();
  return docs.map((m) => ({
    id: String(m._id),
    nume: m.name,
    email: m.email,
    telefon: m.phone || null,
    // subiectul se salvează ca valoarea din formular („Consultatie oftalmologica"); afișăm eticheta cu diacritice
    subiect: contactSubjects.find((s) => s.value === m.subject)?.label ?? (m.subject || null),
    mesaj: m.body,
    citit: Boolean(m.read),
    creatLa: new Date(m.createdAt).toISOString(),
  }));
}

export default async function PaginaMesaje() {
  return <MesajeClient mesaje={await iaMesajele()} />;
}
