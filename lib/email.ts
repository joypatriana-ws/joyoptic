import { createHmac, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";
import { site } from "./site";
import { formatRo } from "./time";
import type { BookingDoc, MessageDoc } from "./models";

const FROM = process.env.EMAIL_FROM ?? `${site.name} <programari@joyoptic.ro>`;
const ADMIN = process.env.EMAIL_ADMIN ?? site.email;

async function send(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email neconfigurat] către ${opts.to}: ${opts.subject}\n${opts.text}`);
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

// ---------- emailuri ----------

export async function sendBookingEmails(b: BookingDoc) {
  const when = formatRo(b.start);
  const confirmUrl = `${process.env.SITE_URL ?? site.url}/programare/confirma/${b._id}/${confirmToken(b)}`;
  const details = [
    `Tip: ${b.bookingTypeTitle}`,
    `Data: ${when}`,
    `Medic: ${b.doctor || "oricare medic disponibil"}`,
  ];

  await Promise.all([
    send({
      to: ADMIN,
      replyTo: b.email,
      subject: `Programare nouă: ${b.name}, ${when}`,
      text: [...details, "", `Nume: ${b.name}`, `Telefon: ${b.phone}`, `Email: ${b.email}`].join("\n"),
    }),
    send({
      to: b.email,
      subject: `Confirmă programarea la ${site.name}`,
      text: [
        `Bună ziua, ${b.name},`,
        "",
        `Am primit cererea de programare la ${site.name}:`,
        ...details,
        "",
        "Te rugăm să confirmi programarea apăsând pe linkul de mai jos:",
        confirmUrl,
        "",
        `Dacă vrei să muți sau să anulezi programarea, sună-ne la ${site.phone}.`,
        "",
        `${site.name}, ${site.address}, ${site.city}`,
      ].join("\n"),
    }),
  ]);
}

export async function sendMessageEmail(m: MessageDoc) {
  await send({
    to: ADMIN,
    replyTo: m.email,
    subject: `Mesaj nou de pe site: ${m.subject || "fără subiect"}`,
    text: [`De la: ${m.name} <${m.email}>`, `Telefon: ${m.phone || "-"}`, `Subiect: ${m.subject}`, "", m.body].join("\n"),
  });
}
