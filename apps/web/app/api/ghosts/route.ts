import { NextResponse } from "next/server";
import { getFollowDiff, GhostsError } from "@/lib/github/ghosts";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
// Mega-accounts walk many pages; give it room without risking a hung request.
export const maxDuration = 30;

// Follow-back lookups are cheap and read-only, so the budget is more generous
// than the wrap path (8/10min): a human comparing a few accounts won't hit it,
// but a script looping handles will.
const GHOSTS_RATE_LIMIT = 20;
const GHOSTS_RATE_WINDOW_MS = 10 * 60 * 1000;

/**
 * GET /api/ghosts?u=<handle>
 *
 * Returns the public follow-back diff for a GitHub user. Routed through the
 * server so it uses GITHUB_APP_TOKEN's 5,000 req/hr budget rather than the
 * 60/hr anonymous ceiling. No auth, no DB, nothing stored — it only reads
 * public follower/following lists.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("u") ?? "";

  const ip = clientIp(request);
  const limit = rateLimit(
    `ghosts:${ip}`,
    GHOSTS_RATE_LIMIT,
    GHOSTS_RATE_WINDOW_MS,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate-limit", retryAfter: limit.retryAfterSeconds },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  const token = process.env.GITHUB_APP_TOKEN ?? "";

  try {
    const diff = await getFollowDiff(username, token);
    return NextResponse.json(diff, {
      // Public data; let the CDN cache identical lookups briefly to spare the
      // shared GitHub budget. Lists do change, so keep it short.
      headers: { "cache-control": "public, max-age=60, s-maxage=300" },
    });
  } catch (err) {
    if (err instanceof GhostsError) {
      // not-found is a normal user outcome (404); rate-limit maps to 429;
      // config is a 500 (server misconfigured); everything else is 502.
      const status =
        err.code === "not-found"
          ? 404
          : err.code === "rate-limit"
            ? 429
            : err.code === "config"
              ? 500
              : 502;
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status },
      );
    }
    console.error("[api/ghosts] unexpected error", err);
    return NextResponse.json(
      { error: "unknown", message: "Something went wrong." },
      { status: 500 },
    );
  }
}
