/* GET /api/library                 → folders under the root
   GET /api/library?folder=<id>     → images inside that folder

   The photo picker in /admin runs on this: pick a folder, tick the
   frames that belong to the project.                                  */

import { requireAuth } from "./_lib/auth.js";
import { driveClient, listFolders, listImages } from "./_lib/drive.js";

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

  try {
    const drive = driveClient();
    const folder = req.query.folder;

    if (!folder) {
      const folders = await listFolders(drive, root);
      // images sitting loose in the root are usable too
      const loose = await listImages(drive, root);
      return res.status(200).json({ root, folders, photos: loose });
    }

    const photos = await listImages(drive, folder);
    return res.status(200).json({ root, folders: [], photos });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Drive request failed" });
  }
}
