/* ==================================================================
   SMTP send — any provider works (Gmail app password, SendGrid,
   Mailgun, a private mail server, ...); this deliberately doesn't
   integrate a specific provider's HTTP API, just plain SMTP via
   nodemailer, configured from env vars.

   One transport per send, not pooled: a serverless container can be
   frozen/recycled between invocations, and a pooled connection left
   open across that would just hang or time out on the next call.
   ================================================================== */

import nodemailer from "nodemailer";

export function mailTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP is not configured — set SMTP_HOST/SMTP_USER/SMTP_PASS");
  }
  const port = Number(SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendMail({ to, subject, text }) {
  const transport = mailTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    return await transport.sendMail({ from, to, subject, text });
  } catch (e) {
    const msg = /auth/i.test(e.message || "")
      ? "SMTP login failed — check SMTP_USER/SMTP_PASS (many providers need an app password, not your normal one)."
      : e.message || "Could not send the email";
    throw new Error(msg);
  }
}
