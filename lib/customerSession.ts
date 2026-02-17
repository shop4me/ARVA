/**
 * Customer session cookie: signed payload so we don't need server-side session store.
 */

import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "arva_customer";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SECRET =
  process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_PASSWORD || "arva-session-secret";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE;
  const payload = `${email}|${exp}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifySessionToken(token: string): { email: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split("|");
    if (parts.length !== 3) return null;
    const [email, expStr, sig] = parts;
    const exp = parseInt(expStr, 10);
    if (Number.isNaN(exp) || exp < Date.now() / 1000) return null;
    const payload = `${email}|${expStr}`;
    const expected = sign(payload);
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    return { email };
  } catch {
    return null;
  }
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
