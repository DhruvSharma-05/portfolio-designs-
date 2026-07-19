/* POST   /api/auth   { password }  → sets the session cookie
   GET    /api/auth                 → { authed }
   DELETE /api/auth                 → signs out                        */

import {
  checkPassword, issueSession, setCookie, clearCookie,
  readCookie, verifySession,
} from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      authed: verifySession(readCookie(req)),
      configured: Boolean(process.env.ADMIN_PASSWORD),
    });
  }

  if (req.method === "DELETE") {
    clearCookie(res);
    return res.status(200).json({ authed: false });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: "ADMIN_PASSWORD is not set on the server" });
  }

  const password = req.body?.password;
  if (!checkPassword(password)) {
    // deliberately vague, and slowed a little to blunt guessing
    await new Promise((r) => setTimeout(r, 600));
    return res.status(401).json({ error: "Wrong password" });
  }

  setCookie(res, issueSession());
  return res.status(200).json({ authed: true });
}
