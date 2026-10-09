/**
 * Token de admin, după modelul din kulttur (lib/admin/token.ts): WebCrypto, deci merge
 * și în proxy.ts, și în API routes / layout-uri.
 *
 * Format: `{timestamp}.{userId}.{hmac}`, hmac = HMAC-SHA256(ADMIN_SECRET, "{timestamp}.{userId}").
 * JoyOptic are un singur rol (admin), deci fără câmpul de rol din kulttur.
 */

// „Remember Me Duration" din Croogo era +1 week
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const ADMIN_COOKIE = "admin_token";
export const ADMIN_COOKIE_MAX_AGE = TOKEN_TTL_MS / 1000;

export interface AdminSession {
  userId: string;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET env var is required");
  return secret;
}

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createAdminToken(userId: string): Promise<string> {
  const payload = `${Date.now()}.${userId}`;
  return `${payload}.${await hmac(getSecret(), payload)}`;
}

/** Sesiunea din token, sau null pentru token invalid / expirat. */
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const [timestamp, userId, sig] = token.split(".");
    if (!timestamp || !userId || !sig) return null;
    if (!/^[a-f0-9]{24}$/i.test(userId)) return null;

    const age = Date.now() - parseInt(timestamp, 10);
    if (isNaN(age) || age < 0 || age > TOKEN_TTL_MS) return null;

    const expected = await hmac(getSecret(), `${timestamp}.${userId}`);
    return safeEqual(sig, expected) ? { userId } : null;
  } catch {
    return null;
  }
}
