/* ==================================================================
   sync-contentful.mjs — build-time Contentful → portfolio photo sync.

   Pulls "Photo" entries from Contentful (fields: title, collection,
   order, location, year, role, image), buckets them into work / gallery
   / portrait by their `collection` field, resizes to optimized WebP
   under public/photos/, and writes the work/gallery/portrait sections
   of src/photos.manifest.json. The admin-authored project sections
   (projectPhotos/photoProjects/webProjects) are left untouched here —
   scripts/sync-drive.mjs owns those, and both scripts read-merge-write
   the manifest so neither clobbers the other's sections.

   Runs automatically via the "prebuild" npm script, or manually with
   `npm run sync`. If credentials are missing it warns and exits 0 so
   the build still succeeds on placeholder images.
   ================================================================== */

import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import exifr from "exifr";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_PHOTOS = path.join(ROOT, "public", "photos");
const MANIFEST = path.join(ROOT, "src", "photos.manifest.json");
const CACHE = path.join(ROOT, ".contentful-cache.json");

/* Output widths. -sm serves thumbnails (contact strip); -lg serves
   cards, gallery and detail heroes. object-fit: cover handles crop. */
const SIZES = { sm: 640, lg: 2000 };

const ROLES = ["work", "gallery", "portrait"];

const log = (...a) => console.log("[sync-contentful]", ...a);
const warn = (...a) => console.warn("[sync-contentful]", ...a);

const EMPTY_MANIFEST = {
  generatedAt: null,
  work: [], gallery: [], portrait: null,
  projectPhotos: [], photoProjects: [], webProjects: [],
};

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

/* -------------------------------------------------------------- contentful */

/* Fetches every entry of content type "photo", paginating past the CDA's
   100-item page limit, plus the linked image assets (`include=1`). */
async function fetchEntries(spaceId, environment, token) {
  const items = [];
  const assets = new Map();
  let skip = 0;
  for (;;) {
    const url =
      `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}` +
      `/entries?content_type=photo&include=1&limit=100&skip=${skip}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      throw new Error(`Contentful entries request failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    items.push(...data.items);
    for (const a of data.includes?.Asset || []) assets.set(a.sys.id, a);
    skip += data.items.length;
    if (data.items.length === 0 || skip >= data.total) break;
  }
  return { items, assets };
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

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  if (!spaceId || !token) {
    warn("Skipping Contentful sync — missing CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN.");
    warn("Build will use the existing manifest (placeholder images).");
    return;
  }

  const { items, assets } = await fetchEntries(spaceId, environment, token);

  const cache = existsSync(CACHE)
    ? JSON.parse(await readFile(CACHE, "utf8"))
    : {};
  const nextCache = {};
  const usedSeeds = new Set();
  const buckets = { work: [], gallery: [], portrait: [] };

  for (const role of ROLES) {
    const entries = items
      .filter((it) => it.fields.collection === role)
      .sort((a, b) => {
        const oa = a.fields.order ?? 9999;
        const ob = b.fields.order ?? 9999;
        return oa - ob || (a.fields.title || "").localeCompare(b.fields.title || "");
      });

    for (const entry of entries) {
      const assetId = entry.fields.image?.sys?.id;
      const asset = assetId && assets.get(assetId);
      const fileUrl = asset?.fields?.file?.url;
      if (!fileUrl) {
        warn(`entry ${entry.sys.id} (${entry.fields.title || "untitled"}) has no image, skipping`);
        continue;
      }

      let seed = slug(entry.fields.title || entry.sys.id);
      while (usedSeeds.has(`${role}/${seed}`)) seed += "-x";
      usedSeeds.add(`${role}/${seed}`);

      const cacheKey = `${role}/${entry.sys.id}`;
      const stamp = `${asset.sys.id}:${asset.sys.updatedAt}`;
      const prev = cache[cacheKey];
      const outputsExist =
        prev &&
        prev.seed === seed &&
        prev.variants &&
        Object.values(prev.variants)
          .filter((v) => typeof v === "string")
          .every((rel) => existsSync(path.join(ROOT, "public", rel.replace(/^\//, ""))));

      let variants;
      let exif;
      if (prev && prev.stamp === stamp && outputsExist) {
        variants = prev.variants;
        exif = prev.exif ?? "";
        log(`skip (cached) ${role}/${entry.fields.title}`);
      } else {
        log(`fetch ${role}/${entry.fields.title}`);
        const assetUrl = fileUrl.startsWith("//") ? `https:${fileUrl}` : fileUrl;
        const res = await fetch(assetUrl);
        if (!res.ok) throw new Error(`asset download failed: ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        exif = role === "work" ? await formatExif(buffer) : "";
        variants = await renderVariants(buffer, role, seed);
      }

      nextCache[cacheKey] = { seed, stamp, variants, exif };

      if (role === "work") {
        buckets.work.push({
          seed,
          t: entry.fields.title || "Untitled",
          loc: entry.fields.location || "",
          exif,
          kind: "Photography",
          note: "",
          year: entry.fields.year || "",
          role: entry.fields.role || "",
          sm: variants.sm,
          lg: variants.lg,
          w: variants.w,
          h: variants.h,
        });
      } else {
        buckets[role].push({
          seed,
          // Gallery only: optional "category" text field on the Photo
          // entry ("Professional Photoshoot" | "Open"). Missing/unknown
          // values land in "Open" on the site — see normCat() in src/data.js.
          ...(role === "gallery" && entry.fields.category ? { cat: entry.fields.category } : {}),
          sm: variants.sm, lg: variants.lg, w: variants.w, h: variants.h,
        });
      }
    }
  }

  // Prune output files whose source entry is gone.
  await pruneOrphans(usedSeeds);

  const manifest = {
    ...existing,
    generatedAt: new Date().toISOString(),
    work: buckets.work,
    gallery: buckets.gallery,
    portrait: buckets.portrait[0] || null,
  };

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  await writeFile(CACHE, JSON.stringify(nextCache, null, 2) + "\n");
  log(
    `done — work:${manifest.work.length} gallery:${manifest.gallery.length}` +
      ` portrait:${manifest.portrait ? 1 : 0}`,
  );
}

/* Remove WebP outputs under public/photos/{work,gallery,portrait} that no
   longer correspond to a synced seed (entry deleted/retitled in Contentful). */
async function pruneOrphans(usedSeeds) {
  for (const role of ROLES) {
    const dir = path.join(PUBLIC_PHOTOS, role);
    if (!existsSync(dir)) continue;
    let names;
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    for (const file of names) {
      const seed = file.replace(/-(sm|lg)\.webp$/, "");
      if (!usedSeeds.has(`${role}/${seed}`)) {
        await rm(path.join(dir, file), { force: true });
        log(`prune ${role}/${file}`);
      }
    }
  }
}

main().catch((e) => {
  // Never fail the build on a sync error — fall back to the existing manifest.
  warn("Sync failed, keeping existing manifest:", e?.message || e);
  process.exit(0);
});
