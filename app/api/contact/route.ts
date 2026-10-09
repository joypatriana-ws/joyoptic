import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { sendMessageEmail } from "@/lib/email";
import { Message } from "@/lib/models";
import { contactSubjects, phonePattern } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(1, "Completează numele."),
  email: z.string().trim().pipe(z.email("Adresa de email nu este validă.")),
  phone: z.string().trim().regex(phonePattern, "Numărul de telefon nu este valid."),
  subject: z.string().refine((s) => contactSubjects.some((x) => x.value === s), "Alege un subiect."),
  body: z.string().trim().min(1, "Scrie mesajul.").max(5000, "Mesajul este prea lung."),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Mesajul nu a fost trimis.",
        errors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      },
      { status: 400 },
    );
  }
  const { website, ...data } = parsed.data;
  const ok = { message: "Mesajul a fost trimis" };
  if (website) return NextResponse.json(ok);

  await connectDb();
  const message = await Message.create(data);
  await sendMessageEmail(message.toObject());

  return NextResponse.json(ok);
}
