/* ==================================================================
   install-delivery-key.mjs — put the service-account key into .env.

     npm run key -- "C:/Users/You/Downloads/cc-delivery-abc123.json"

   The key file is pretty-printed JSON whose private_key contains
   newlines. Pasting that into .env by hand silently breaks the file —
   dotenv stops at the first line break, and you get a confusing
   "not valid JSON" much later. This base64-encodes it into one line
   instead, which is why api/_lib/drive.js accepts either form.

   It rewrites only the keys it owns and leaves every other line of
   .env — Contentful, Formspree — untouched. A timestamped backup is
   written alongside (.env.* is git-ignored).

   It never prints the key. The only thing echoed is the service-account
   email, which you need for the Drive sharing step and which is not a
   secret.
   ================================================================== */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV = path.join(ROOT, ".env");

const die = (msg, hint) => {
  console.error(`\n\x1b[31m${msg}\x1b[0m`);
  if (hint) console.error(`→ ${hint}`);
  console.error("");
  process.exit(1);
};

/* ---- read the key ---- */
const keyPath = process.argv[2];
if (!keyPath) {
  die("Pass the path to the downloaded .json key.",
    'npm run key -- "C:/Users/Homework/Downloads/cc-delivery-1234.json"');
}
if (!existsSync(keyPath)) die(`No file at ${keyPath}`, "check the path — drag the file into the terminal to get it exactly");

let key, raw;
try {
  raw = readFileSync(keyPath, "utf8");
  key = JSON.parse(raw);
} catch (e) {
  die("That file is not valid JSON: " + e.message, "re-download the key from the service account's Keys tab");
}

if (key.type !== "service_account") {
  die(`That looks like a "${key.type || "unknown"}" credential, not a service-account key.`,
    "in the console: IAM & Admin → Service Accounts → your account → Keys → Add key → JSON");
}
if (!key.client_email || !key.private_key) {
  die("The key is missing client_email or private_key.", "re-download it — the file may be truncated");
}

/* ---- merge into .env ---- */
const updates = {
  GOOGLE_SERVICE_ACCOUNT_JSON: Buffer.from(raw, "utf8").toString("base64"),
};

let existing = "";
if (existsSync(ENV)) {
  existing = readFileSync(ENV, "utf8");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = `${ENV}.${stamp}.bak`;
  copyFileSync(ENV, backup);
  console.log(`\n  backup   ${path.basename(backup)}`);
} else {
  console.log("\n  .env did not exist — creating it");
}

/* only generate a session secret if one isn't already set */
const has = (name) => new RegExp(`^\\s*${name}\\s*=\\s*\\S`, "m").test(existing);
if (!has("ADMIN_SESSION_SECRET")) updates.ADMIN_SESSION_SECRET = crypto.randomUUID();

const eol = existing.includes("\r\n") ? "\r\n" : "\n";
let out = existing;
for (const [name, value] of Object.entries(updates)) {
  const line = `${name}=${value}`;
  const re = new RegExp(`^\\s*${name}\\s*=.*$`, "m");
  if (re.test(out)) out = out.replace(re, line);
  else out = (out ? out.replace(/\s*$/, "") + eol + eol : "") + line + eol;
}
writeFileSync(ENV, out);

/* ---- report ---- */
console.log(`  wrote    GOOGLE_SERVICE_ACCOUNT_JSON  (base64, ${updates.GOOGLE_SERVICE_ACCOUNT_JSON.length} chars)`);
if (updates.ADMIN_SESSION_SECRET) console.log("  wrote    ADMIN_SESSION_SECRET          (generated)");
else console.log("  kept     ADMIN_SESSION_SECRET          (already set)");

const stillNeeded = ["DRIVE_ROOT_FOLDER_ID", "DRIVE_CONTENT_FILE_ID", "ADMIN_PASSWORD"].filter((n) => !has(n));

console.log(`\n\x1b[1mService account email\x1b[0m\n  ${key.client_email}`);
console.log("\n  Share Viraj's `Clients` folder with that address as \x1b[1mEditor\x1b[0m");
console.log("  (untick \"Notify people\" — it cannot receive mail).\n");

if (stillNeeded.length) {
  console.log("Still to fill in .env by hand:");
  for (const n of stillNeeded) console.log(`  · ${n}`);
  console.log("");
}
console.log("Then run:  npm run check:delivery\n");
