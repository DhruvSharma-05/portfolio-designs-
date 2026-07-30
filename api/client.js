/* GET /api/client?code=north-cafe-7Q4M2X

   The one PUBLIC endpoint in the system — it is what a paying client
   hits after Viraj sends them a code. It answers with the bare minimum
   needed to render their page and nothing else:

     · the client name and shoot title
     · Viraj's note
     · how many photos are in the folder, and whether they fit under the
       ZIP-download cap (api/download.js enforces the same numbers)
     · the Drive folder link

   It never returns the project list, other galleries, other codes, or
   anything about a code that does not match. A wrong code gets a flat
   404 with no hint about whether the gallery exists.
   ================================================================== */

import { driveClient, listImages, folderUrl } from "./_lib/drive.js";
import { resolveDelivery, MAX_FILES, MAX_BYTES } from "./_lib/delivery.js";
import { makeLimiter, clientIp } from "./_lib/ratelimit.js";

const limited = makeLimiter({ windowMs: 60_000, max: 10 });

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // never let a delivery page get cached or indexed
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  if (limited(clientIp(req))) {
    return res.status(429).json({ error: "Too many tries. Wait a minute and try again." });
  }

  try {
    const drive = driveClient();
    const found = await resolveDelivery(drive, req.query.code);
    if (!found.ok) return res.status(found.status).json({ error: found.error });

    const images = await listImages(drive, found.folderId).catch(() => null);
    const totalBytes = images ? images.reduce((n, f) => n + f.size, 0) : 0;
    // if we couldn't even list the folder, don't offer a zip we can't build
    const overCap = !images || images.length > MAX_FILES || totalBytes > MAX_BYTES;

    return res.status(200).json({
      client: found.project.client.name || "",
      title: found.project.t || "",
      note: found.project.client.note || "",
      count: images ? images.length : null,
      url: folderUrl(found.folderId),
      zip: {
        available: !overCap,
        count: images ? images.length : 0,
        sizeMB: Math.round(totalBytes / 1024 / 1024),
        maxFiles: MAX_FILES,
        maxMB: Math.round(MAX_BYTES / 1024 / 1024),
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Something went wrong" });
  }
}
