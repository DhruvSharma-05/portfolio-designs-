/* POST /api/share  { folderId, action: "grant" | "revoke" | "check" }

   Admin-only. Turns link sharing on or off for ONE delivery folder, so
   Viraj never has to open Drive's own share dialog — which is where
   the dangerous mistake lives (sharing a parent folder exposes every
   client inside it).
   ================================================================== */

import { requireAuth } from "./_lib/auth.js";
import {
  driveClient, grantLinkAccess, revokeLinkAccess, shareState, folderMeta, countImages,
} from "./_lib/drive.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { folderId, action = "check" } = req.body || {};
  if (!folderId) return res.status(400).json({ error: "Pick a delivery folder first" });

  try {
    const drive = driveClient();

    // Confirm it is a real, live folder before touching permissions —
    // a deleted or mistyped id should fail here with a clear message.
    const meta = await folderMeta(drive, folderId);
    if (meta.trashed) return res.status(400).json({ error: "That folder is in the Drive bin" });
    if (meta.mimeType !== "application/vnd.google-apps.folder") {
      return res.status(400).json({ error: "That is a file, not a folder" });
    }

    let state;
    if (action === "grant") state = await grantLinkAccess(drive, folderId);
    else if (action === "revoke") state = await revokeLinkAccess(drive, folderId);
    else state = await shareState(drive, folderId);

    const count = await countImages(drive, folderId).catch(() => null);
    return res.status(200).json({ ...state, name: meta.name, count });
  } catch (e) {
    const msg = /insufficient|permission/i.test(e.message || "")
      ? "The service account needs Editor access on that folder to share it."
      : e.message || "Drive request failed";
    return res.status(500).json({ error: msg });
  }
}
