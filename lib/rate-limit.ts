// In-memory sliding window. Good enough for a prototype on one instance;
// swap for Upstash/Redis when running multiple serverless instances.
const hits = new Map<string, { count: number; resetAt: number }>();

export function allow(key: string, limit = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    if (hits.size > 1000) {
      for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
    }
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
