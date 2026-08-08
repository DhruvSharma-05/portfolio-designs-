/* ==================================================================
   sync-contentful.mjs — build-time Contentful → portfolio photo sync.

   Pulls "Photo" entries from Contentful (fields: title, collection,
   order, category, image), buckets them by their `collection` field, and
   resizes to optimized WebP under public/photos/. Three roles are special
   — work / gallery / portrait — and drive those manifest sections. Any
   OTHER collection value (e.g. "wildlife", "traditional", "modern") is
   treated as a photo-project collection: its photos go to
   public/photos/projects/<slug>/, are listed in `projectPhotos`, and are
   grouped into `photoProjects` (one project per collection). The
   `webProjects` section is read-merged and left untouched.

   Runs automatically via the "prebuild" npm script, or manually with
   `npm run sync`. If credentials are missing it warns and exits 0 so
   the build still succeeds on placeholder images.

   `--cached` (what "predev" passes) returns immediately when a manifest
   with photos in it is already on disk, so starting the dev server does
   not wait on Contentful. The per-image cache below still saves the
   re-encoding, but it cannot save the round trip: every start was
   fetching the whole entry list and stat-ing every asset before it could
   decide there was nothing to do. `npm run sync` and `npm run build`
   never pass the flag, so a real pull is always one command away and a
   deploy is always fresh.
   ================================================================== */

import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

/* sharp and exifr are loaded on first use, not at the top of the file.
   sharp is a native addon and the pair of them cost the best part of two
   seconds to pull in — which the --cached path above pays on every `npm
   run dev` for two modules it then never calls. A real sync loads them
   once, on the first image, and never notices. */
let _sharp, _exifr;
const sharp = async (...a) => ((_sharp ??= (await import("sharp")).default))(...a);
const exifr = async () => (_exifr ??= (await import("exifr")).default);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_PHOTOS = path.join(ROOT, "public", "photos");
const MANIFEST = path.join(ROOT, "src", "photos.manifest.json");
const CACHE = path.join(ROOT, ".contentful-cache.json");

/* Output widths, ascending. Files are named by width, and every step is
   published in the manifest's `srcset` so the browser picks the one that
   actually matches the slot it is filling.

   The top step exists for the full-bleed frames — the photography hero
   and the frames carousel both render near 100vw, and on a HiDPI window
   that is a physical pixel count roughly double the CSS width (a 1920px
   window at 2x wants ~3840). A single 2000-wide file was being stretched
   to fill those, which is what read as "low resolution". The middle
   steps keep a 33vw card from having to download the hero-sized file. */
const SIZES = [640, 1600, 2600, 4200];

const ROLES = ["work", "gallery", "portrait"];

const log = (...a) => console.log("[sync-contentful]", ...a);
const warn = (...a) => console.warn("[sync-contentful]", ...a);

const EMPTY_MANIFEST = {
  generatedAt: null,
  work: [], gallery: [], portrait: null,
  projectPhotos: [], photoProjects: [], webProjects: [],
};

/* Has a previous run actually put photos on disk? `webProjects` is not
   counted: it is read-merged from whatever is already in the manifest
   and is present even when no photo has ever been synced. */
const manifestHasPhotos = (m) =>
  Boolean(m?.work?.length || m?.gallery?.length || m?.portrait
    || m?.projectPhotos?.length);

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
    x = await (await exifr()).parse(buffer, {
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

/* Downloads one source image. The originals are full-resolution camera
   files (15-20MB each), and a single dropped connection partway through
   the set used to abandon the whole sync — so each one gets a few
   attempts with a widening pause before it gives up. */
async function downloadAsset(url, attempts = 4) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`asset download failed: ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (i >= attempts) throw e;
      warn(`retry ${i}/${attempts - 1} after ${e?.message || e}`);
      await new Promise((r) => setTimeout(r, i * 1500));
    }
  }
}

/* -------------------------------------------------------------- images */

/* Resize a source buffer into every SIZES step. Returns each step's URL,
   a ready-built `srcset` carrying each file's TRUE width, `sm`/`lg`
   pointers at the smallest and largest renders, and the largest render's
   natural dimensions. */
async function renderVariants(buffer, role, seed) {
  const outDir = path.join(PUBLIC_PHOTOS, role);
  await mkdir(outDir, { recursive: true });
  const out = {};
  const steps = [];
  /* withoutEnlargement caps a step at the source's own width, so once a
     step comes back narrower than it asked for, every larger step would
     be the same pixels under a new name — and a srcset entry promising
     detail the file doesn't hold. Stop there instead. */
  let atNative = false;
  for (const width of SIZES) {
    if (atNative) break;
    const file = `${seed}-${width}.webp`;
    const info = await (await sharp(buffer))
      .rotate() // honor EXIF orientation
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(outDir, file));
    out[`w${width}`] = `/photos/${role}/${file}`;
    steps.push({ url: `/photos/${role}/${file}`, w: info.width, h: info.height });
    if (info.width < width) atNative = true;
  }
  const largest = steps[steps.length - 1];
  return {
    ...out,
    sm: steps[0].url,
    lg: largest.url,
    srcset: steps.map((s) => `${s.url} ${s.w}w`).join(", "),
    w: largest.w,
    h: largest.h,
  };
}

/* -------------------------------------------------------------- main */

async function main() {
  const existing = existsSync(MANIFEST)
    ? JSON.parse(await readFile(MANIFEST, "utf8"))
    : EMPTY_MANIFEST;

  /* --cached: the dev server's start-up path. Anything in the manifest
     means the photos have been pulled at least once and are already
     optimized under public/photos, so there is nothing to wait for.
     An empty manifest still syncs — a first checkout has to fetch once
     or the site comes up with no pictures at all. */
  if (process.argv.includes("--cached") && manifestHasPhotos(existing)) {
    log(`using the cached manifest from ${existing.generatedAt || "an earlier run"} — \`npm run sync\` to pull again`);
    return;
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  if (!spaceId || !token) {
    warn("Skipping Contentful sync: missing CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN.");
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
      .filter((it) => slug((it.fields.collection || "").trim()) === role)
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
        const buffer = await downloadAsset(assetUrl);
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
          srcset: variants.srcset,
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
          sm: variants.sm, lg: variants.lg, srcset: variants.srcset,
          w: variants.w, h: variants.h,
        });
      }
    }
  }

  /* ---- project collections -------------------------------------------
     Any `collection` value that isn't a known role (work/gallery/portrait)
     is treated as a photo-project collection — e.g. "wildlife",
     "traditional", "modern". Grouped by the *slugified* value, not the raw
     text: two entries whose `collection` field differs only in casing or
     stray whitespace (e.g. "Modern" vs "modern") used to become two
     separate projects that both resolved to the same /photography/modern
     URL — now they land in one. */
  const collLabel = new Map(); // collSlug -> first-seen display label
  for (const it of items) {
    const raw = (it.fields.collection || "").trim();
    const key = slug(raw);
    if (!raw || ROLES.includes(key)) continue;
    if (!collLabel.has(key)) collLabel.set(key, raw);
  }
  const projectColls = [...collLabel.keys()].sort((a, b) => {
    // order collections by the smallest `order` among their photos
    const min = (key) =>
      Math.min(
        ...items
          .filter((it) => slug((it.fields.collection || "").trim()) === key)
          .map((it) => it.fields.order ?? 9999),
        9999,
      );
    return min(a) - min(b) || a.localeCompare(b);
  });

  const projectPhotos = [];
  const photoProjects = [];

  for (const collSlug of projectColls) {
    const coll = collLabel.get(collSlug);
    const roleDir = `projects/${collSlug}`;
    const entries = items
      .filter((it) => slug((it.fields.collection || "").trim()) === collSlug)
      .sort((a, b) => {
        const oa = a.fields.order ?? 9999;
        const ob = b.fields.order ?? 9999;
        return oa - ob || (a.fields.title || "").localeCompare(b.fields.title || "");
      });

    const photos = [];
    let firstExif = "";
    for (const entry of entries) {
      const assetId = entry.fields.image?.sys?.id;
      const asset = assetId && assets.get(assetId);
      const fileUrl = asset?.fields?.file?.url;
      if (!fileUrl) {
        warn(`entry ${entry.sys.id} (${entry.fields.title || "untitled"}) has no image, skipping`);
        continue;
      }

      let seed = `${collSlug}-${slug(entry.fields.title || entry.sys.id)}`;
      while (usedSeeds.has(`${roleDir}/${seed}`)) seed += "-x";
      usedSeeds.add(`${roleDir}/${seed}`);

      const cacheKey = `${roleDir}/${entry.sys.id}`;
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
        log(`skip (cached) ${roleDir}/${entry.fields.title}`);
      } else {
        log(`fetch ${roleDir}/${entry.fields.title}`);
        const assetUrl = fileUrl.startsWith("//") ? `https:${fileUrl}` : fileUrl;
        const buffer = await downloadAsset(assetUrl);
        exif = await formatExif(buffer);
        variants = await renderVariants(buffer, roleDir, seed);
      }

      nextCache[cacheKey] = { seed, stamp, variants, exif };
      projectPhotos.push({
        seed, sm: variants.sm, lg: variants.lg, srcset: variants.srcset,
        w: variants.w, h: variants.h,
      });
      photos.push(seed);
      if (!firstExif && exif) firstExif = exif;
    }

    if (!photos.length) continue;
    const title = coll.replace(/\b\w/g, (m) => m.toUpperCase());
    /* No `kind` and no `role`: both used to be invented here — `kind` was a
       copy of the title and `role` was the literal "Photography" — so every
       card and detail page printed the collection name twice and tagged it
       with a word that told the visitor nothing. */
    photoProjects.push({
      slug: collSlug,
      t: title,
      loc: "",
      year: "",
      exif: firstExif,
      intro: `Selected ${title.toLowerCase()} photography. The full set, shot and graded as one.`,
      note: "",
      photos,
    });
  }

  // Prune output files whose source entry is gone.
  await pruneOrphans(usedSeeds);

  const manifest = {
    ...existing,
    generatedAt: new Date().toISOString(),
    work: buckets.work,
    gallery: buckets.gallery,
    portrait: buckets.portrait[0] || null,
    projectPhotos,
    photoProjects,
  };

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  await writeFile(CACHE, JSON.stringify(nextCache, null, 2) + "\n");
  log(
    `done: work:${manifest.work.length} gallery:${manifest.gallery.length}` +
      ` portrait:${manifest.portrait ? 1 : 0}` +
      ` projects:${photoProjects.length} (${projectPhotos.length} photos)`,
  );
}

/* Remove WebP outputs under public/photos/{work,gallery,portrait} and every
   public/photos/projects/<slug> dir that no longer correspond to a synced
   seed (entry deleted/retitled/re-collectioned in Contentful). */
async function pruneOrphans(usedSeeds) {
  const roleDirs = [...ROLES];
  const projectsRoot = path.join(PUBLIC_PHOTOS, "projects");
  if (existsSync(projectsRoot)) {
    const subs = await readdir(projectsRoot, { withFileTypes: true }).catch(() => []);
    for (const d of subs) if (d.isDirectory()) roleDirs.push(`projects/${d.name}`);
  }
  for (const role of roleDirs) {
    const dir = path.join(PUBLIC_PHOTOS, role);
    if (!existsSync(dir)) continue;
    let names;
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    for (const file of names) {
      /* Width-suffixed only: files from the old -sm/-lg naming don't
         resolve to a live seed here, so they get pruned as the leftovers
         they are. */
      const seed = file.replace(/-(\d+)\.webp$/, "");
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
