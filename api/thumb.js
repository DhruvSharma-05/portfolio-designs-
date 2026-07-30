/* GET /api/thumb?id=<driveFileId>

   Streams a Drive image through the server so the admin can preview
   photos that are NOT publicly shared. The service-account credentials
   never leave the server; the browser only ever sees this URL.

   Only used by /admin — the public site serves optimised local WebP
   files written at build time, never this route.                      */

import { requireAuth } from "./_lib/auth.js";
import { driveClient, fileBytes } from "./_lib/drive.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    const drive = driveClient();
    const meta = await drive.files.get({ fileId: id, fields: "mimeType" });
    const bytes = await fileBytes(drive, id);

    res.setHeader("Content-Type", meta.data.mimeType || "image/jpeg");
    // private: it is behind auth, but the browser may reuse it freely
    res.setHeader("Cache-Control", "private, max-age=3600");
    return res.status(200).send(bytes);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Could not read that file" });
  }
}
