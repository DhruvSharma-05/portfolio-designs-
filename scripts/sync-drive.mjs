/* ==================================================================
   sync-drive.mjs — build-time Google Drive → portfolio photo sync.

   Pulls photos from three shared Drive subfolders (Work / Gallery /
   Portrait), extracts EXIF, resizes to optimized WebP under
   public/photos/, and writes src/photos.manifest.json which data.js
   reads. The deployed site stays 100% static.

   Runs automatically via the "prebuild" npm script, or manually with
   `npm run sync`. If credentials are missing it warns and exits 0 so
   the build still succeeds on placeholder images.
   ================================================================== */

import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";
import sharp from "sharp";
import exifr from "exifr";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_PHOTOS = path.join(ROOT, "public", "photos");
const MANIFEST = path.join(ROOT, "src", "photos.manifest.json");
const CACHE = path.join(ROOT, ".drive-cache.json");

/* Output widths. -sm serves thumbnails (contact strip); -lg serves
   cards, gallery and detail heroes. object-fit: cover handles crop. */
const SIZES = { sm: 640, lg: 2000 };

const ROLES = [
  { key: "work", env: "DRIVE_WORK_FOLDER_ID" },
  { key: "gallery", env: "DRIVE_GALLERY_FOLDER_ID" },
  { key: "portrait", env: "DRIVE_PORTRAIT_FOLDER_ID" },
];

const log = (...a) => console.log("[sync-drive]", ...a);
const warn = (...a) => console.warn("[sync-drive]", ...a);

/* -------------------------------------------------------------- utils */

const slug = (s) =>
  s
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "photo";

/* Work convention: NN__Title__Location__Year__Role.ext
   Fields after NN are optional; "__" separates; spaces allowed. */
function parseWorkName(name) {
  const base = name.replace(/\.[^.]+$/, "");
  const parts = base.split("__").map((p) => p.trim());
  const order = parseInt(parts[0], 10);
  const [, t, loc, year, role] = parts;
  return {
    order: Number.isFinite(order) ? order : 9999,
    t: t || "Untitled",
    loc: loc || "",
    year: year || "",
    role: role || "",
  };
}

/* Leading NN for ordering non-work folders (Gallery). */
function leadingOrder(name) {
  const m = name.match(/^\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 9999;
}

/* EXIF → "35mm · f/8 · 1/500". Any missing piece is simply dropped. */
async function formatExif(buffer) {
  let x;
  try {
    x = await exifr.parse(buffer, {
      pick: ["FocalLength", "FNumber", "ExposureTime", "ISO"],
    });
  } catch {
    return "";
  }
  if (!x) return "";
  const bits = [];
  if (x.FocalLength) bits.push(`${Math.round(x.FocalLength)}mm`);
  if (x.FNumber) bits.push(`f/${+x.FNumber.toFixed(1)}`);
  if (x.ExposureTime) {
    bits.push(
      x.ExposureTime < 1
        ? `1/${Math.round(1 / x.ExposureTime)}`
        : `${x.ExposureTime}s`,
    );
  }
  if (x.ISO) bits.push(`ISO ${x.ISO}`);
  return bits.join(" · ");
}

/* -------------------------------------------------------------- drive */

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

async function listImages(drive, folderId) {
  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "nextPageToken, files(id, name, md5Checksum, mimeType)",
      pageSize: 200,
      pageToken,
    });
    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files;
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
  const auth = getAuth();
  const missing = ROLES.filter((r) => !process.env[r.env]).map((r) => r.env);
  if (!auth || missing.length) {
    warn(
      "Skipping Drive sync — missing",
      [!auth && "GOOGLE_SERVICE_ACCOUNT_JSON", ...missing]
        .filter(Boolean)
        .join(", "),
    );
    warn("Build will use the existing manifest (placeholder images).");
    return;
  }

  const drive = google.drive({ version: "v3", auth });
  const cache = existsSync(CACHE)
    ? JSON.parse(await readFile(CACHE, "utf8"))
    : {};
  const nextCache = {};
  const usedSeeds = new Set();
  const manifest = {
    generatedAt: new Date().toISOString(),
    work: [], gallery: [], portrait: null,
    projectPhotos: [], photoProjects: [], webProjects: [],
  };

  for (const { key, env } of ROLES) {
    const folderId = process.env[env];
    let files;
    try {
      files = await listImages(drive, folderId);
    } catch (e) {
      warn(`Could not list ${key} folder (${folderId}):`, e.message);
      continue;
    }

    // Sort: Work by parsed NN, others by leading NN, then name.
    files.sort((a, b) => {
      const oa = key === "work" ? parseWorkName(a.name).order : leadingOrder(a.name);
      const ob = key === "work" ? parseWorkName(b.name).order : leadingOrder(b.name);
      return oa - ob || a.name.localeCompare(b.name);
    });

    const entries = [];
    for (const f of files) {
      // Stable, unique seed per role.
      let seed =
        key === "work"
          ? `${String(parseWorkName(f.name).order).padStart(2, "0")}-${slug(parseWorkName(f.name).t)}`
          : slug(f.name.replace(/\.[^.]+$/, ""));
      while (usedSeeds.has(`${key}/${seed}`)) seed += "-x";
      usedSeeds.add(`${key}/${seed}`);

      const cacheKey = `${key}/${f.id}`;
      const stamp = f.md5Checksum || createHash("sha1").update(f.name).digest("hex");
      const prev = cache[cacheKey];

      let variants;
      let exif;
      const outputsExist =
        prev &&
        prev.seed === seed &&
        prev.variants &&
        Object.values(prev.variants)
          .filter((v) => typeof v === "string")
          .every((rel) => existsSync(path.join(ROOT, "public", rel.replace(/^\//, ""))));

      if (prev && prev.stamp === stamp && outputsExist) {
        variants = prev.variants;
        exif = prev.exif ?? "";
        log(`skip (cached) ${key}/${f.name}`);
      } else {
        log(`fetch ${key}/${f.name}`);
        const buffer = await downloadBytes(drive, f.id);
        exif = key === "work" ? await formatExif(buffer) : "";
        variants = await renderVariants(buffer, key, seed);
      }

      nextCache[cacheKey] = { seed, stamp, variants, exif };

      if (key === "work") {
        const meta = parseWorkName(f.name);
        entries.push({
          seed,
          t: meta.t,
          loc: meta.loc,
          exif,
          kind: "Photography",
          note: "",
          year: meta.year,
          role: meta.role,
          sm: variants.sm,
          lg: variants.lg,
          w: variants.w,
          h: variants.h,
        });
      } else {
        entries.push({ seed, sm: variants.sm, lg: variants.lg, w: variants.w, h: variants.h });
      }
    }

    if (key === "portrait") manifest.portrait = entries[0] || null;
    else manifest[key] = entries;
  }

  // Projects authored in /admin, stored as content.json in the same Drive.
  await syncProjects(drive, cache, nextCache, usedSeeds, manifest);

  // Prune output files whose source is gone.
  await pruneOrphans(usedSeeds);

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  await writeFile(CACHE, JSON.stringify(nextCache, null, 2) + "\n");
  log(
    `done — work:${manifest.work.length} gallery:${manifest.gallery.length}` +
      ` portrait:${manifest.portrait ? 1 : 0}` +
      ` photoProjects:${manifest.photoProjects.length} webProjects:${manifest.webProjects.length}`,
  );
}

/* ==================================================================
   ADMIN PROJECTS

   /admin writes content.json into Drive: the projects, their words, and
   the Drive file IDs of the photos in each. Here we resolve those IDs
   into optimised local WebP exactly like the folder roles above, so the
   published site never touches Drive at runtime.

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

/* Remove WebP outputs under public/photos that no longer correspond to
   a synced seed (photos deleted/renamed in Drive). */
async function pruneOrphans(usedSeeds) {
  for (const { key } of [...ROLES, { key: "projects" }]) {
    const dir = path.join(PUBLIC_PHOTOS, key);
    if (!existsSync(dir)) continue;
    let names;
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    for (const file of names) {
      const seed = file.replace(/-(sm|lg)\.webp$/, "");
      if (!usedSeeds.has(`${key}/${seed}`)) {
        await rm(path.join(dir, file), { force: true });
        log(`prune ${key}/${file}`);
      }
    }
  }
}

main().catch((e) => {
  // Never fail the build on a sync error — fall back to the existing manifest.
  warn("Sync failed, keeping existing manifest:", e?.message || e);
  process.exit(0);
});
