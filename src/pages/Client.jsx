import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { P } from "../data.js";
import { TLink } from "../ui.jsx";

/* ==================================================================
   CLIENT AREA — where a paying client picks up a finished shoot.

   Two ways in, same page:
     /client            → they type the code Viraj sent
     /client/<code>     → the code is in the link, so it just opens

   Deliberately the plainest page on the site. A client arriving here
   wants their photos, not an experience: one field, then one button.
   ================================================================== */

const page = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Client() {
  const { code: urlCode } = useParams();
  const [code, setCode] = useState(urlCode || "");
  const [gallery, setGallery] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const lookup = useCallback(async (value) => {
    const clean = String(value || "").trim();
    if (!clean) return;
    setBusy(true); setErr(""); setGallery(null);
    try {
      const res = await fetch(`/api/client?code=${encodeURIComponent(clean)}`);
      const isJson = (res.headers.get("content-type") || "").includes("application/json");
      if (!isJson) {
        /* `npm run dev` has no functions behind it — show the finished
           state with stand-in details so the page can be reviewed
           without Drive. Dev builds only. */
        if (import.meta.env.DEV) {
          setGallery({
            client: "North Café", title: "Autumn menu shoot",
            note: "Full set, edited. Shout if you need any in a different crop.",
            count: 24, url: "https://drive.google.com/drive/folders/preview",
            preview: true,
          });
          return;
        }
        throw new Error("The gallery service isn't running. Let Viraj know.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "That code didn't work");
      setGallery(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }, []);

  /* a link with the code in it opens straight to the photos */
  useEffect(() => {
    document.title = `Client area — ${P.name}`;
    if (urlCode) lookup(urlCode);
  }, [urlCode, lookup]);

  return (
    <motion.main id="main" className="client wrap" variants={page} initial="initial" animate="animate">
      <div className="mono client-kicker">{P.name} — Client area</div>

      <AnimatePresence mode="wait">
        {gallery ? (
          <motion.section key="found" className="client-card"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}>
            {gallery.preview && (
              <p className="client-err mono" style={{ marginBottom: 20 }}>
                Preview mode — stand-in details, no Drive connected.
              </p>
            )}
            <div className="mono">Your photos are ready</div>
            <h1>{gallery.client || gallery.title}</h1>
            {gallery.title && gallery.client && <p className="client-shoot">{gallery.title}</p>}

            {gallery.note && <p className="client-note">{gallery.note}</p>}

            <dl className="client-facts">
              {gallery.count != null && (
                <div><dt className="mono">Photos</dt><dd>{gallery.count}</dd></div>
              )}
              <div><dt className="mono">Format</dt><dd>Full resolution</dd></div>
            </dl>

            <a className="client-dl" href={gallery.url} target="_blank" rel="noreferrer noopener">
              Download your photos <span className="arrow">↗</span>
            </a>

            <p className="client-help mono">
              Opens Google Drive. Use the Download button there to save them all at once —
              easiest on a computer. No account needed.
            </p>
          </motion.section>
        ) : (
          <motion.section key="ask" className="client-card"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <h1>Collect your shoot</h1>
            <p className="client-lead">
              Enter the code {P.photographer} sent you and your photos will be ready to download.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); lookup(code); }}>
              <label className="mono" htmlFor="code">Access code</label>
              <input id="code" value={code} autoFocus autoCapitalize="off" autoCorrect="off"
                spellCheck="false" placeholder="e.g. north-cafe-7q4m2x"
                onChange={(e) => setCode(e.target.value)} />
              <button className="client-dl" type="submit" disabled={busy || !code.trim()}>
                {busy ? "Checking…" : "Find my photos"}
              </button>
            </form>

            {err && <p className="client-err mono">{err}</p>}

            <p className="client-help mono">
              Lost your code? Email <a href={`mailto:${P.email}`}>{P.email}</a>.
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="client-foot">
        <TLink to="/" className="mono back"><span className="arrow">←</span> Back to the site</TLink>
      </div>
    </motion.main>
  );
}
