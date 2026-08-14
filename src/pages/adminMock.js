/* ==================================================================
   ADMIN PREVIEW MODE — a fake backend, dev only.

   `npm run dev` runs Vite alone, which does not serve the functions in
   api/. Rather than leave /admin stuck on a login it can never pass,
   the page detects that there is no backend and runs against this
   in-memory stand-in instead: sign-in is skipped, the list is full of
   plausible clients, and the folder picker shows placeholder folders.

   It is for looking at the interface and nothing else. Edits live until
   you refresh, and this module is only ever reachable when
   import.meta.env.DEV is true — a production build never uses it.
   ================================================================== */

let active = false;
export const isMock = () => active;
export const enableMock = () => { active = true; };

const FOLDERS = [
  { id: "f-after-hours", name: "After Hours: North Café" },
  { id: "f-sharma", name: "Sharma Wedding" },
  { id: "f-faces", name: "Faces (portrait day)" },
];

/* the document the real admin would load from Drive */
let store = {
  version: 1,
  updatedAt: new Date().toISOString(),
  deliveries: [
    {
      title: "After Hours", name: "North Café", email: "hello@northcafe.example",
      folderId: "f-after-hours", code: "after-hours-7q4m2x",
      note: "Full set, edited. Shout if you need a different crop.", revoked: false,
    },
    {
      title: "Sharma Wedding", name: "Priya Sharma", email: "",
      folderId: "f-sharma", code: "sharma-wed-3k9d2p",
      note: "", revoked: true,
    },
    {
      title: "Faces", name: "", email: "", folderId: "", code: "", note: "", revoked: false,
    },
  ],
};

const wait = (ms = 260) => new Promise((r) => setTimeout(r, ms));

/* which folders are "shared" in this preview session */
const shared = new Set(["f-after-hours"]);

/* Mirrors the real endpoints closely enough that swapping back to the
   live API changes nothing in the page. */
export async function mockApi(url, options = {}) {
  const method = options.method || "GET";
  await wait();

  if (url.startsWith("/api/auth")) {
    if (method === "DELETE") return { authed: false };
    return { authed: true, configured: true, preview: true };
  }

  if (url.startsWith("/api/library")) {
    if (method === "POST") {
      const { name } = options.body || {};
      const clean = String(name || "").trim();
      if (!clean) throw new Error("Name the folder first");
      const folder = { id: `mock-folder-${FOLDERS.length + 1}`, name: clean };
      FOLDERS.push(folder);
      return { folder };
    }
    const folder = new URL(url, location.origin).searchParams.get("folder");
    return { folders: folder ? [] : FOLDERS };
  }

  if (url.startsWith("/api/mail")) {
    const { to } = options.body || {};
    if (!/\S+@\S+\.\S+/.test(to || "")) throw new Error("Enter a valid email address");
    return { sent: true };
  }

  if (url.startsWith("/api/content")) {
    if (method === "PUT") {
      store = { ...store, ...options.body, updatedAt: new Date().toISOString() };
      return store;
    }
    return store;
  }

  if (url.startsWith("/api/share")) {
    const { folderId, action } = options.body || {};
    if (!folderId) throw new Error("Pick a delivery folder first");
    if (action === "grant") shared.add(folderId);
    if (action === "revoke") shared.delete(folderId);
    const name = FOLDERS.find((f) => f.id === folderId)?.name || "the folder";
    return { shared: shared.has(folderId), name, count: 24 };
  }

  throw new Error(`No preview handler for ${url}`);
}
