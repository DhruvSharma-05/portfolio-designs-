/* GET  /api/library                 → folders + photos under the root
   GET  /api/library?folder=<id>     → folders + photos inside that folder
   POST /api/library { parentId, name } → create a new folder

   The photo picker in /admin runs on GET: pick a folder, tick the frames
   that belong to the project. The client-delivery folder picker in
   /admin also runs on GET (to drill into nested folders) and on POST
   (to create a fresh delivery folder without leaving the admin UI).    */

import { requireAuth } from "./_lib/auth.js";
import { driveClient, listFolders, listImages, folderMeta, createFolder } from "./_lib/drive.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const root =
    process.env.DRIVE_ROOT_FOLDER_ID ||
    process.env.DRIVE_WORK_FOLDER_ID;
  if (!root) {
    return res.status(500).json({
      error: "Set DRIVE_ROOT_FOLDER_ID to the Drive folder that holds the shoot folders",
    });
  }

  if (req.method === "POST") {
    const { parentId, name } = req.body || {};
    const target = parentId || root;
    const clean = String(name || "").trim().slice(0, 120);
    if (!clean) return res.status(400).json({ error: "Name the folder first" });
    try {
      const drive = driveClient();
      const meta = await folderMeta(drive, target);
      if (meta.trashed) return res.status(400).json({ error: "That folder is in the Drive bin" });
      if (meta.mimeType !== "application/vnd.google-apps.folder") {
        return res.status(400).json({ error: "That is a file, not a folder" });
      }
      const made = await createFolder(drive, target, clean);
      return res.status(200).json({ folder: made });
    } catch (e) {
      const msg = /insufficient|permission/i.test(e.message || "")
        ? "The service account needs Editor access on that folder to create folders inside it."
        : e.message || "Drive request failed";
      return res.status(500).json({ error: msg });
    }
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const drive = driveClient();
    const folder = req.query.folder;
    const parent = folder || root;

    const [folders, photos] = await Promise.all([
      listFolders(drive, parent),
      listImages(drive, parent),
    ]);
    return res.status(200).json({ root, folders, photos });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Drive request failed" });
  }
}
