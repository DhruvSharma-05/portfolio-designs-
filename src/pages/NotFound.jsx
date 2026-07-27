import { motion } from "motion/react";
import { TLink } from "../ui.jsx";

/* ==================================================================
   404 — catch-all for any URL that isn't a real route. Kept as plain
   as the client-area page: one line, one way back.
   ================================================================== */

const page = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function NotFound() {
  return (
    <motion.main id="main" className="notfound wrap" variants={page} initial="initial" animate="animate">
      <div className="mono">404</div>
      <h1 className="display" style={{ marginTop: 14 }}>Nothing here.</h1>
      <p className="client-lead" style={{ margin: "18px auto 0" }}>
        That page doesn't exist, or it moved.
      </p>
      <TLink to="/" className="extlink" style={{ marginTop: 30 }}>
        Back to the site <span className="arrow">→</span>
      </TLink>
    </motion.main>
  );
}
