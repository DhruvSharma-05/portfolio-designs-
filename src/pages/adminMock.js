/* ==================================================================
   ADMIN PREVIEW MODE — a fake backend, dev only.

   `npm run dev` runs Vite alone, which does not serve the functions in
   api/. Rather than leave /admin stuck on a login it can never pass,
   the page detects that there is no backend and runs against this
   in-memory stand-in instead: sign-in is skipped, the lists are full of
   plausible projects, and the Drive picker shows placeholder frames.

   It is for looking at the interface and nothing else. Edits live until
   you refresh, and this module is only ever reachable when
   import.meta.env.DEV is true — a production build never uses it.
   ================================================================== */

let active = false;
export const isMock = () => active;
export const enableMock = () => { active = true; };

/* In preview mode a photo "id" is just an image URL, so the same <img>
   markup works with no Drive behind it. */
export const thumbUrl = (id) =>
  active ? id : `/api/thumb?id=${encodeURIComponent(id)}`;

const shot = (seed, n) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}-${i + 1}/400/400`);

const FOLDERS = [
  { id: "f-after-hours", name: "After Hours" },
  { id: "f-faces", name: "Faces" },
  { id: "f-salt", name: "Salt & Light" },
  { id: "f-web", name: "Web screens" },
];

const FOLDER_PHOTOS = {
  "f-after-hours": shot("after-hours", 12),
  "f-faces": shot("faces", 10),
  "f-salt": shot("salt", 8),
  "f-web": shot("web", 6),
};

const asPhotos = (urls) =>
  urls.map((u, i) => ({ id: u, name: `frame-${String(i + 1).padStart(2, "0")}.jpg`, w: 400, h: 400 }));

/* the document the real admin would load from Drive */
let store = {
  version: 1,
  updatedAt: new Date().toISOString(),
  photoProjects: [
    {
      slug: "after-hours", t: "After Hours", kind: "Editorial",
      loc: "Chandigarh, IN", year: "2025", exif: "35mm · f/1.8 · 1/125",
      role: "Photography · Grade",
      note: "A night series shot entirely on available light, made over two evenings across the old market.",
      intro: "Two nights, one lens, no flash. The city did the lighting.",
      photos: FOLDER_PHOTOS["f-after-hours"].slice(0, 7), hidden: false,
    },
    {
      slug: "faces", t: "Faces", kind: "Portraits",
      loc: "Studio", year: "2024", exif: "85mm · f/2 · 1/200",
      role: "Portrait · One light",
      note: "Twelve people, one afternoon, one light moved twice.",
      intro: "One light, moved twice. Everything else is the person.",
      photos: FOLDER_PHOTOS["f-faces"].slice(0, 5), hidden: false,
    },
  ],
  webProjects: [
    {
      slug: "north-cafe", t: "North Café", tag: "Brand & menu", year: "2025",
      role: "Design · Brand",
      note: "Identity, printed menu system and a one-page site for a small café.",
      intro: "A menu that reads the same printed as it does on a phone.",
      tool: "Canva", href: "https://canva.com", live: "",
      stack: ["Canva", "Illustrator", "Webflow"],
      specs: [
        { k: "Scope", v: "Identity, print menu, one-page site" },
        { k: "Timeline", v: "3 weeks" },
      ],
      cover: FOLDER_PHOTOS["f-web"][0],
      shots: FOLDER_PHOTOS["f-web"].slice(1, 4),
      hidden: false,
    },
  ],
};

const wait = (ms = 260) => new Promise((r) => setTimeout(r, ms));

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
    const folder = new URL(url, location.origin).searchParams.get("folder");
    if (!folder) return { folders: FOLDERS, photos: [] };
    return { folders: [], photos: asPhotos(FOLDER_PHOTOS[folder] || []) };
  }

  if (url.startsWith("/api/content")) {
    if (method === "PUT") {
      store = { ...store, ...options.body, updatedAt: new Date().toISOString() };
      return store;
    }
    return store;
  }

  if (url.startsWith("/api/publish")) {
    return { started: true, preview: true };
  }

  throw new Error(`No preview handler for ${url}`);
}
