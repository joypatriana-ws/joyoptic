import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { sendMessageEmail } from "@/lib/email";
import { Message } from "@/lib/models";

const schema = z.object({
  name: z.string().trim().min(2, "Scrie-ne numele tău."),
  email: z.string().trim().pipe(z.email("Scrie o adresă de email validă.")),
  phone: z.string().trim().max(30).default(""),
  subject: z.string().trim().max(120).default(""),
  body: z.string().trim().min(5, "Scrie mesajul.").max(5000, "Mesajul este prea lung."),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Verifică câmpurile marcate.",
        errors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      },
      { status: 400 },
    );
  }
  const { website, ...data } = parsed.data;
  const ok = { message: "Mulțumim! Revenim cu un răspuns prin email sau telefon." };
  if (website) return NextResponse.json(ok);

  await connectDb();
  const message = await Message.create(data);
  await sendMessageEmail(message.toObject());

  return NextResponse.json(ok);
}
