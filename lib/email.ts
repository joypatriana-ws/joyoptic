import { createHmac, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";
import { site } from "./site";
import { adminBookingHtml, adminMessageHtml, userBookingHtml } from "./email-templates";
import type { BookingDoc, MessageDoc } from "./models";

const FROM = process.env.EMAIL_FROM ?? `${site.name} <programari@joyoptic.ro>`;
const ADMIN = process.env.EMAIL_ADMIN ?? site.email;

export async function send(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email neconfigurat] către ${opts.to}: ${opts.subject}`);
    // în dezvoltare, linkurile din email (ex. setarea parolei) apar în consolă
    if (process.env.NODE_ENV !== "production") console.info(opts.html.match(/href="([^"]+)"/g)?.join("\n") ?? "");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM, ...opts });
  if (error) console.error("Eroare Resend:", error);
}

// ---------- link de confirmare a programării ----------

function secret() {
  const s = process.env.BOOKING_SECRET;
  if (!s) throw new Error("Lipsește BOOKING_SECRET");
  return s;
}

export function confirmToken(b: Pick<BookingDoc, "_id" | "start">) {
  return createHmac("sha256", secret())
    .update(`${b._id}:${b.start.toISOString()}`)
    .digest("base64url");
}

export function isValidToken(b: Pick<BookingDoc, "_id" | "start">, token: string) {
  const expected = Buffer.from(confirmToken(b));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

// ---------- emailuri (template-urile din tema veche) ----------

/** date('d-m-Y') / date('H:i') din PHP, pe ora României */
function ro(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Bucharest",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return { date: `${p.day}-${p.month}-${p.year}`, hour: `${p.hour}:${p.minute}` };
}

export async function sendBookingEmails(b: BookingDoc) {
  const { date, hour } = ro(b.start);
  const data = { name: b.name, phone: b.phone, email: b.email, date, hour, type: b.bookingTypeTitle, medic: b.doctor };
  const confirmUrl = `${process.env.SITE_URL ?? site.url}/programare/confirma/${b._id}/${confirmToken(b)}`;

  // ca pe site-ul vechi: întâi emailul către cabinet, apoi confirmarea către pacient
  await send({ to: ADMIN, replyTo: b.email, subject: "Programare nouă - JoyOptic", html: adminBookingHtml(data) });
  await send({ to: b.email, subject: "Confirmare programare - JoyOptic", html: userBookingHtml({ ...data, confirmUrl }) });
}

export async function sendMessageEmail(m: MessageDoc) {
  const { date, hour } = ro(m.createdAt ?? new Date());
  await send({
    to: ADMIN,
    replyTo: m.email,
    subject: "Mesaj nou - JoyOptic",
    html: adminMessageHtml({
      name: m.name,
      phone: m.phone,
      email: m.email,
      date: `${date} ${hour}`,
      subject: m.subject,
      body: m.body,
    }),
  });
}

