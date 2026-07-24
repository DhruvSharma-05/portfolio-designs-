/* POST /api/mail  { to, subject, text }

   Admin-only. Emails a client the same message the "Copy message" button
   in /admin already builds (WhatsApp text, reused verbatim) — the server
   owns no template of its own, so the emailed copy can never drift from
   the WhatsApp one.                                                    */

import { requireAuth } from "./_lib/auth.js";
import { sendMail } from "./_lib/mail.js";

const looksLikeEmail = (s) => /\S+@\S+\.\S+/.test(s || "");

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, text } = req.body || {};
  if (!looksLikeEmail(to)) return res.status(400).json({ error: "Enter a valid email address" });
  if (!subject || !text) return res.status(400).json({ error: "Missing subject or message" });

  try {
    await sendMail({
      to: String(to).slice(0, 200),
      subject: String(subject).slice(0, 200),
      text: String(text).slice(0, 5000),
    });
    return res.status(200).json({ sent: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Could not send the email" });
  }
}
