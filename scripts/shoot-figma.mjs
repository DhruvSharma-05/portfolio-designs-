/* ==================================================================
   shoot-figma.mjs — best-effort cover screenshots for the design cards.

   Loads each Figma prototype's embed in headless Chromium, waits for the
   canvas to paint, screenshots the starting frame, and writes optimized
   WebP variants under public/photos/web/. The list of covers is emitted to
   src/web-covers.json, which data.js reads and registers into the photo
   map — so the cards render a fast <img> instead of the live iframe, and
   this stays independent of the Contentful manifest (which is overwritten
   by `npm run sync`).

   Run on demand:  npm run shoot

   Caveat: Figma embeds render slowly and can leak player chrome into the
   shot; tune WAIT_MS / CROP_BOTTOM below, or just re-run. If a capture
   fails, that project keeps its live embed (its cover is simply omitted).

   Keep PROJECTS in sync with WEB_PROJECTS_FALLBACK in src/data.js.
   ================================================================== */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import puppeteer from "puppeteer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "photos", "web");
const COVERS_JSON = path.join(ROOT, "src", "web-covers.json");

const SIZES = { sm: 640, lg: 2000 };
const VIEW = { width: 1600, height: 1100, deviceScaleFactor: 2 }; // 16:11, matches .browser-view
const WAIT_MS = 11000;      // let the prototype's first frame paint
const CROP_BOTTOM = 0;      // device px to trim off the bottom (player bar) before resize

/* Same seeds as WEB_PROJECTS_FALLBACK[].cover so data.js resolves them. */
const PROJECTS = [
  { seed: "web-trackher", href: "https://www.figma.com/proto/8OtvqxlfWmw36HoDlRMTMa/Final-Presentation---Prototype?node-id=2-1928&page-id=0%3A1&starting-point-node-id=2%3A1917" },
  { seed: "web-wingwise", href: "https://www.figma.com/proto/5ucSXSWGvoeBuQraNImByn/Team-Yuva?node-id=3280-10661&page-id=1408%3A17032&starting-point-node-id=3280%3A10661" },
  { seed: "web-moments", href: "https://www.figma.com/proto/I4AYMtK2LPSuUrbMnd8vy9/MOMents-by-team-Spark?node-id=1909-5686&page-id=1902%3A3830&starting-point-node-id=1909%3A5686" },
  { seed: "web-artasta", href: "https://www.figma.com/proto/XDD143AWWhkegVelp4z8sC/Art-Asta-Design?node-id=10153-950&page-id=1%3A43&starting-point-node-id=10490%3A3702&scaling=scale-down&content-scaling=fixed" },
];

const embed = (url) =>
  `https://www.figma.com/embed?embed_host=lensofviraj&url=${encodeURIComponent(url)}&hide-ui=1`;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function renderVariants(buffer, seed) {
  const out = {};
  let w = 0, h = 0;
  for (const [label, width] of Object.entries(SIZES)) {
    const file = `${seed}-${label}.webp`;
    const info = await sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(OUT_DIR, file));
    out[label] = `/photos/web/${file}`;
    if (label === "lg") { w = info.width; h = info.height; }
  }
  return { seed, ...out, w, h };
}

/* Figma's embed page shows a OneTrust cookie bar along the bottom that
   otherwise photobombs the shot — click it away before capturing. */
async function dismissCookies(page) {
  await page.evaluate(() => {
    const els = [...document.querySelectorAll("button, a")];
    const hit = els.find((b) =>
      /allow all cookies|accept all cookies|do not allow cookies/i.test(b.textContent || ""));
    if (hit) hit.click();
  }).catch(() => {});
}

async function shoot(page, { seed, href }) {
  const url = embed(href);
  process.stdout.write(`  ${seed} … `);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector("canvas", { timeout: 30000 }).catch(() => {});
  await delay(3500);
  await dismissCookies(page);
  await delay(WAIT_MS);

  let png = await page.screenshot({ type: "png" });
  if (CROP_BOTTOM > 0) {
    const meta = await sharp(png).metadata();
    png = await sharp(png)
      .extract({ left: 0, top: 0, width: meta.width, height: meta.height - CROP_BOTTOM })
      .toBuffer();
  }
  const cover = await renderVariants(png, seed);
  console.log(`ok (${cover.w}×${cover.h})`);
  return cover;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("Shooting Figma prototypes → public/photos/web/");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars"],
  });
  const covers = [];
  try {
    const page = await browser.newPage();
    await page.setViewport(VIEW);
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    );
    for (const p of PROJECTS) {
      try {
        covers.push(await shoot(page, p));
      } catch (e) {
        console.log(`FAILED — ${e.message} (keeps live embed)`);
      }
    }
  } finally {
    await browser.close();
  }

  await writeFile(COVERS_JSON, JSON.stringify(covers, null, 2) + "\n");
  console.log(`\nWrote ${covers.length}/${PROJECTS.length} covers → src/web-covers.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
