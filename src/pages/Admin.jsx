import { useState, useEffect, useCallback, useRef } from "react";
import { P } from "../data.js";
import { isMock, enableMock, mockApi } from "./adminMock.js";

/* ==================================================================
   ADMIN — client-delivery control room.

   Viraj shoots, edits and uploads to Drive exactly as before. Here he
   hands a finished shoot over: create (or reuse) the Drive folder,
   share it, and send the client their code — by WhatsApp copy-paste or
   straight email. That's the whole job; there is no project/portfolio
   editor here (public Work/Gallery/Portrait photos come from Contentful,
   synced at build time — see CLAUDE.md).

   Client-delivery lookups (api/client.js, api/download.js) read Drive
   LIVE at request time, not from the static build, so nothing here ever
   needs a rebuild to take effect.

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

const blankClientEntry = () => ({
  title: "", name: "", email: "", folderId: "", code: "", note: "", revoked: false,
});

export default function Admin() {
  const [authed, setAuthed] = useState(null);   // null = still checking
  const [clients, setClients] = useState(null);
  const [editing, setEditing] = useState(null); // index into clients, or null
  const [msg, setMsg] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    document.title = `Admin — ${P.name}`;
    openSession().then((d) => setAuthed(d.authed)).catch(() => setAuthed(false));
  }, []);

  const load = useCallback(async () => {
    try {
      const content = await api("/api/content");
      setClients(content.clients || []);
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

  const save = async (next = clients) => {
    try {
      const saved = await api("/api/content", { method: "PUT", body: { clients: next } });
      setClients(saved.clients || []);
      setDirty(false);
      setMsg({ text: "Saved." });
      return true;
    } catch (e) {
      setMsg({ bad: true, text: e.message });
      return false;
    }
  };

  const update = (index, patch) => {
    setClients((list) => {
      const next = [...list];
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setDirty(true);
  };

  const add = () => {
    setClients((list) => [...list, { ...blankClientEntry(), code: makeCode("shoot") }]);
    setDirty(true);
    setEditing(clients.length);
  };

  const remove = (index) => {
    const c = clients[index];
    if (!confirm(`Delete "${c.name || c.title || "this client"}"? The photos stay in Drive.`)) return;
    setClients((list) => list.filter((_, i) => i !== index));
    setDirty(true);
    setEditing(null);
  };

  if (authed === null) return <Shell><p className="mono">Checking…</p></Shell>;
  if (!authed) return <Login onIn={() => setAuthed(true)} />;
  if (!clients) return <Shell><p className="mono">Loading clients…</p></Shell>;

  if (editing !== null) {
    const client = clients[editing];
    if (!client) { setEditing(null); return null; }
    return (
      <Shell>
        <ClientEditor
          client={client}
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
      <ClientList
        clients={clients} dirty={dirty} msg={msg}
        onSave={() => save()}
        onAdd={add} onEdit={setEditing} onRemove={remove}
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
          Preview mode — no Drive connected. The clients below are fake and
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

/* ---------------- client list ---------------- */

function ClientList({ clients, dirty, msg, onSave, onAdd, onEdit, onRemove, onSignOut }) {
  const active = clients.filter((c) => !c.revoked && c.folderId).length;

  return (
    <>
      <div className="admin-stats">
        <Stat n={clients.length} k="Clients" />
        <Stat n={active} k="Active deliveries" />
        <Stat n={clients.filter((c) => c.revoked).length} k="Revoked" />
      </div>

      <div className="admin-actions">
        <button className="btn" onClick={onSave} disabled={!dirty}>
          {dirty ? "Save changes" : "All changes saved"}
        </button>
        <button className="btn ghost" onClick={onSignOut}>Sign out</button>
      </div>

      {msg && <p className={`admin-msg mono ${msg.bad ? "bad" : ""}`}>{msg.text}</p>}

      <section className="admin-sec">
        <div className="admin-sec-head">
          <div>
            <h2>Clients</h2>
            <span className="mono">Photo deliveries</span>
          </div>
          <button className="btn" onClick={onAdd}>+ New client</button>
        </div>

        {!clients.length && (
          <p className="admin-empty mono">Nothing here yet — press "New client".</p>
        )}

        {clients.map((c, i) => (
          <div className="admin-row" key={i}>
            <span className="mono num">{String(i + 1).padStart(2, "0")}</span>
            <div className="admin-row-main">
              <strong>{c.name || <em className="dim">Untitled</em>}</strong>
              <span className="mono">
                {c.title || "No shoot title"} — {c.code || "no code"}{c.revoked ? " — revoked" : ""}
              </span>
            </div>
            <div className="admin-row-acts">
              <button className="btn small" onClick={() => onEdit(i)}>Edit</button>
              <button className="mini danger" onClick={() => onRemove(i)} aria-label="Delete">✕</button>
            </div>
          </div>
        ))}
      </section>
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

function Field({ label, hint, children, wide }) {
  return (
    <label className={`admin-field${wide ? " wide" : ""}`}>
      <span className="mono">{label}</span>
      {children}
      {hint && <em>{hint}</em>}
    </label>
  );
}

/* Drive folder browser + creator, for picking (or making) the ONE folder
   a client delivery points at. "Use this folder" always refers to
   whatever level is currently open, so picking an existing folder and
   picking one just created both end the same way. */
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
          <div className="admin-crumbs mono">
            <button className="crumb" onClick={() => setPath([])}>Root</button>
            {path.map((p, i) => (
              <button key={p.id} className="crumb" onClick={() => setPath(path.slice(0, i + 1))}>
                {p.name}
              </button>
            ))}
          </div>

          {busy && <p className="mono">Reading Drive…</p>}
          {err && <p className="admin-msg bad mono">{err}</p>}
          {!busy && !err && !folders.length && (
            <p className="admin-empty mono">No subfolders here yet.</p>
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

/* ---------------- client editor ----------------
   Everything Viraj needs to hand a finished shoot over: which Drive
   folder, the code, the message to paste into WhatsApp, or an email
   sent straight from here.

   Sharing is done here rather than in Drive's own dialog, because that
   dialog is where the dangerous mistake lives — sharing a PARENT
   folder would expose every client inside it. This only ever touches
   the one folder id below. */
function ClientEditor({ client, onChange, onBack, onSave, onDelete, msg }) {
  const [state, setState] = useState(null);      // { shared, name, count }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState("");
  const [picking, setPicking] = useState(false);
  const [mailing, setMailing] = useState(false);
  const [mailed, setMailed] = useState(false);

  const link = `${location.origin}/client/${client.code}`;
  const message =
    `Hi${client.name ? ` ${client.name}` : ""}, your photos from ${client.title || "the shoot"} are ready.\n\n` +
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

  const sendEmail = async () => {
    setMailing(true); setErr("");
    try {
      await api("/api/mail", {
        method: "POST",
        body: { to: client.email, subject: `Your photos — ${client.title || "the shoot"}`, text: message },
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
      {msg && <p className={`admin-msg mono ${msg.bad ? "bad" : ""}`}>{msg.text}</p>}

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
          <Field label="Shoot title" hint={'Shown to the client, e.g. "Autumn menu shoot"'}>
            <input value={client.title} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>

          <Field label="Client name" hint="Shown to them on the download page">
            <input value={client.name} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>

          <Field label="Client email" hint="Optional — lets you email the code instead of just copying it">
            <input type="email" value={client.email} placeholder="client@example.com"
              onChange={(e) => onChange({ email: e.target.value.trim() })} />
          </Field>

          <Field label="Access code" hint="They type this. Works until you revoke it.">
            <div className="admin-inline">
              <input value={client.code}
                onChange={(e) => onChange({ code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
              <button className="btn small" onClick={() => onChange({ code: makeCode(client.title) })}>New</button>
            </div>
          </Field>

          <Field label="Delivery folder" wide
            hint="The folder holding the finished photos — NOT a parent folder.">
            <div className="admin-inline">
              <span className="mono">
                {state?.name || client.folderId || "No folder chosen yet"}
              </span>
              <button className="btn small" onClick={() => setPicking(true)}>Choose / create folder</button>
            </div>
            <details className="admin-folder-manual">
              <summary className="mono">Paste a folder ID directly instead</summary>
              <input value={client.folderId} placeholder="1a2b3c…"
                onChange={(e) => onChange({ folderId: e.target.value.trim() })} />
            </details>
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
            <button className="btn ghost" onClick={sendEmail} disabled={!client.email || mailing}>
              {mailed ? "Sent ✓" : mailing ? "Sending…" : "Email this to them"}
            </button>
          </div>
          <p className="mono deliver-hint">
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
