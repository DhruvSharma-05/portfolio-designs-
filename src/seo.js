import { useEffect } from "react";

/* Per-route <title> + meta description for this client-rendered SPA.
   Google runs JS and indexes what this sets, so each page can rank on
   its own title/description instead of inheriting the homepage's.
   Updates the existing description tag in place (no duplicates); the
   static index.html tags remain the default for no-JS scrapers. */

const BRAND = "Crafted & Captured";

export function useSeo(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND}` : `${BRAND} · Photography by Viraj Mehta`;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [title, description]);
}
