/* GET /api/content  → the client deliveries as they stand in Drive
   PUT /api/content  → save them back

   Saving is a whole-document write: the admin holds the entire list in
   memory and sends it back. With a single editor that is the simplest
   correct thing — no partial-update merge logic to get wrong. */

import { requireAuth } from "./_lib/auth.js";
import { driveClient, readContent, writeContent } from "./_lib/drive.js";

/* Keep only the fields the site actually uses, and coerce types, so a
   malformed request can never write junk into Drive. */
const str = (v, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const arr = (v) => (Array.isArray(v) ? v : []);

/* Codes are stored and compared lower-case so a client typing
   WEDDING-7Q4M2X still gets in. */
const cleanDelivery = (d) => {
  if (!d || typeof d !== "object") return { title: "", code: "" };
  return {
    title: str(d.title, 120),
    name: str(d.name, 120),
    email: str(d.email, 200),
    folderId: str(d.folderId, 100),
    code: str(d.code, 60).toLowerCase().replace(/[^a-z0-9-]/g, ""),
    note: str(d.note, 600),
    revoked: Boolean(d.revoked),
  };
};

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
    const next = {
      deliveries: arr(body.deliveries).map(cleanDelivery).filter((d) => d.title && d.code),
    };

    /* Codes gate a public endpoint, so a duplicate would hand one
       client another client's folder — the worst failure this system
       has. */
    const codes = next.deliveries.map((d) => d.code);
    const dupe = codes.find((c, i) => codes.indexOf(c) !== i);
    if (dupe) {
      return res.status(400).json({ error: `Two clients share the code "${dupe}" — give one a new code` });
    }
    try {
      return res.status(200).json(await writeContent(drive, next));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed" });
}
