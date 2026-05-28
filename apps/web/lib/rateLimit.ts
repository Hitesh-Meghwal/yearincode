// Lightweight in-memory rate limiter for the public (no-auth) generate path.
//
// Caveat: this is per-serverless-instance, so on Vercel it's a soft limit, not
// a hard global one — a determined attacker hitting many cold instances can
// exceed it. It's here to stop casual abuse (someone looping usernames) and to
// protect the shared GitHub app-token quota. For a hard global limit you'd
// back this with Postgres or Upstash; that's a post-launch upgrade.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so the Map doesn't grow unbounded.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Fixed-window limiter. Allows `limit` requests per `windowMs` per key.
 * Default: 8 requests / 10 minutes — generous for a human picking a few
 * years, tight enough to stop a script.
 */
export function rateLimit(
  key: string,
  limit = 8,
  windowMs = 10 * 60 * 1000,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Best-effort client IP from the request headers. Vercel sets
 * x-forwarded-for; we take the first hop. Falls back to a constant so the
 * limiter still works (globally) if no IP is available.
 */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
