import { useState, useEffect, useCallback, useRef } from "react";
import { P } from "../data.js";
import { isMock, enableMock, mockApi, thumbUrl } from "./adminMock.js";

/* ==================================================================
   ADMIN — Viraj's control room.

   Flow: photos are uploaded to Google Drive exactly as before. Here he
   groups them into projects, writes the words, and presses Publish.
   Project metadata is saved back to Drive as content.json; publishing
   rebuilds the site, which optimises the photos and bakes them in.

   Deliberately plain: one dashboard, two lists, one editor. Everything
   is auto-slugged and pre-filled so a project can be made in under a
   minute, and nothing is destructive without a confirm.

   This page is lazy-loaded so none of it ships to normal visitors.
   ================================================================== */

const api = async (url, options = {}) => {
  if (isMock()) return mockApi(url, options);

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  /* `vite dev` serves index.html for unknown paths, so a missing backend
     arrives as HTML with a 200 — checked explicitly, because otherwise it
     surfaces as a baffling JSON parse error. */
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  if (!isJson) throw new Error("NO_BACKEND");

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

/* First call decides which backend we are on. With no functions running
   (plain `npm run dev`) a dev build drops into preview mode instead of
   showing a login that could never succeed. A production build never
   does this — there it is a real error. */
const openSession = async () => {
  try {
    return await api("/api/auth");
  } catch (e) {
    if (e.message === "NO_BACKEND" && import.meta.env.DEV) {
      enableMock();
      return mockApi("/api/auth");
    }
    throw e;
  }
};

const slugify = (s) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const blankClient = () => ({ on: false, name: "", folderId: "", code: "", note: "", revoked: false });

/* Codes are read aloud and typed on phones, so the alphabet leaves out
   0/O/1/I/L. Six random characters on top of the project name is about
   a billion combinations — enough that guessing is hopeless, short
   enough to dictate over WhatsApp. */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const makeCode = (title) => {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((n) => ALPHABET[n % ALPHABET.length]).join("");
  const stem = slugify(title || "shoot").split("-").slice(0, 2).join("-") || "shoot";
  return `${stem}-${rand}`;
};

const blankPhotoProject = () => ({
  slug: "", t: "", kind: "Editorial", loc: "", year: String(new Date().getFullYear()),
  exif: "", role: "", note: "", intro: "", photos: [], hidden: false,
  client: blankClient(),
});

const blankWebProject = () => ({
  slug: "", t: "", tag: "Website", year: String(new Date().getFullYear()),
  role: "Design · Build", note: "", intro: "", tool: "Figma", href: "", live: "",
  stack: [], specs: [], cover: "", shots: [], hidden: false,
  client: blankClient(),
});

export default function Admin() {
  const [authed, setAuthed] = useState(null);   // null = still checking
  const [content, setContent] = useState(null);
  const [editing, setEditing] = useState(null); // { type, index }
  const [msg, setMsg] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    document.title = `Admin — ${P.name}`;
    openSession().then((d) => setAuthed(d.authed)).catch(() => setAuthed(false));
  }, []);

  const load = useCallback(async () => {
    try {
      setContent(await api("/api/content"));
      setDirty(false);
    } catch (e) {
      setMsg({ bad: true, text: e.message });
    }
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  /* warn before losing unsaved edits */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async (next = content) => {
    try {
      const saved = await api("/api/content", { method: "PUT", body: next });
      setContent(saved);
      setDirty(false);
      setMsg({ text: "Saved to Drive. Press Publish to put it live." });
      return true;
    } catch (e) {
      setMsg({ bad: true, text: e.message });
      return false;
    }
  };

  const publish = async () => {
    if (dirty && !(await save())) return;
    try {
      await api("/api/publish", { method: "POST" });
      setMsg({ text: "Rebuilding — the live site updates in about a minute." });
    } catch (e) {
      setMsg({ bad: true, text: e.message });
    }
  };

  const update = (type, index, patch) => {
    setContent((c) => {
      const list = [...c[type]];
      list[index] = { ...list[index], ...patch };
      return { ...c, [type]: list };
    });
    setDirty(true);
  };

  const add = (type) => {
    const blank = type === "photoProjects" ? blankPhotoProject() : blankWebProject();
    setContent((c) => ({ ...c, [type]: [...c[type], blank] }));
    setDirty(true);
    setEditing({ type, index: content[type].length });
  };

  const remove = (type, index) => {
    const p = content[type][index];
    if (!confirm(`Delete "${p.t || "this project"}"? The photos stay in Drive.`)) return;
    setContent((c) => ({ ...c, [type]: c[type].filter((_, i) => i !== index) }));
    setDirty(true);
    setEditing(null);
  };

  const move = (type, index, dir) => {
    const to = index + dir;
    setContent((c) => {
      const list = [...c[type]];
      if (to < 0 || to >= list.length) return c;
      [list[index], list[to]] = [list[to], list[index]];
      return { ...c, [type]: list };
    });
    setDirty(true);
  };

  if (authed === null) return <Shell><p className="mono">Checking…</p></Shell>;
  if (!authed) return <Login onIn={() => setAuthed(true)} />;
  if (!content) return <Shell><p className="mono">Loading projects…</p></Shell>;

  if (editing) {
    const list = content[editing.type];
    const project = list[editing.index];
    if (!project) { setEditing(null); return null; }
    return (
      <Shell>
        <Editor
          type={editing.type}
          project={project}
          onChange={(patch) => update(editing.type, editing.index, patch)}
          onBack={() => setEditing(null)}
          onSave={async () => { if (await save()) setEditing(null); }}
          onDelete={() => remove(editing.type, editing.index)}
          msg={msg}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <Dashboard
        content={content} dirty={dirty} msg={msg}
        onSave={() => save()} onPublish={publish}
        onAdd={add} onEdit={setEditing} onRemove={remove} onMove={move}
        onSignOut={async () => { await api("/api/auth", { method: "DELETE" }); setAuthed(false); }}
      />
    </Shell>
  );
}

/* ---------------- chrome ---------------- */

function Shell({ children }) {
  return (
    <main id="main" className="admin wrap">
      <header className="admin-top">
        <div>
          <div className="mono">{P.name} — Admin</div>
          <h1>Control room</h1>
        </div>
        <a className="mono" href="/" target="_blank" rel="noreferrer">View site ↗</a>
      </header>
      {isMock() && (
        <p className="admin-msg mono preview">
          Preview mode — no Drive connected. The projects below are fake and
          nothing you change here is saved.
        </p>
      )}
      {children}
    </main>
  );
}

function Login({ onIn }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api("/api/auth", { method: "POST", body: { password: pw } });
      onIn();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <form className="admin-login" onSubmit={submit}>
        <label className="mono" htmlFor="pw">Password</label>
        <input id="pw" type="password" value={pw} autoFocus
          onChange={(e) => setPw(e.target.value)} />
        <button className="btn" type="submit" disabled={busy || !pw}>
          {busy ? "Checking…" : "Sign in"}
        </button>
        {err && <p className="admin-msg bad mono">{err}</p>}
      </form>
    </Shell>
  );
}

/* ---------------- dashboard ---------------- */

function Dashboard({ content, dirty, msg, onSave, onPublish, onAdd, onEdit, onRemove, onMove, onSignOut }) {
  const photos = content.photoProjects;
  const webs = content.webProjects;
  const frames = photos.reduce((n, p) => n + p.photos.length, 0);

  return (
    <>
      <div className="admin-stats">
        <Stat n={photos.length} k="Photography projects" />
        <Stat n={webs.length} k="Web design projects" />
        <Stat n={frames} k="Photos placed" />
        <Stat
          n={content.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : "—"}
          k="Last saved" small
        />
      </div>

      <div className="admin-actions">
        <button className="btn" onClick={onSave} disabled={!dirty}>
          {dirty ? "Save changes" : "All changes saved"}
        </button>
        <button className="btn primary" onClick={onPublish}>Publish to the live site</button>
        <button className="btn ghost" onClick={onSignOut}>Sign out</button>
      </div>

      {msg && <p className={`admin-msg mono ${msg.bad ? "bad" : ""}`}>{msg.text}</p>}

      <ProjectList
        title="Photography" brand={P.photoBrand} type="photoProjects" items={photos}
        onAdd={onAdd} onEdit={onEdit} onRemove={onRemove} onMove={onMove}
        count={(p) => `${p.photos.length} photos`}
      />
      <ProjectList
        title="Web design" brand="Design & build" type="webProjects" items={webs}
        onAdd={onAdd} onEdit={onEdit} onRemove={onRemove} onMove={onMove}
        count={(w) => `${w.shots.length} screens`}
      />
    </>
  );
}

function Stat({ n, k, small }) {
  return (
    <div className="admin-stat">
      <b style={small ? { fontSize: "22px" } : undefined}>{n}</b>
      <span className="mono">{k}</span>
    </div>
  );
}

function ProjectList({ title, brand, type, items, onAdd, onEdit, onRemove, onMove, count }) {
  return (
    <section className="admin-sec">
      <div className="admin-sec-head">
        <div>
          <h2>{title}</h2>
          <span className="mono">{brand}</span>
        </div>
        <button className="btn" onClick={() => onAdd(type)}>+ New {title.toLowerCase()} project</button>
      </div>

      {!items.length && (
        <p className="admin-empty mono">
          Nothing here yet — press “New {title.toLowerCase()} project”.
        </p>
      )}

      {items.map((p, i) => (
        <div className="admin-row" key={p.slug || i}>
          <span className="mono num">{String(i + 1).padStart(2, "0")}</span>
          <div className="admin-row-main">
            <strong>{p.t || <em className="dim">Untitled</em>}</strong>
            <span className="mono">/{p.slug || "no-address"} — {count(p)}{p.hidden ? " — hidden" : ""}</span>
          </div>
          <div className="admin-row-acts">
            <button className="mini" onClick={() => onMove(type, i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
            <button className="mini" onClick={() => onMove(type, i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
            <button className="btn small" onClick={() => onEdit({ type, index: i })}>Edit</button>
            <button className="mini danger" onClick={() => onRemove(type, i)} aria-label="Delete">✕</button>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------------- editor ---------------- */

function Editor({ type, project, onChange, onBack, onSave, onDelete, msg }) {
  const isPhoto = type === "photoProjects";
  const [picking, setPicking] = useState(null); // "photos" | "shots" | "cover"

  /* auto-fill the address from the title until it is edited by hand */
  const setTitle = (t) => {
    const auto = !project.slug || project.slug === slugify(project.t || "");
    onChange({ t, ...(auto ? { slug: slugify(t) } : null) });
  };

  return (
    <>
      <div className="admin-actions">
        <button className="btn ghost" onClick={onBack}>← Back</button>
        <button className="btn primary" onClick={onSave}>Save project</button>
        <button className="btn danger" onClick={onDelete}>Delete</button>
      </div>
      {msg && <p className={`admin-msg mono ${msg.bad ? "bad" : ""}`}>{msg.text}</p>}

      <div className="admin-form">
        <Field label="Title" hint="Shown as the project heading">
          <input value={project.t} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Address" hint="The web address — letters and dashes only">
          <input value={project.slug}
            onChange={(e) => onChange({ slug: slugify(e.target.value) })} />
        </Field>

        {isPhoto ? (
          <>
            <Field label="Kind" hint="Editorial, Portraits, Events, Landscape…">
              <input value={project.kind} onChange={(e) => onChange({ kind: e.target.value })} />
            </Field>
            <Field label="Location"><input value={project.loc} onChange={(e) => onChange({ loc: e.target.value })} /></Field>
            <Field label="Year"><input value={project.year} onChange={(e) => onChange({ year: e.target.value })} /></Field>
            <Field label="Camera line" hint="e.g. 35mm · f/1.8 · 1/125">
              <input value={project.exif} onChange={(e) => onChange({ exif: e.target.value })} />
            </Field>
            <Field label="Role" hint="e.g. Photography · Grade">
              <input value={project.role} onChange={(e) => onChange({ role: e.target.value })} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Type" hint="Website, Brand & menu, Editorial CMS…">
              <input value={project.tag} onChange={(e) => onChange({ tag: e.target.value })} />
            </Field>
            <Field label="Year"><input value={project.year} onChange={(e) => onChange({ year: e.target.value })} /></Field>
            <Field label="Role" hint="e.g. Design · Build">
              <input value={project.role} onChange={(e) => onChange({ role: e.target.value })} />
            </Field>
            <Field label="Made in" hint="Figma, Canva, Webflow…">
              <input value={project.tool} onChange={(e) => onChange({ tool: e.target.value })} />
            </Field>
            <Field label="Source link" hint="Figma or Canva URL — leave empty to show it as private">
              <input value={project.href} placeholder="https://figma.com/…"
                onChange={(e) => onChange({ href: e.target.value })} />
            </Field>
            <Field label="Live site" hint="Optional">
              <input value={project.live} placeholder="https://…"
                onChange={(e) => onChange({ live: e.target.value })} />
            </Field>
            <Field label="Built with" hint="Comma separated">
              <input value={project.stack.join(", ")}
                onChange={(e) => onChange({ stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </Field>
          </>
        )}

        <Field label="One-liner" hint="The big line at the top of the project page" wide>
          <input value={project.intro} onChange={(e) => onChange({ intro: e.target.value })} />
        </Field>
        <Field label="Description" hint="A short paragraph — what it was and what it was for" wide>
          <textarea rows={4} value={project.note} onChange={(e) => onChange({ note: e.target.value })} />
        </Field>

        <Field label="Visibility" wide>
          <label className="admin-check">
            <input type="checkbox" checked={!project.hidden}
              onChange={(e) => onChange({ hidden: !e.target.checked })} />
            <span>Show this project on the site</span>
          </label>
          <label className="admin-check">
            <input type="checkbox" checked={Boolean(project.client?.on)}
              onChange={(e) => onChange({
                client: {
                  ...blankClient(), ...project.client, on: e.target.checked,
                  // first tick pre-fills a code so there is nothing to think about
                  code: project.client?.code || makeCode(project.t),
                },
              })} />
            <span>This shoot is for a client (adds a download code)</span>
          </label>
        </Field>
      </div>

      {project.client?.on && (
        <Delivery
          client={project.client}
          title={project.t}
          onChange={(patch) => onChange({ client: { ...project.client, ...patch } })}
        />
      )}

      {/* ---- pictures ---- */}
      {isPhoto ? (
        <PhotoSlot
          label="Photos in this project"
          hint="The first one is used as the cover."
          ids={project.photos}
          onOpen={() => setPicking("photos")}
          onChange={(photos) => onChange({ photos })}
        />
      ) : (
        <>
          <PhotoSlot
            label="Cover screenshot"
            hint="The full-page screenshot shown in the browser frame."
            ids={project.cover ? [project.cover] : []}
            onOpen={() => setPicking("cover")}
            onChange={(ids) => onChange({ cover: ids[0] || "" })}
          />
          <PhotoSlot
            label="Screens"
            hint="Every other screenshot, in order."
            ids={project.shots}
            onOpen={() => setPicking("shots")}
            onChange={(shots) => onChange({ shots })}
          />
        </>
      )}

      {picking && (
        <Picker
          multiple={picking !== "cover"}
          selected={picking === "cover" ? (project.cover ? [project.cover] : []) : project[picking]}
          onClose={() => setPicking(null)}
          onDone={(ids) => {
            onChange(picking === "cover" ? { cover: ids[0] || "" } : { [picking]: ids });
            setPicking(null);
          }}
        />
      )}
    </>
  );
}

function Field({ label, hint, children, wide }) {
  return (
    <label className={`admin-field${wide ? " wide" : ""}`}>
      <span className="mono">{label}</span>
      {children}
      {hint && <em>{hint}</em>}
    </label>
  );
}

/* A chosen set of Drive photos, with reordering and removal. */
function PhotoSlot({ label, hint, ids, onOpen, onChange }) {
  const move = (i, dir) => {
    const to = i + dir;
    if (to < 0 || to >= ids.length) return;
    const next = [...ids];
    [next[i], next[to]] = [next[to], next[i]];
    onChange(next);
  };
  return (
    <section className="admin-sec">
      <div className="admin-sec-head">
        <div>
          <h2>{label}</h2>
          <span className="mono">{ids.length} selected — {hint}</span>
        </div>
        <button className="btn" onClick={onOpen}>Choose from Drive</button>
      </div>
      <div className="admin-thumbs">
        {ids.map((id, i) => (
          <figure key={id} className="admin-thumb">
            <img src={thumbUrl(id)} alt="" loading="lazy" />
            <figcaption>
              <button className="mini" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Earlier">←</button>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <button className="mini" onClick={() => move(i, 1)} disabled={i === ids.length - 1} aria-label="Later">→</button>
              <button className="mini danger" onClick={() => onChange(ids.filter((x) => x !== id))} aria-label="Remove">✕</button>
            </figcaption>
          </figure>
        ))}
        {!ids.length && <p className="admin-empty mono">No pictures chosen yet.</p>}
      </div>
    </section>
  );
}

/* Drive browser: folders on the left, frames on the right, tick to pick. */
function Picker({ selected, multiple, onClose, onDone }) {
  const [folders, setFolders] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [folder, setFolder] = useState(null);
  const [pick, setPick] = useState(selected);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);
  const boxRef = useRef(null);

  useEffect(() => {
    setBusy(true);
    const url = folder ? `/api/library?folder=${encodeURIComponent(folder)}` : "/api/library";
    api(url)
      .then((d) => { if (!folder) setFolders(d.folders); setPhotos(d.photos); setErr(""); })
      .catch((e) => setErr(e.message))
      .finally(() => setBusy(false));
  }, [folder]);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.documentElement.style.overflow = prev;
    };
  }, [onClose]);

  const toggle = (id) => {
    if (!multiple) return setPick([id]);
    setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  return (
    <div className="admin-picker" role="dialog" aria-modal="true" aria-label="Choose photos from Drive">
      <div className="admin-picker-in" ref={boxRef}>
        <div className="admin-picker-top">
          <div>
            <strong>Choose from Drive</strong>
            <span className="mono"> — {pick.length} selected</span>
          </div>
          <div className="admin-row-acts">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={() => onDone(pick)}>Use these</button>
          </div>
        </div>

        <div className="admin-picker-body">
          <nav className="admin-folders">
            <button className={`fold ${!folder ? "on" : ""}`} onClick={() => setFolder(null)}>
              All / root
            </button>
            {folders.map((f) => (
              <button key={f.id} className={`fold ${folder === f.id ? "on" : ""}`}
                onClick={() => setFolder(f.id)}>{f.name}</button>
            ))}
          </nav>

          <div className="admin-grid">
            {busy && <p className="mono">Reading Drive…</p>}
            {err && <p className="admin-msg bad mono">{err}</p>}
            {!busy && !err && !photos.length && (
              <p className="admin-empty mono">No photos in this folder.</p>
            )}
            {photos.map((ph) => {
              const on = pick.includes(ph.id);
              const order = pick.indexOf(ph.id) + 1;
              return (
                <button key={ph.id} className={`pickfr ${on ? "on" : ""}`}
                  onClick={() => toggle(ph.id)} title={ph.name}>
                  <img src={thumbUrl(ph.id)} alt="" loading="lazy" />
                  {on && <span className="badge mono">{multiple ? order : "✓"}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- client delivery ----------------
   Everything Viraj needs to hand a finished shoot over: which Drive
   folder, the code, and the message to paste into WhatsApp.

   Sharing is done here rather than in Drive's own dialog, because that
   dialog is where the dangerous mistake lives — sharing a PARENT
   folder would expose every client inside it. This only ever touches
   the one folder id below. */
function Delivery({ client, title, onChange }) {
  const [state, setState] = useState(null);      // { shared, name, count }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState("");

  const link = `${location.origin}/client/${client.code}`;
  const message =
    `Hi${client.name ? ` ${client.name}` : ""}, your photos from ${title || "the shoot"} are ready.\n\n` +
    `${link}\n\nCode: ${client.code}\n\n— ${P.photographer}`;

  const call = async (action) => {
    if (!client.folderId) { setErr("Pick the Drive folder that holds the finished photos"); return; }
    setBusy(true); setErr("");
    try {
      setState(await api("/api/share", { method: "POST", body: { folderId: client.folderId, action } }));
      if (action === "revoke") onChange({ revoked: true });
      if (action === "grant") onChange({ revoked: false });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  /* check the live sharing state whenever the folder changes */
  useEffect(() => {
    if (!client.folderId) { setState(null); return; }
    let alive = true;
    api("/api/share", { method: "POST", body: { folderId: client.folderId, action: "check" } })
      .then((d) => alive && setState(d))
      .catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
  }, [client.folderId]);

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setErr("Couldn't copy — select the text and copy it by hand");
    }
  };

  return (
    <section className="admin-sec deliver">
      <div className="admin-sec-head">
        <div>
          <h2>Client download</h2>
          <span className="mono">
            {state?.shared
              ? `Live — ${state.count ?? "?"} photos in ${state.name || "the folder"}`
              : "Not shared yet"}
          </span>
        </div>
        {state?.shared
          ? <button className="btn danger" onClick={() => call("revoke")} disabled={busy}>Revoke access</button>
          : <button className="btn primary" onClick={() => call("grant")} disabled={busy}>Share folder</button>}
      </div>

      <div className="admin-form">
        <Field label="Client name" hint="Shown to them on the download page">
          <input value={client.name} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>

        <Field label="Access code" hint="They type this. Works until you revoke it.">
          <div className="admin-inline">
            <input value={client.code}
              onChange={(e) => onChange({ code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
            <button className="btn small" onClick={() => onChange({ code: makeCode(title) })}>New</button>
          </div>
        </Field>

        <Field label="Delivery folder (Drive folder ID)" wide
          hint="The folder holding the finished photos — NOT a parent folder. Open it in Drive; the ID is the part of the URL after /folders/.">
          <input value={client.folderId} placeholder="1a2b3c…"
            onChange={(e) => onChange({ folderId: e.target.value.trim() })} />
        </Field>

        <Field label="Note to the client" hint="One line, shown above the download button" wide>
          <input value={client.note} placeholder="Full set, edited — shout if you need any in a different crop."
            onChange={(e) => onChange({ note: e.target.value })} />
        </Field>
      </div>

      {err && <p className="admin-msg bad mono">{err}</p>}

      <div className="deliver-send">
        <div className="mono">Send this</div>
        <pre>{message}</pre>
        <div className="admin-row-acts">
          <button className="btn" onClick={() => copy(message, "message")}>
            {copied === "message" ? "Copied ✓" : "Copy message"}
          </button>
          <button className="btn ghost" onClick={() => copy(link, "link")}>
            {copied === "link" ? "Copied ✓" : "Copy link only"}
          </button>
        </div>
        <p className="mono deliver-hint">
          Save the project after sharing, or the code won't be live.
        </p>
      </div>
    </section>
  );
}
