// Small in-memory throttle. Good enough for a personal project on a single instance.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function throttle(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
