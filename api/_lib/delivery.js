/* ==================================================================
   The one security gate every PUBLIC client-delivery endpoint must
   apply, in exactly one place — api/client.js and api/download.js both
   call resolveDelivery() so they can never drift apart on what counts
   as "a valid, open gallery". Duplicating this across two public
   routes is exactly the kind of thing that eventually hands one
   client another client's folder.
   ================================================================== */

import { readContent, shareState } from "./drive.js";

export async function resolveDelivery(drive, code) {
  const clean = String(code || "").trim().toLowerCase();
  if (!clean) return { ok: false, status: 400, error: "Enter your code" };

  const content = await readContent(drive);
  const found = (content.clients || [])
    .filter((c) => c.code && c.folderId)
    .find((c) => c.code.toLowerCase() === clean);

  // Same answer for "no such code" and "code exists but is revoked", so
  // the response can't be used to probe which codes are real.
  if (!found || found.revoked) {
    return { ok: false, status: 404, error: "That code doesn't match a gallery. Check it with Viraj." };
  }

  const folderId = found.folderId;
  const share = await shareState(drive, folderId).catch(() => ({ shared: false }));
  if (!share.shared) {
    return { ok: false, status: 409, error: "This gallery isn't open yet. Ask Viraj to re-share it." };
  }

  return { ok: true, client: found, folderId };
}

/* Caps on the server-built ZIP a client can download directly from the
   site — kept here so api/client.js (which decides whether to offer the
   button) and api/download.js (which enforces it) can never disagree on
   the number. Above either limit, only "Open in Google Drive" is shown —
   Drive's own UI zips arbitrarily large folders fine, just not through us. */
export const MAX_FILES = Number(process.env.DOWNLOAD_MAX_FILES) || 400;
export const MAX_BYTES = (Number(process.env.DOWNLOAD_MAX_MB) || 1500) * 1024 * 1024;
