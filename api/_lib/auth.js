/* ==================================================================
   ADMIN AUTH — one password, one signed cookie.

   There is exactly one admin (Viraj), so a full user system would be
   overkill. He posts a password; if it matches ADMIN_PASSWORD we hand
   back an HMAC-signed, httpOnly session cookie. Every write endpoint
   calls requireAuth() before touching Drive.

   The cookie is signed (not encrypted) — it carries no secrets, only
   an expiry, and the signature is what stops it being forged.
   ================================================================== */

import crypto from "node:crypto";

const COOKIE = "cc_admin";
const DAYS = 7;

const secret = () =>
  process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";

/* base64url helpers — cookies dislike +, / and = */
const b64 = (s) => Buffer.from(s).toString("base64url");
const unb64 = (s) => Buffer.from(s, "base64url").toString("utf8");

function hmac(body) {
  return crypto.createHmac("sha256", secret()).update(body).digest("base64url");
}

export function issueSession() {
  const body = b64(JSON.stringify({ exp: Date.now() + DAYS * 864e5 }));
  return `${body}.${hmac(body)}`;
}

export function verifySession(token) {
  if (!token || !secret()) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  // constant-time compare so a wrong signature can't be probed byte by byte
  const expected = hmac(body);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) return false;
  try {
    return JSON.parse(unb64(body)).exp > Date.now();
  } catch {
    return false;
  }
}

/* The password check itself, also constant-time. */
export function checkPassword(given) {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real || typeof given !== "string" || given.length !== real.length) return false;
  return crypto.timingSafeEqual(Buffer.from(given), Buffer.from(real));
}

export function readCookie(req) {
  const raw = req.headers.cookie || "";
  const hit = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  return hit ? decodeURIComponent(hit.slice(COOKIE.length + 1)) : "";
}

export function setCookie(res, token) {
  const bits = [
    `${COOKIE}=${encodeURIComponent(token)}`,
    "Path=/", "HttpOnly", "SameSite=Lax",
    `Max-Age=${DAYS * 86400}`,
  ];
  if (process.env.VERCEL) bits.push("Secure");
  res.setHeader("Set-Cookie", bits.join("; "));
}

export function clearCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

/* Guard for every protected endpoint. Returns true when the request may
   proceed; otherwise it has already answered 401 and the caller stops. */
export function requireAuth(req, res) {
  if (verifySession(readCookie(req))) return true;
  res.status(401).json({ error: "Not signed in" });
  return false;
}
