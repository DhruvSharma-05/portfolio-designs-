/* ==================================================================
   Per-IP rate limiting for the PUBLIC endpoints (api/client.js,
   api/download.js). In-memory, per serverless instance — a speed bump
   rather than a guarantee, since serverless spreads requests across
   instances and recycles them. The real protection on /api/client is
   code entropy; on /api/download it additionally bounds how much
   Drive bandwidth a leaked link can burn per minute.

   Each caller should hold its OWN limiter (call makeLimiter() once at
   module scope) rather than sharing one Map — guessing codes and
   re-downloading a valid one are different concerns with different
   abuse profiles.
   ================================================================== */

export function makeLimiter({ windowMs = 60_000, max = 10 } = {}) {
  const hits = new Map();
  return (ip) => {
    const now = Date.now();
    const seen = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    seen.push(now);
    hits.set(ip, seen);
    if (hits.size > 5000) hits.clear(); // crude ceiling on memory
    return seen.length > max;
  };
}

export const clientIp = (req) =>
  (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
  req.socket?.remoteAddress || "unknown";
