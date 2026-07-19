/* POST /api/publish → kicks a Vercel deploy hook.

   Saving writes content.json to Drive; publishing rebuilds the site so
   the new photos get downloaded, resized to WebP and baked in. That is
   why the public pages stay fast static files with no runtime Drive
   calls — the cost is a ~1 minute wait after pressing Publish.        */

import { requireAuth } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return res.status(500).json({
      error: "No deploy hook configured. Add VERCEL_DEPLOY_HOOK_URL in Vercel → Settings → Git → Deploy Hooks.",
    });
  }

  try {
    const r = await fetch(hook, { method: "POST" });
    if (!r.ok) throw new Error(`Deploy hook replied ${r.status}`);
    return res.status(200).json({ started: true, at: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Could not start the rebuild" });
  }
}
