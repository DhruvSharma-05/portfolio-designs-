/* ==================================================================
   ADMIN PREVIEW MODE — a fake backend, dev only.

   `npm run dev` runs Vite alone, which does not serve the functions in
   api/. Rather than leave /admin stuck on a login it can never pass,
   the page detects that there is no backend and runs against this
   in-memory stand-in instead: sign-in is skipped, and the client list
   is full of plausible entries.

   It is for looking at the interface and nothing else. Edits live until
   you refresh, and this module is only ever reachable when
   import.meta.env.DEV is true — a production build never uses it.
   ================================================================== */

let active = false;
export const isMock = () => active;
export const enableMock = () => { active = true; };

const FOLDERS = [
  { id: "mock-folder-1", name: "Autumn Menu" },
  { id: "mock-folder-2", name: "Old Wedding" },
];

/* the document the real admin would load from Drive */
let store = {
  version: 1,
  updatedAt: new Date().toISOString(),
  clients: [
    {
      title: "Autumn menu shoot", name: "North Café", email: "hello@northcafe.example",
      folderId: "mock-folder-1", code: "north-cafe-7q4m2x",
      note: "Full set, edited. Shout if you need a different crop.", revoked: false,
    },
    {
      title: "Portrait session", name: "Faces Studio", email: "",
      folderId: "", code: "faces-3k9p2m", note: "", revoked: false,
    },
    {
      title: "Old wedding set", name: "Past Client", email: "",
      folderId: "mock-folder-2", code: "wedding-2x9k7v", note: "", revoked: true,
    },
  ],
};

const wait = (ms = 260) => new Promise((r) => setTimeout(r, ms));

/* which folders are "shared" in this preview session */
const shared = new Set(["mock-folder-1"]);

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
    // preview folders are flat (no real nesting) — browsing into any of
    // them just shows "no subfolders yet", same as a fresh real folder
    return { folders: folder ? [] : FOLDERS, photos: [] };
  }

  if (url.startsWith("/api/mail")) {
    const { to } = options.body || {};
    if (!/\S+@\S+\.\S+/.test(to || "")) throw new Error("Enter a valid email address");
    return { sent: true };
  }

  if (url.startsWith("/api/content")) {
    if (method === "PUT") {
      const { clients } = options.body || {};
      store = { ...store, clients: clients || [], updatedAt: new Date().toISOString() };
      return store;
    }
    return store;
  }

  if (url.startsWith("/api/share")) {
    const { folderId, action } = options.body || {};
    if (!folderId) throw new Error("Pick a delivery folder first");
    if (action === "grant") shared.add(folderId);
    if (action === "revoke") shared.delete(folderId);
    const name = FOLDERS.find((f) => f.id === folderId)?.name || "the folder (preview)";
    return { shared: shared.has(folderId), name, count: 24 };
  }

  throw new Error(`No preview handler for ${url}`);
}
