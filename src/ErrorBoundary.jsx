import { Component } from "react";

/* ==================================================================
   APP-LEVEL ERROR BOUNDARY — the last line of defence.

   Wraps the routed content in App.jsx. Catches render-time errors from
   any page, INCLUDING a lazy chunk (HeroCanvas/DistortImage/Admin/
   Client/etc.) that fails to load — a rejected React.lazy() import
   throws during render, which a boundary above its <Suspense> catches
   just like any other render error. A hard reload is the recovery
   path: it re-fetches a fresh index.html/asset manifest, which is
   exactly what's needed if the failure was a stale chunk URL after a
   redeploy.
   ================================================================== */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="notfound wrap">
        <div className="mono">Something went wrong</div>
        <h1 className="display" style={{ marginTop: 14 }}>That didn't load right.</h1>
        <p className="client-lead" style={{ margin: "18px auto 0" }}>
          A reload usually fixes it.
        </p>
        <button className="extlink" style={{ marginTop: 30 }} onClick={() => location.reload()}>
          Reload the page
        </button>
      </main>
    );
  }
}
