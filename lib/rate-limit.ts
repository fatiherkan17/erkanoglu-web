type RateLimitEntry = { count: number; resetAt: number };

const buckets = new Map<string, RateLimitEntry>();
const MAX_BUCKETS = 10_000;

export type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
};

/**
 * Best-effort per-instance limiter for immediate abuse reduction.
 * Serverless instances do not share memory; use a shared store or edge/WAF
 * rate limit for a hard production-wide guarantee.
 */
export function checkRateLimit(
  request: Request,
  keyPrefix: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("x-real-ip")?.trim() || forwarded || "unknown";
  const key = `${keyPrefix}:${ip.slice(0, 100)}`;

  for (const [bucketKey, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(bucketKey);
  }

  let entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey) buckets.delete(oldestKey);
    }
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(key, entry);
  }

  if (entry.count >= limit) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { limited: false, retryAfterSeconds: 0 };
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return Response.json(
    { success: false, message: "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    },
  );
}
