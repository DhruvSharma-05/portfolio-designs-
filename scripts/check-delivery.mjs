/* ==================================================================
   check-delivery.mjs — preflight for the client-delivery setup.

   Run `npm run check:delivery` after filling in .env and it tells you,
   in order, exactly which step of CLIENT-DELIVERY-POA.md §5 is wrong —
   rather than finding out from a 500 inside `vercel dev`.

   It checks the things that actually go wrong in practice:
     · the service-account JSON is present and parses
     · the key authenticates against Google at all
     · the Clients root folder exists and the service account can see it
       (i.e. it was really shared with the service-account email)
     · the root folder is NOT link-shared — the one dangerous mistake in
       §5.2, because link sharing is inherited by every client folder
     · content.json is readable AND writable (Editor, not Viewer — the
       single most common setup slip)

   The write check is a byte-identical round-trip: it writes back exactly
   what it read, so it can never change your content. Pass --no-write to
   skip it and run read-only.
   ================================================================== */

import "dotenv/config";
import {
  driveClient, folderMeta, shareState, readContent, writeContent, listFolders,
} from "../api/_lib/drive.js";

const WRITE = !process.argv.includes("--no-write");

const ok = (m, extra = "") => console.log(`  \x1b[32mOK\x1b[0m    ${m}${extra ? "  " + extra : ""}`);
const bad = (m, fix) => { console.log(`  \x1b[31mFAIL\x1b[0m  ${m}`); if (fix) console.log(`        → ${fix}`); failed++; };
const warn = (m, fix) => { console.log(`  \x1b[33mWARN\x1b[0m  ${m}`); if (fix) console.log(`        → ${fix}`); };

let failed = 0;

console.log("\nClient delivery preflight\n" + "─".repeat(52) + "\n");

/* ---- 1. the five required variables ---- */
console.log("Environment");
const REQUIRED = [
  ["GOOGLE_SERVICE_ACCOUNT_JSON", "the downloaded service-account key (raw JSON or base64)"],
  ["DRIVE_ROOT_FOLDER_ID", "id of the Clients folder, from its Drive URL"],
  ["DRIVE_CONTENT_FILE_ID", "id of the empty content.json you created in it"],
  ["ADMIN_PASSWORD", "any long password for /admin"],
  ["ADMIN_SESSION_SECRET", 'node -e "console.log(crypto.randomUUID())"'],
];
for (const [name, hint] of REQUIRED) {
  if (process.env[name]) ok(name);
  else bad(`${name} is not set in .env`, hint);
}
if (failed) {
  console.log(`\n${failed} missing — fill these in .env first, then run again.\n`);
  process.exit(1);
}

/* ---- 2. does the key parse, and who is it? ---- */
console.log("\nService account");
let drive, email;
try {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim();
  const text = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  let key;
  try {
    key = JSON.parse(text);
  } catch {
    /* Decoding junk as base64 yields binary noise, and echoing that into
       the terminal helps nobody — say what was expected instead. */
    throw new Error(
      raw.startsWith("{")
        ? "the value starts with { but is not valid JSON — it may have been truncated"
        : "the value is neither raw JSON (starting with {) nor valid base64 of it",
    );
  }
  email = key.client_email;
  if (!email || !key.private_key) throw new Error("no client_email / private_key in the JSON");
  ok("key parses", email);
  if (key.type !== "service_account") {
    warn(`key type is "${key.type}", expected "service_account"`,
      "you may have downloaded an OAuth client secret instead of a service-account key");
  }
  drive = driveClient();
} catch (e) {
  bad("could not read GOOGLE_SERVICE_ACCOUNT_JSON: " + e.message,
    "paste the whole .json file on one line, or base64 it:\n          node -e \"console.log(require('fs').readFileSync('key.json','base64'))\"");
  console.log(`\n${failed} problem(s).\n`);
  process.exit(1);
}

/* ---- 3. the Clients root ---- */
console.log("\nClients root folder");
try {
  const meta = await folderMeta(drive, process.env.DRIVE_ROOT_FOLDER_ID);
  if (meta.mimeType !== "application/vnd.google-apps.folder") {
    bad("DRIVE_ROOT_FOLDER_ID points at a file, not a folder",
      "copy the id from the URL when the FOLDER is open in Drive");
  } else if (meta.trashed) {
    bad(`"${meta.name}" is in the Drive bin`, "restore it, or point at a live folder");
  } else {
    ok("visible to the service account", `"${meta.name}"`);
    const folders = await listFolders(drive, meta.id).catch(() => []);
    ok(`${folders.length} shoot folder(s) inside`,
      folders.length ? folders.slice(0, 4).map((f) => f.name).join(", ") : "(empty — that's fine to start)");
  }

  /* §5.2 ⚠️ — link sharing on the ROOT is inherited by every client
     folder underneath it, which would make every gallery public. */
  const share = await shareState(drive, process.env.DRIVE_ROOT_FOLDER_ID);
  if (share.shared) {
    bad("the Clients root is shared with 'Anyone with the link'",
      "Drive → right-click Clients → Share → General access → Restricted.\n          Link sharing is INHERITED, so every client folder inside is public right now.");
  } else {
    ok("root is not link-shared", "(correct — sharing is per client folder)");
  }
} catch (e) {
  const m = e.message || "";
  if (/File not found|notFound/i.test(m)) {
    bad("the service account cannot see that folder",
      `share the Clients folder with ${email} as Editor (not Viewer), then re-run`);
  } else if (/insufficient|forbidden|403/i.test(m)) {
    bad("access denied on the Clients folder", `share it with ${email} as Editor`);
  } else if (/API has not been used|accessNotConfigured|disabled/i.test(m)) {
    bad("the Drive API is not enabled on this Google Cloud project",
      "console.cloud.google.com → APIs & Services → Library → Google Drive API → Enable");
  } else if (/invalid_grant|Invalid JWT|unauthorized_client/i.test(m)) {
    bad("Google rejected the key: " + m,
      "the key may be deleted/disabled — create a new JSON key on the service account");
  } else {
    bad("Drive request failed: " + m);
  }
}

/* ---- 4. content.json ---- */
console.log("\ncontent.json");
try {
  const content = await readContent(drive);
  const photo = content.photoProjects?.length || 0;
  const web = content.webProjects?.length || 0;
  ok("readable and valid JSON", `${photo} photo project(s), ${web} web project(s)`);

  const codes = [...(content.photoProjects || []), ...(content.webProjects || [])]
    .filter((p) => p.client?.on && p.client?.code);
  ok(`${codes.length} delivery code(s) configured`,
    codes.length ? codes.map((p) => p.client.code).join(", ") : "(none yet — make one in /admin)");

  if (WRITE) {
    await writeContent(drive, content);   // byte-identical round-trip
    ok("writable", "(round-tripped unchanged — service account has Editor)");
  } else {
    warn("write check skipped (--no-write)", "Viewer vs Editor is the most common setup slip");
  }
} catch (e) {
  const m = e.message || "";
  if (/not valid JSON/i.test(m)) {
    bad("content.json exists but is not valid JSON",
      "empty it completely (0 bytes is fine) and re-run");
  } else if (/File not found|notFound/i.test(m)) {
    bad("DRIVE_CONTENT_FILE_ID does not resolve",
      `create content.json inside Clients yourself, share it with ${email} as Editor,\n          and copy the id from its URL`);
  } else if (/insufficient|forbidden|403/i.test(m)) {
    bad("content.json is not writable by the service account",
      `share the FILE with ${email} as Editor — Viewer is not enough`);
  } else {
    bad("content.json check failed: " + m);
  }
}

/* ---- 5. optional extras ---- */
console.log("\nOptional");
const smtp = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].every((k) => process.env[k]);
if (smtp) ok("SMTP configured", "codes can be emailed from /admin");
else warn("SMTP not configured", "fine — codes are copy-paste (WhatsApp) instead");
if (process.env.VERCEL_DEPLOY_HOOK_URL) ok("deploy hook set", "Publish will trigger a rebuild");
else warn("VERCEL_DEPLOY_HOOK_URL not set", "the Publish button will report no hook configured");

console.log("\n" + "─".repeat(52));
if (failed) {
  console.log(`\x1b[31m${failed} problem(s)\x1b[0m — fix the arrows above and re-run.\n`);
  process.exit(1);
}
console.log("\x1b[32mAll checks passed.\x1b[0m Run `npx vercel dev` and open /admin.\n");
