import { P } from "./data.js";
import { TLink, Reveal } from "./ui.jsx";

/* The nav-bar links, repeated in the footer's "Navigate" column (kept in
   step with App.jsx's NAV by hand — it's only four entries). */
const FOOT_NAV = [
  { to: "/", label: "Work" },
  { to: "/photography", label: "Photography" },
  { to: "/design", label: "Design" },
  { to: "/about", label: "About" },
];

/* ==================================================================
   SiteFooter — one shared, always-dark footer rendered by the shell on
   every public page. Four columns (Contact · Built with · Elsewhere ·
   Navigate) over a copyright / client-area base line. The old "Colophon"
   column was swapped for the site navigation.
   ================================================================== */
export default function SiteFooter() {
  return (
    <footer className="site-foot invert" role="contentinfo">
      <div className="wrap">
        <Reveal as="dl" className="colophon">
          <div>
            <dt className="mono">Contact</dt>
            <dd>
              <a href={`mailto:${P.email}`}>{P.email}</a><br />
              <a href={`mailto:${P.email2}`}>{P.email2}</a><br />
              <a href={`tel:${P.phone.replace(/[^+\d]/g, "")}`}>{P.phone}</a>
            </dd>
          </div>
          <div>
            <dt className="mono">Built with</dt>
            <dd>Figma · React · Framer<br />Capture One · DaVinci</dd>
          </div>
          <div>
            <dt className="mono">Elsewhere</dt>
            <dd>
              {P.socials.map((s) => (
                <span key={s.href} style={{ display: "block" }}>
                  <a href={s.href} target="_blank" rel="noreferrer">
                    {s.k} — {s.v}
                  </a>
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="mono">Navigate</dt>
            <dd className="foot-nav">
              {FOOT_NAV.map((n) => (
                <TLink key={n.to} to={n.to}>{n.label}</TLink>
              ))}
            </dd>
          </div>
        </Reveal>

        <hr className="rule" style={{ marginTop: 44 }} />
        <div className="foot-base">
          <span className="mono">© 2026 {P.name}</span>
          <span className="mono">Booking 2026 — {P.city}, {P.region}</span>
        </div>
      </div>
    </footer>
  );
}
