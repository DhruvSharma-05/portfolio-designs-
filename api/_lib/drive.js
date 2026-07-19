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
      fields: "nextPageToken, files(id, name, mimeType, md5Checksum, imageMediaMetadata(width,height))",
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
  }));
}

export async function fileBytes(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );
  return Buffer.from(res.data);
}

/* ---- content.json -------------------------------------------------
   The shape the admin edits and the build consumes. Kept deliberately
   flat and boring so it stays readable if anyone opens it in Drive. */

export const EMPTY_CONTENT = {
  version: 1,
  updatedAt: null,
  photoProjects: [],
  webProjects: [],
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
