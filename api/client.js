/* GET /api/client?code=north-cafe-7Q4M2X

   The one PUBLIC endpoint in the system — it is what a paying client
   hits after Viraj sends them a code. It answers with the bare minimum
   needed to render their page and nothing else:

     · the client name and shoot title
     · Viraj's note
     · how many photos are in the folder
     · the Drive folder link

   It never returns the project list, other galleries, other codes, or
   anything about a code that does not match. A wrong code gets a flat
   404 with no hint about whether the gallery exists.
   ================================================================== */

import {
  driveClient, readContent, countImages, folderUrl, shareState,
} from "./_lib/drive.js";

/* --- rate limit ---------------------------------------------------
   Codes are the only lock on the door, so guessing has to be
   expensive. This is per-instance memory: serverless spreads requests
   across instances and recycles them, so it is a speed bump rather
   than a guarantee. The real protection is code entropy — the
   generator uses a 6-char random suffix from a 32-char alphabet
   (~1e9 combinations) on top of the project name.                   */
const hits = new Map();
const WINDOW = 60_000;
const MAX_TRIES = 10;

function rateLimited(ip) {
  const now = Date.now();
  const seen = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  seen.push(now);
  hits.set(ip, seen);
  if (hits.size > 5000) hits.clear();     // crude ceiling on memory
  return seen.length > MAX_TRIES;
}

const clientIp = (req) =>
  (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
  req.socket?.remoteAddress || "unknown";

/* Every project — photo or web — can carry a delivery. */
const deliveries = (content) =>
  [...(content.photoProjects || []), ...(content.webProjects || [])]
    .filter((p) => p.client?.on && p.client?.code && p.client?.folderId);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // never let a delivery page get cached or indexed
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  const code = String(req.query.code || "").trim().toLowerCase();
  if (!code) return res.status(400).json({ error: "Enter your code" });

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Too many tries. Wait a minute and try again." });
  }

  try {
    const drive = driveClient();
    const found = deliveries(await readContent(drive))
      .find((p) => p.client.code.toLowerCase() === code);

    // Same answer for "no such code" and "code exists but is revoked",
    // so the response can't be used to probe which codes are real.
    if (!found || found.client.revoked) {
      return res.status(404).json({ error: "That code doesn't match a gallery. Check it with Viraj." });
    }

    const folderId = found.client.folderId;
    const [count, share] = await Promise.all([
      countImages(drive, folderId).catch(() => null),
      shareState(drive, folderId).catch(() => ({ shared: false })),
    ]);

    // If sharing was pulled from the Drive side, say so plainly rather
    // than handing over a link that will greet them with a 403.
    if (!share.shared) {
      return res.status(409).json({
        error: "This gallery isn't open yet. Ask Viraj to re-share it.",
      });
    }

    return res.status(200).json({
      client: found.client.name || "",
      title: found.t || "",
      note: found.client.note || "",
      count,
      url: folderUrl(folderId),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Something went wrong" });
  }
}
