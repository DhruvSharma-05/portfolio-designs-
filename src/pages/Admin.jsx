import { useState, useEffect, useCallback, useRef } from "react";
import { P } from "../data.js";
import { isMock, enableMock, mockApi } from "./adminMock.js";

/* ==================================================================
   ADMIN — Viraj's client-delivery control room.

   Client-delivery only: photos are uploaded to Google Drive exactly as
   before, and here he creates a shoot's delivery record — folder,
   access code, client details — and sends it. There is no portfolio
   CMS here; Work/Gallery/Portrait come from Contentful at build time
   (see CLAUDE.md), so nothing about the public site is editable from
   this page. No "Publish" button either — /api/client + /api/download
   read Drive live, so sharing a folder or sending a code takes effect
   immediately, no rebuild.

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

/* Codes are read aloud and typed on phones, so the alphabet leaves out
   0/O/1/I/L. Six random characters on top of the shoot title is about
   a billion combinations — enough that guessing is hopeless, short
   enough to dictate over WhatsApp. */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const makeCode = (title) => {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((n) => ALPHABET[n % ALPHABET.length]).join("");
  const stem = slugify(title || "shoot").split("-").slice(0, 2).join("-") || "shoot";
  return `${stem}-${rand}`;
};

const blankDelivery = () => ({
  title: "", name: "", email: "", folderId: "", code: "", note: "", revoked: false,
});

/* An SVG, not the "✕" character — U+2715 picks up emoji presentation in
   some browsers and renders as a blue glyph that ignores currentColor. */
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Admin() {
  const [authed, setAuthed] = useState(null);   // null = still checking
  const [content, setContent] = useState(null);
  const [editing, setEditing] = useState(null); // index into content.deliveries
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
      setMsg({ text: "Saved. The code is live immediately." });
      return true;
    } catch (e) {
      setMsg({ bad: true, text: e.message });
      return false;
    }
  };

  const update = (index, patch) => {
    setContent((c) => {
      const deliveries = [...c.deliveries];
      deliveries[index] = { ...deliveries[index], ...patch };
      return { ...c, deliveries };
    });
    setDirty(true);
  };

  const add = () => {
    setContent((c) => ({ ...c, deliveries: [...c.deliveries, blankDelivery()] }));
    setDirty(true);
    setEditing(content.deliveries.length);
  };

  const remove = (index) => {
    const d = content.deliveries[index];
    if (!confirm(`Delete "${d.name || d.title || "this client"}"? The photos stay in Drive.`)) return;
    setContent((c) => ({ ...c, deliveries: c.deliveries.filter((_, i) => i !== index) }));
    setDirty(true);
    setEditing(null);
  };

  if (authed === null) return <Shell><p className="admin-empty">Checking…</p></Shell>;
  if (!authed) return <Login onIn={() => setAuthed(true)} />;
  if (!content) return <Shell><p className="admin-empty">Loading clients…</p></Shell>;

  if (editing !== null) {
    const delivery = content.deliveries[editing];
    if (!delivery) { setEditing(null); return null; }
    return (
      <Shell>
        <Editor
          delivery={delivery}
          onChange={(patch) => update(editing, patch)}
          onBack={() => setEditing(null)}
          onSave={async () => { if (await save()) setEditing(null); }}
          onDelete={() => remove(editing)}
          msg={msg}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <Dashboard
        content={content} dirty={dirty} msg={msg}
        onSave={() => save()} onAdd={add} onEdit={setEditing} onRemove={remove}
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
          <h1>Client delivery</h1>
        </div>
        <a className="admin-viewsite" href="/" target="_blank" rel="noreferrer">View site ↗</a>
      </header>
      {isMock() && (
        <p className="admin-msg preview">
          Preview mode — demo data, nothing is saved.
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
        <label className="lbl" htmlFor="pw">Password</label>
        <input id="pw" type="password" value={pw} autoFocus
          onChange={(e) => setPw(e.target.value)} />
        <button className="btn" type="submit" disabled={busy || !pw}>
          {busy ? "Checking…" : "Sign in"}
        </button>
        {err && <p className="admin-msg bad">{err}</p>}
      </form>
    </Shell>
  );
}

/* ---------------- dashboard ---------------- */

function Dashboard({ content, dirty, msg, onSave, onAdd, onEdit, onRemove, onSignOut }) {
  const items = content.deliveries;
  const revoked = items.filter((d) => d.revoked).length;
  const drafts = items.filter((d) => !d.revoked && !d.code).length;
  const active = items.length - revoked - drafts;

  return (
    <>
      <p className="admin-summary">
        {items.length} client{items.length === 1 ? "" : "s"}
        {items.length ? ` — ${active} active, ${drafts} draft${drafts === 1 ? "" : "s"}, ${revoked} revoked` : ""}
      </p>

      <div className="admin-actions">
        <button className="btn" onClick={onSave} disabled={!dirty}>
          {dirty ? "Save changes" : "All changes saved"}
        </button>
        <button className="btn ghost" onClick={onSignOut}>Sign out</button>
      </div>

      {msg && <p className={`admin-msg ${msg.bad ? "bad" : ""}`}>{msg.text}</p>}

      <DeliveryList items={items} onAdd={onAdd} onEdit={onEdit} onRemove={onRemove} />
    </>
  );
}

function DeliveryList({ items, onAdd, onEdit, onRemove }) {
  return (
    <section className="admin-sec">
      <div className="admin-sec-head">
        <h2>Clients</h2>
        <button className="btn" onClick={onAdd}>+ New client</button>
      </div>

      {!items.length && (
        <p className="admin-empty">
          No clients yet — press “New client” to create the first delivery.
        </p>
      )}

      {items.map((d, i) => (
        <div className="admin-row" key={i}>
          <div className="admin-row-main">
            <strong>{d.name || d.title || <em className="dim">Untitled</em>}</strong>
            <div className="admin-row-meta">
              <span className={`status ${d.revoked ? "status-revoked" : d.code ? "status-active" : "status-draft"}`}>
                {d.revoked ? "Revoked" : d.code ? "Active" : "Draft"}
              </span>
              {d.code && <span className="admin-row-code">{d.code}</span>}
            </div>
          </div>
          <div className="admin-row-acts">
            <button className="btn small" onClick={() => onEdit(i)}>Edit</button>
            <button className="mini danger" onClick={() => onRemove(i)}
              aria-label={`Delete ${d.name || d.title || "client"}`}>
              <XIcon />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------------- editor ----------------
   Everything Viraj needs to hand a finished shoot over: which Drive
   folder, the code, the message to paste into WhatsApp, or an email
   sent straight from here.

   Sharing is done here rather than in Drive's own dialog, because that
   dialog is where the dangerous mistake lives — sharing a PARENT
   folder would expose every client inside it. This only ever touches
   the one folder id below. */
function Editor({ delivery, onChange, onBack, onSave, onDelete, msg }) {
  const [state, setState] = useState(null);      // { shared, name, count }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState("");
  const [picking, setPicking] = useState(false);
  const [mailing, setMailing] = useState(false);
  const [mailed, setMailed] = useState(false);

  const link = `${location.origin}/client/${delivery.code}`;
  const message =
    `Hi${delivery.name ? ` ${delivery.name}` : ""}, your photos from ${delivery.title || "the shoot"} are ready.\n\n` +
    `${link}\n\nCode: ${delivery.code}\n\n— ${P.photographer}`;

  const call = async (action) => {
    if (!delivery.folderId) { setErr("Pick the Drive folder that holds the finished photos"); return; }
    setBusy(true); setErr("");
    try {
      setState(await api("/api/share", { method: "POST", body: { folderId: delivery.folderId, action } }));
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
    if (!delivery.folderId) { setState(null); return; }
    let alive = true;
    api("/api/share", { method: "POST", body: { folderId: delivery.folderId, action: "check" } })
      .then((d) => alive && setState(d))
      .catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
  }, [delivery.folderId]);

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setErr("Couldn't copy — select the text and copy it by hand");
    }
  };

  const sendEmail = async () => {
    setMailing(true); setErr("");
    try {
      await api("/api/mail", {
        method: "POST",
        body: { to: delivery.email, subject: `Your photos — ${delivery.title || "the shoot"}`, text: message },
      });
      setMailed(true);
      setTimeout(() => setMailed(false), 2400);
    } catch (e) {
      setErr(e.message);
    } finally {
      setMailing(false);
    }
  };

  return (
    <>
      <div className="admin-actions">
        <button className="btn ghost" onClick={onBack}>← Back</button>
        <button className="btn primary" onClick={onSave}>Save client</button>
        <button className="btn danger" onClick={onDelete}>Delete</button>
      </div>
      {msg && <p className={`admin-msg ${msg.bad ? "bad" : ""}`}>{msg.text}</p>}

      <section className="admin-sec deliver">
        <div className="admin-sec-head">
          <div>
            <h2>{delivery.name || delivery.title || "New client"}</h2>
            <span className={`status ${state?.shared ? "status-active" : "status-draft"}`}>
              {state?.shared
                ? `Shared — ${state.count ?? "?"} photos`
                : "Not shared yet"}
            </span>
          </div>
          {state?.shared
            ? <button className="btn danger" onClick={() => call("revoke")} disabled={busy}>Revoke access</button>
            : <button className="btn primary" onClick={() => call("grant")} disabled={busy}>Share folder</button>}
        </div>

        <div className="admin-form">
          <Field label="Shoot title">
            <input value={delivery.title} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Client name">
            <input value={delivery.name} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>

          <Field label="Client email">
            <input type="email" value={delivery.email} placeholder="Optional"
              onChange={(e) => onChange({ email: e.target.value.trim() })} />
          </Field>

          <Field label="Access code" hint="Works until you revoke it.">
            <div className="admin-inline">
              <input value={delivery.code}
                onChange={(e) => onChange({ code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
              <button className="btn small" onClick={() => onChange({ code: makeCode(delivery.title) })}>
                {delivery.code ? "New" : "Generate"}
              </button>
            </div>
          </Field>

          {/* Not a <Field>: the manual-ID disclosure is its own control,
              and nesting a <details> inside a <label> would make clicking
              the summary also focus the label's input. */}
          <div className="admin-field wide">
            <span className="lbl">Delivery folder</span>
            <div className="admin-inline">
              <span className={`folder-name${state?.name || delivery.folderId ? "" : " none"}`}>
                {state?.name || delivery.folderId || "None chosen"}
              </span>
              <button className="btn small" onClick={() => setPicking(true)}>Choose folder</button>
            </div>
            <em>Pick the folder holding the finished photos — not a parent folder.</em>
            <details className="admin-folder-manual">
              <summary>Paste a folder ID instead</summary>
              <input value={delivery.folderId} placeholder="1a2b3c…"
                onChange={(e) => onChange({ folderId: e.target.value.trim() })} />
            </details>
          </div>

          <Field label="Note to the client" wide>
            <input value={delivery.note} placeholder="Optional — shown above their download button"
              onChange={(e) => onChange({ note: e.target.value })} />
          </Field>
        </div>

        {err && <p className="admin-msg bad">{err}</p>}

        <div className="deliver-send">
          <div className="lbl">Send this</div>
          <pre>{message}</pre>
          <div className="admin-row-acts">
            <button className="btn" onClick={() => copy(message, "message")} disabled={!delivery.code}>
              {copied === "message" ? "Copied ✓" : "Copy message"}
            </button>
            <button className="btn ghost" onClick={() => copy(link, "link")} disabled={!delivery.code}>
              {copied === "link" ? "Copied ✓" : "Copy link only"}
            </button>
            <button className="btn ghost" onClick={sendEmail} disabled={!delivery.email || !delivery.code || mailing}>
              {mailed ? "Sent ✓" : mailing ? "Sending…" : "Email this to them"}
            </button>
          </div>
          <p className="deliver-hint">
            Save after sharing, or the code won't be live.
          </p>
        </div>

        {picking && (
          <FolderPicker
            onClose={() => setPicking(false)}
            onDone={({ id }) => { onChange({ folderId: id }); setPicking(false); }}
          />
        )}
      </section>
    </>
  );
}

/* Hints are deliberately rare: one under a field the user could get
   wrong (the folder, the code), none under the self-evident ones. A
   hint under every field is noise that trains people to skip all of
   them, including the one that matters. */
function Field({ label, hint, children, wide }) {
  return (
    <label className={`admin-field${wide ? " wide" : ""}`}>
      <span className="lbl">{label}</span>
      {children}
      {hint && <em>{hint}</em>}
    </label>
  );
}

/* Drive folder browser + creator, for picking (or making) the ONE folder
   a client delivery points at. Breadcrumb drill-down plus an inline
   create form. "Use this folder" always refers to whatever level is
   currently open, so picking an existing folder and picking one just
   created both end the same way. */
function FolderPicker({ onClose, onDone }) {
  const [path, setPath] = useState([]); // [{id, name}, ...] — empty = root
  const [folders, setFolders] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const boxRef = useRef(null);

  const current = path[path.length - 1] || null;

  useEffect(() => {
    setBusy(true);
    const url = current ? `/api/library?folder=${encodeURIComponent(current.id)}` : "/api/library";
    api(url)
      .then((d) => { setFolders(d.folders); setErr(""); })
      .catch((e) => setErr(e.message))
      .finally(() => setBusy(false));
  }, [current]);

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

  const create = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true); setErr("");
    try {
      const { folder } = await api("/api/library", {
        method: "POST",
        body: { parentId: current?.id, name },
      });
      setFolders((f) => [...f, folder]);
      setNewName("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-picker" role="dialog" aria-modal="true" aria-label="Choose or create a Drive folder">
      <div className="admin-picker-in" ref={boxRef}>
        <div className="admin-picker-top">
          <div>
            <strong>Choose or create a folder</strong>
          </div>
          <div className="admin-row-acts">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" disabled={!current}
              onClick={() => onDone({ id: current.id, name: current.name })}>
              Use this folder
            </button>
          </div>
        </div>

        <div className="admin-folder-body">
          <div className="admin-crumbs">
            <button className="crumb" onClick={() => setPath([])}>Root</button>
            {path.map((p, i) => (
              <button key={p.id} className="crumb" onClick={() => setPath(path.slice(0, i + 1))}>
                {p.name}
              </button>
            ))}
          </div>

          {busy && <p className="admin-empty">Reading Drive…</p>}
          {err && <p className="admin-msg bad">{err}</p>}
          {!busy && !err && !folders.length && (
            <p className="admin-empty">No subfolders here yet.</p>
          )}

          {!busy && folders.map((f) => (
            <div className="admin-row" key={f.id}>
              <div className="admin-row-main"><strong>{f.name}</strong></div>
              <div className="admin-row-acts">
                <button className="btn small" onClick={() => setPath([...path, f])}>Open</button>
              </div>
            </div>
          ))}

          <div className="admin-folder-new">
            <input value={newName} placeholder="New folder name"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") create(); }} />
            <button className="btn small" onClick={create} disabled={creating || !newName.trim()}>
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
