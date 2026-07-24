/* GET /api/download?code=north-cafe-7Q4M2X

   PUBLIC — gated only by the code, via the exact same resolveDelivery()
   gate as api/client.js, so revoking a code kills this immediately too.
   Streams a zip of the delivery folder straight to the client; never
   buffers the whole archive in memory (Vercel's function memory/timeout
   can't take it for a shoot of any real size).

   /api/client already told the page whether this is even offered — the
   count/size cap here MUST agree with that check (both read from
   _lib/delivery.js), or a client could see "Download ZIP" and then hit
   a wall, or vice versa.                                                */

import archiver from "archiver";
import { driveClient, listImages, fileStream } from "./_lib/drive.js";
import { resolveDelivery, MAX_FILES, MAX_BYTES } from "./_lib/delivery.js";
import { makeLimiter, clientIp } from "./_lib/ratelimit.js";

const limited = makeLimiter({ windowMs: 60_000, max: 10 });

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  if (limited(clientIp(req))) {
    return res.status(429).json({ error: "Too many tries. Wait a minute and try again." });
  }

  let drive;
  try {
    drive = driveClient();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  const found = await resolveDelivery(drive, req.query.code);
  if (!found.ok) return res.status(found.status).json({ error: found.error });

  let images;
  try {
    images = await listImages(drive, found.folderId);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Could not read that folder" });
  }

  const totalBytes = images.reduce((n, f) => n + f.size, 0);
  if (images.length > MAX_FILES || totalBytes > MAX_BYTES) {
    return res.status(413).json({
      error: "This shoot is too large to zip here — use Open in Google Drive instead.",
    });
  }
  if (!images.length) {
    return res.status(404).json({ error: "No photos in this folder yet." });
  }

  const filename = `${found.project.slug || "photos"}.zip`;
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // photos are already JPEG-compressed — re-deflating them burns CPU
  // time for near-zero size benefit, and time is the scarce resource
  // inside one serverless function call.
  const archive = archiver("zip", { zlib: { level: 0 } });
  archive.on("error", () => res.destroy());
  archive.pipe(res);

  // Drive allows two files with the same name in one folder; a zip
  // can't, so collisions get a short disambiguating prefix.
  const used = new Set();
  for (const img of images) {
    let name = img.name;
    while (used.has(name)) name = `dup-${img.id.slice(0, 6)}-${name}`;
    used.add(name);
    const stream = await fileStream(drive, img.id);
    archive.append(stream, { name });
  }

  await archive.finalize();
  // Vercel's Node runtime can end the invocation as soon as the handler's
  // promise resolves — wait for the response stream to actually flush,
  // or large zips risk being truncated.
  await new Promise((resolve) => res.on("finish", resolve));
}
