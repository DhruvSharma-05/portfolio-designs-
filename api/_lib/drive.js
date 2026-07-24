/* ==================================================================
   DRIVE — the single source of truth, for photos AND for content.

   Photos live where Viraj already puts them: folders in his Drive.
   The project metadata he writes in /admin (titles, descriptions,
   which photo belongs to which project, ordering) is stored as ONE
   JSON file in that same Drive — so there is no database anywhere and
   his Drive remains the whole site.

   IMPORTANT — service-account quota: a service account has 0 bytes of
   storage of its own, so it cannot CREATE files in a normal folder.
   It can happily UPDATE a file someone else owns. That is why setup
   asks Viraj to create an empty content.json himself and share it;
   we only ever call files.update on it, never files.create.
   ================================================================== */

import { google } from "googleapis";

export function driveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const text = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");
  const key = JSON.parse(text);
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    // drive scope (not drive.readonly): the admin writes content.json back
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

/* Folders directly inside `parent` — one level, which is all the admin
   browser needs (a folder per shoot is the natural way to work). */
export async function listFolders(drive, parent) {
  const res = await drive.files.list({
    q: `'${parent}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    orderBy: "name",
    pageSize: 200,
  });
  return res.data.files || [];
}

/* Every image inside a folder, newest uploads last so the order matches
   the way a shoot is dumped in. */
export async function listImages(drive, folder) {
  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folder}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, md5Checksum, size, imageMediaMetadata(width,height))",
      orderBy: "name",
      pageSize: 200,
      pageToken,
    });
    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files.map((f) => ({
    id: f.id,
    name: f.name,
    w: f.imageMediaMetadata?.width ?? null,
    h: f.imageMediaMetadata?.height ?? null,
    size: Number(f.size) || 0,
  }));
}

export async function fileBytes(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );
  return Buffer.from(res.data);
}

/* Same download as fileBytes, but as a stream — for zipping many full-res
   photos, where buffering every file into memory first would blow the
   function's memory. Only api/download.js should use this; everything
   else (thumbnails, content.json) is small enough that fileBytes is fine. */
export async function fileStream(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" },
  );
  return res.data;
}

/* A new, empty folder has 0 bytes, so — unlike file content — a
   quota-less service account can create one inside a folder it has
   Editor access to (see the note above). This is admin-only: callers
   validate the parent with folderMeta() first. */
export async function createFolder(drive, parentId, name) {
  const res = await drive.files.create({
    requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
    fields: "id, name",
  });
  return res.data;
}

/* ---- client delivery sharing --------------------------------------
   The site manages the sharing so Viraj never opens Drive's share
   dialog — which is where the real accident lives (sharing a PARENT
   folder exposes every client inside it). We only ever touch the one
   folder id the gallery points at.

   Viewer role: the client can open and download, but cannot rename,
   delete, upload, or see anything outside that folder.               */

const ANYONE_READER = { role: "reader", type: "anyone", allowFileDiscovery: false };

/* Is this folder currently shared by link? */
export async function shareState(drive, folderId) {
  const res = await drive.permissions.list({
    fileId: folderId,
    fields: "permissions(id, type, role, allowFileDiscovery)",
  });
  const link = (res.data.permissions || []).find((p) => p.type === "anyone");
  return { shared: Boolean(link), permissionId: link?.id || null };
}

export async function grantLinkAccess(drive, folderId) {
  const { shared } = await shareState(drive, folderId);
  if (shared) return { shared: true, already: true };
  await drive.permissions.create({
    fileId: folderId,
    requestBody: ANYONE_READER,
    // sendNotificationEmail is only meaningful for user grants
  });
  return { shared: true };
}

export async function revokeLinkAccess(drive, folderId) {
  const { permissionId } = await shareState(drive, folderId);
  if (!permissionId) return { shared: false, already: true };
  await drive.permissions.delete({ fileId: folderId, permissionId });
  return { shared: false };
}

export async function folderMeta(drive, folderId) {
  const res = await drive.files.get({
    fileId: folderId,
    fields: "id, name, mimeType, trashed",
  });
  return res.data;
}

/* How many images are in the delivery folder — shown to the client so
   they can tell the download finished with everything in it. */
export async function countImages(drive, folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: "files(id)",
    pageSize: 1000,
  });
  return (res.data.files || []).length;
}

export const folderUrl = (id) => `https://drive.google.com/drive/folders/${id}`;

/* ---- content.json -------------------------------------------------
   The shape the admin edits and the build consumes. Kept deliberately
   flat and boring so it stays readable if anyone opens it in Drive. */

export const EMPTY_CONTENT = {
  version: 1,
  updatedAt: null,
  // Frozen — /admin no longer edits these (it's client-delivery only now),
  // but they stay here so scripts/sync-drive.mjs keeps reading valid arrays
  // and a pre-existing content.json isn't silently truncated on next write.
  photoProjects: [],
  webProjects: [],
  clients: [],
};

export async function readContent(drive) {
  const id = process.env.DRIVE_CONTENT_FILE_ID;
  if (!id) throw new Error("DRIVE_CONTENT_FILE_ID is not set");
  const buf = await fileBytes(drive, id);
  const text = buf.toString("utf8").trim();
  if (!text) return { ...EMPTY_CONTENT };          // freshly created empty file
  try {
    return { ...EMPTY_CONTENT, ...JSON.parse(text) };
  } catch {
    // never let a corrupt file wipe the site — surface it instead
    throw new Error("content.json in Drive is not valid JSON");
  }
}

export async function writeContent(drive, data) {
  const id = process.env.DRIVE_CONTENT_FILE_ID;
  if (!id) throw new Error("DRIVE_CONTENT_FILE_ID is not set");
  const body = { ...data, version: 1, updatedAt: new Date().toISOString() };
  await drive.files.update({
    fileId: id,
    media: { mimeType: "application/json", body: JSON.stringify(body, null, 2) },
  });
  return body;
}
