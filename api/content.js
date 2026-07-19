/* GET /api/content  → the projects as they stand in Drive
   PUT /api/content  → save them back

   Saving is a whole-document write: the admin holds the entire content
   object in memory and sends it back. With a single editor that is the
   simplest correct thing — no partial-update merge logic to get wrong. */

import { requireAuth } from "./_lib/auth.js";
import { driveClient, readContent, writeContent } from "./_lib/drive.js";

/* Keep only the fields the site actually renders, and coerce types, so
   a malformed request can never write junk into Drive. */
const str = (v, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const arr = (v) => (Array.isArray(v) ? v : []);

const cleanPhotoProject = (p) => ({
  slug: str(p.slug, 80),
  t: str(p.t, 120),
  kind: str(p.kind, 60),
  loc: str(p.loc, 120),
  year: str(p.year, 20),
  exif: str(p.exif, 120),
  role: str(p.role, 120),
  note: str(p.note, 1200),
  intro: str(p.intro, 400),
  hidden: Boolean(p.hidden),
  photos: arr(p.photos).map((x) => str(x, 100)).filter(Boolean),
});

const cleanWebProject = (w) => ({
  slug: str(w.slug, 80),
  t: str(w.t, 120),
  tag: str(w.tag, 60),
  year: str(w.year, 20),
  role: str(w.role, 120),
  note: str(w.note, 1200),
  intro: str(w.intro, 400),
  tool: str(w.tool, 40),
  href: str(w.href, 500),
  live: str(w.live, 500),
  hidden: Boolean(w.hidden),
  stack: arr(w.stack).map((x) => str(x, 40)).filter(Boolean),
  specs: arr(w.specs).map((s) => ({ k: str(s.k, 60), v: str(s.v, 300) }))
    .filter((s) => s.k || s.v),
  cover: str(w.cover, 100),
  shots: arr(w.shots).map((x) => str(x, 100)).filter(Boolean),
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
    const next = {
      photoProjects: arr(body.photoProjects).map(cleanPhotoProject).filter((p) => p.slug && p.t),
      webProjects: arr(body.webProjects).map(cleanWebProject).filter((w) => w.slug && w.t),
    };
    // slugs are URLs — duplicates would make one project unreachable
    for (const key of ["photoProjects", "webProjects"]) {
      const slugs = next[key].map((p) => p.slug);
      const dupe = slugs.find((s, i) => slugs.indexOf(s) !== i);
      if (dupe) return res.status(400).json({ error: `Two projects share the address "${dupe}"` });
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
