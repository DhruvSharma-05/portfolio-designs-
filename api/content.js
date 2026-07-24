/* GET /api/content  → the client list as it stands in Drive
   PUT /api/content  → save it back

   /admin is client-delivery only — this endpoint only ever reads/writes
   the `clients` array. Saving is a whole-list write (the admin holds the
   entire list in memory and sends it back), but it MERGES onto the stored
   document rather than replacing it outright: `photoProjects`/`webProjects`
   are frozen leftovers from when /admin also managed portfolio projects,
   and a naive full overwrite here would silently wipe them. */

import { requireAuth } from "./_lib/auth.js";
import { driveClient, readContent, writeContent } from "./_lib/drive.js";

/* Keep only the fields the site actually renders, and coerce types, so
   a malformed request can never write junk into Drive. */
const str = (v, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const arr = (v) => (Array.isArray(v) ? v : []);

/* A client delivery, flat — no project underneath it. Codes are stored
   and compared lower-case so a client typing WEDDING-7Q4M2X still gets in. */
const cleanClientEntry = (c) => ({
  title: str(c.title, 120),
  name: str(c.name, 120),
  email: str(c.email, 200),
  folderId: str(c.folderId, 100),
  code: str(c.code, 60).toLowerCase().replace(/[^a-z0-9-]/g, ""),
  note: str(c.note, 600),
  revoked: Boolean(c.revoked),
});

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  let drive;
  try {
    drive = driveClient();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  if (req.method === "GET") {
    try {
      return res.status(200).json(await readContent(drive));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === "PUT") {
    const body = req.body || {};
    const clients = arr(body.clients).map(cleanClientEntry).filter((c) => c.code);

    // Codes are the only lock on a client's door — a duplicate would hand
    // one client another client's folder, the worst failure this system has.
    const codes = clients.map((c) => c.code);
    const dupe = codes.find((c, i) => codes.indexOf(c) !== i);
    if (dupe) {
      return res.status(400).json({ error: `Two clients share the code "${dupe}" — give one a new code` });
    }

    try {
      const existing = await readContent(drive);
      return res.status(200).json(await writeContent(drive, { ...existing, clients }));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed" });
}
