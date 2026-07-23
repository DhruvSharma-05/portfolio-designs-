/* ==================================================================
   sync-drive.mjs — build-time sync of /admin-authored project content.

   Viraj manages photoProjects/webProjects in /admin, which stores them
   as one content.json file in his own Drive (see api/_lib/drive.js) —
   no database, Drive is the whole admin backend. This script resolves
   the Drive file IDs those projects point at into optimized local WebP
   under public/photos/projects/, and writes the projectPhotos /
   photoProjects / webProjects sections of src/photos.manifest.json.

   The public Work/Gallery/Portrait photos come from Contentful instead
   — see scripts/sync-contentful.mjs, which owns the work/gallery/
   portrait sections of the same manifest file. Both scripts
   read-merge-write so neither clobbers the other's sections.

   Runs automatically via the "prebuild" npm script, or manually with
   `npm run sync`. If credentials are missing it warns and exits 0 so
   the build still succeeds on the existing manifest.
   ================================================================== */

import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";
import sharp from "sharp";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_PHOTOS = path.join(ROOT, "public", "photos");
const MANIFEST = path.join(ROOT, "src", "photos.manifest.json");
const CACHE = path.join(ROOT, ".drive-cache.json");

/* Output widths. -sm serves thumbnails (contact strip); -lg serves
   cards, gallery and detail heroes. object-fit: cover handles crop. */
const SIZES = { sm: 640, lg: 2000 };

const log = (...a) => console.log("[sync-drive]", ...a);
const warn = (...a) => console.warn("[sync-drive]", ...a);

const EMPTY_MANIFEST = {
  generatedAt: null,
  work: [], gallery: [], portrait: null,
  projectPhotos: [], photoProjects: [], webProjects: [],
};

/* -------------------------------------------------------------- drive */

/* The admin's content.json is a private file shared only with the
   service account as Editor, so (unlike the old public photo sync) a
   plain API key can't read it — this always needs the service account. */
function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  let json;
  try {
    // Accept either raw JSON or base64-encoded JSON.
    const text = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    json = JSON.parse(text);
  } catch (e) {
    warn("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON/base64:", e.message);
    return null;
  }
  return new google.auth.JWT({
    email: json.client_email,
    key: json.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

async function downloadBytes(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );
  return Buffer.from(res.data);
}

/* -------------------------------------------------------------- images */

/* Resize a source buffer into every SIZES variant. Returns the public
   URL paths plus the natural dimensions of the largest render. */
async function renderVariants(buffer, role, seed) {
  const outDir = path.join(PUBLIC_PHOTOS, role);
  await mkdir(outDir, { recursive: true });
  const out = {};
  let w = 0;
  let h = 0;
  for (const [label, width] of Object.entries(SIZES)) {
    const file = `${seed}-${label}.webp`;
    const info = await sharp(buffer)
      .rotate() // honor EXIF orientation
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(outDir, file));
    out[label] = `/photos/${role}/${file}`;
    if (label === "lg") {
      w = info.width;
      h = info.height;
    }
  }
  return { ...out, w, h };
}

/* -------------------------------------------------------------- main */

async function main() {
  const existing = existsSync(MANIFEST)
    ? JSON.parse(await readFile(MANIFEST, "utf8"))
    : EMPTY_MANIFEST;

  const auth = getAuth();
  if (!auth || !process.env.DRIVE_CONTENT_FILE_ID) {
    warn(
      "Skipping admin project sync — missing",
      [!auth && "GOOGLE_SERVICE_ACCOUNT_JSON", !process.env.DRIVE_CONTENT_FILE_ID && "DRIVE_CONTENT_FILE_ID"]
        .filter(Boolean)
        .join(", "),
    );
    warn("Build will use the existing manifest for projects.");
    return;
  }

  const drive = google.drive({ version: "v3", auth });
  const cache = existsSync(CACHE)
    ? JSON.parse(await readFile(CACHE, "utf8"))
    : {};
  const nextCache = {};
  const usedSeeds = new Set();
  const manifest = { ...existing };

  await syncProjects(drive, cache, nextCache, usedSeeds, manifest);

  // Prune output files whose source is gone.
  await pruneOrphans(usedSeeds);

  manifest.generatedAt = new Date().toISOString();
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  await writeFile(CACHE, JSON.stringify(nextCache, null, 2) + "\n");
  log(
    `done — photoProjects:${manifest.photoProjects.length} webProjects:${manifest.webProjects.length}`,
  );
}

/* ==================================================================
   ADMIN PROJECTS

   /admin writes content.json into Drive: the projects, their words, and
   the Drive file IDs of the photos in each. Here we resolve those IDs
   into optimised local WebP, so the published site never touches Drive
   at runtime.

   Photos are keyed by Drive file ID (`p-<id>`), which is stable across
   renames — so re-titling a file in Drive doesn't re-download it or
   break a project that points at it.
   ================================================================== */
async function syncProjects(drive, cache, nextCache, usedSeeds, manifest) {
  const fileId = process.env.DRIVE_CONTENT_FILE_ID;
  if (!fileId) {
    log("no DRIVE_CONTENT_FILE_ID — skipping admin projects");
    return;
  }

  let content;
  try {
    const text = (await downloadBytes(drive, fileId)).toString("utf8").trim();
    content = text ? JSON.parse(text) : null;
  } catch (e) {
    warn("Could not read content.json, keeping existing projects:", e.message);
    return;
  }
  if (!content) return;

  const photoProjects = (content.photoProjects || []).filter((p) => !p.hidden);
  const webProjects = (content.webProjects || []).filter((w) => !w.hidden);

  // every Drive photo any project points at, de-duplicated
  const ids = new Set();
  for (const p of photoProjects) for (const id of p.photos || []) ids.add(id);
  for (const w of webProjects) {
    if (w.cover) ids.add(w.cover);
    for (const id of w.shots || []) ids.add(id);
  }

  const resolved = new Map();   // drive id → { seed, sm, lg, w, h }
  for (const id of ids) {
    const seed = `p-${id}`;
    usedSeeds.add(`projects/${seed}`);

    let meta;
    try {
      meta = await drive.files.get({ fileId: id, fields: "id, name, md5Checksum" });
    } catch (e) {
      warn(`project photo ${id} is unreadable, skipping:`, e.message);
      continue;
    }

    const cacheKey = `projects/${id}`;
    const stamp = meta.data.md5Checksum || meta.data.name;
    const prev = cache[cacheKey];
    const outputsExist =
      prev?.variants &&
      Object.values(prev.variants)
        .filter((v) => typeof v === "string")
        .every((rel) => existsSync(path.join(ROOT, "public", rel.replace(/^\//, ""))));

    let variants;
    if (prev && prev.stamp === stamp && outputsExist) {
      variants = prev.variants;
      log(`skip (cached) projects/${meta.data.name}`);
    } else {
      log(`fetch projects/${meta.data.name}`);
      try {
        variants = await renderVariants(await downloadBytes(drive, id), "projects", seed);
      } catch (e) {
        warn(`could not process ${meta.data.name}:`, e.message);
        continue;
      }
    }

    nextCache[cacheKey] = { seed, stamp, variants };
    resolved.set(id, { seed, ...variants });
  }

  const keep = (arr) => (arr || []).filter((id) => resolved.has(id)).map((id) => `p-${id}`);

  manifest.projectPhotos = [...resolved.values()].map((v) => ({
    seed: v.seed, sm: v.sm, lg: v.lg, w: v.w, h: v.h,
  }));

  // A project with no usable photos would render as an empty page, so
  // it is dropped rather than published broken.
  manifest.photoProjects = photoProjects
    .map((p) => ({ ...p, photos: keep(p.photos) }))
    .filter((p) => p.slug && p.t && p.photos.length);

  manifest.webProjects = webProjects
    .map((w) => ({
      ...w,
      cover: resolved.has(w.cover) ? `p-${w.cover}` : keep(w.shots)[0] || "",
      shots: keep(w.shots),
    }))
    .filter((w) => w.slug && w.t && w.cover);
}

/* Remove WebP outputs under public/photos/projects that no longer
   correspond to a synced seed (photos deleted/renamed in Drive). */
async function pruneOrphans(usedSeeds) {
  const dir = path.join(PUBLIC_PHOTOS, "projects");
  if (!existsSync(dir)) return;
  let names;
  try {
    names = await readdir(dir);
  } catch {
    return;
  }
  for (const file of names) {
    const seed = file.replace(/-(sm|lg)\.webp$/, "");
    if (!usedSeeds.has(`projects/${seed}`)) {
      await rm(path.join(dir, file), { force: true });
      log(`prune projects/${file}`);
    }
  }
}

main().catch((e) => {
  // Never fail the build on a sync error — fall back to the existing manifest.
  warn("Sync failed, keeping existing manifest:", e?.message || e);
  process.exit(0);
});
