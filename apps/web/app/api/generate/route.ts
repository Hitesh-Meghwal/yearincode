import { NextResponse } from "next/server";
import { aggregateAllTimeStats, aggregateWrappedStats } from "@/lib/aggregator";
import { GitHubApiError } from "@/lib/github/client";
import {
  fetchWrappedData,
  fetchWrappedDataAllTime,
} from "@/lib/github/fetchCommits";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { createClient, getUserSafe } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import type { WrappedStats } from "@/lib/types";

export const runtime = "nodejs";
// Generation can take up to ~60s for power users.
export const maxDuration = 60;

// GitHub launched in April 2008; nothing older than that is meaningful.
const GITHUB_FOUNDED_YEAR = 2008;

// GitHub usernames: 1–39 chars, alphanumeric or single hyphens, no leading/
// trailing hyphen. We validate to fail fast (the GraphQL var is already
// injection-safe, this is just a clean 400 instead of a wasted API call).
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

// Loose sanity check that a pasted PAT looks like a GitHub token. We don't
// hard-fail on this — GitHub will reject a bad token anyway — but it catches
// obvious paste mistakes.
const GITHUB_TOKEN_RE = /^(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})$/;

// How the caller is asking us to generate:
//   - authenticated: logged-in user, uses their stored token (private counts
//     if their profile opts in), row is owned (user_id set).
//   - username: no auth, app token fetches the target's PUBLIC data, row is
//     unclaimed (user_id null).
//   - pat: caller pasted their own token, used once and never stored, fetches
//     the token owner's data (can include private), row is unclaimed.
type GenerateMode =
  | { kind: "authenticated" }
  | { kind: "username"; username: string }
  | { kind: "pat"; token: string; username: string | null };

type GenerateOk = {
  wrappedId: string;
  redirectUrl: string;
  stats: WrappedStats;
};

type GenerateErr = {
  error: string;
  status?: number;
  message?: string;
  detail?: string;
  hint?: string;
  retryAfter?: number;
};

/**
 * Calendar-year date range. For the current year we cap `to` at "now" so we
 * don't ask GitHub for dates in the future. For past years we use the full
 * Jan 1 → Dec 31 window.
 */
function dateRangeForYear(year: number): { from: Date; to: Date } {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const to =
    year >= currentYear
      ? now
      : new Date(Date.UTC(year, 11, 31, 23, 59, 59));
  return { from, to };
}

function parseYearFromBody(body: unknown): number | null {
  if (
    body &&
    typeof body === "object" &&
    "year" in body &&
    typeof (body as { year: unknown }).year === "number"
  ) {
    return (body as { year: number }).year;
  }
  return null;
}

function validateYear(year: number): { ok: true } | { ok: false; reason: string } {
  if (!Number.isInteger(year)) return { ok: false, reason: "not_integer" };
  const current = new Date().getUTCFullYear();
  if (year < GITHUB_FOUNDED_YEAR) return { ok: false, reason: "before_github" };
  if (year > current) return { ok: false, reason: "future_year" };
  return { ok: true };
}

async function runGeneration(
  year: number,
  mode: GenerateMode,
  // When true, ignore `year` and generate the lifetime ("Since Day One") wrap:
  // loop join-date → now, store with the sentinel year 0, redirect to /all.
  allTime: boolean,
): Promise<
  | { ok: true; payload: GenerateOk }
  | { ok: false; status: number; payload: GenerateErr }
> {
  const supabase = await createClient();

  // Resolve: which token to fetch with, which username to target (undefined =
  // the token owner's own data), which user_id owns the row, and whether to
  // write with the service-role client (bypassing RLS for unclaimed rows).
  let fetchToken: string;
  let targetUsername: string | undefined;
  let ownerUserId: string | null;
  let writeWithServiceRole: boolean;

  if (mode.kind === "authenticated") {
    const user = await getUserSafe(supabase);
    if (!user) {
      return { ok: false, status: 401, payload: { error: "not_authenticated" } };
    }
    const svc = createServiceRoleClient();
    const { data: tokenRow, error: tokenError } = await svc
      .from("user_github_tokens")
      .select("access_token")
      .eq("user_id", user.id)
      .maybeSingle();
    if (tokenError) {
      console.error("[api/generate] token lookup failed", tokenError);
      return {
        ok: false,
        status: 500,
        payload: { error: "token_lookup_failed", message: tokenError.message },
      };
    }
    const providerToken: string | undefined = tokenRow?.access_token;
    if (!providerToken) {
      return {
        ok: false,
        status: 412,
        payload: {
          error: "missing_github_token",
          hint:
            "Sign out and back in. The auth flow captures and stores your GitHub token on sign-in. If you see this after re-signing in, the user_github_tokens migration (0004) may not be applied.",
        },
      };
    }
    fetchToken = providerToken;
    targetUsername = undefined; // viewer = the logged-in user
    ownerUserId = user.id;
    writeWithServiceRole = false; // RLS lets the user write their own row
  } else if (mode.kind === "username") {
    const appToken = process.env.GITHUB_APP_TOKEN;
    if (!appToken) {
      console.error("[api/generate] GITHUB_APP_TOKEN not configured");
      return {
        ok: false,
        status: 500,
        payload: {
          error: "app_token_missing",
          hint:
            "Username mode needs GITHUB_APP_TOKEN set on the server (a read-only public PAT). Add it to the env and redeploy.",
        },
      };
    }
    fetchToken = appToken;
    targetUsername = mode.username;
    ownerUserId = null; // unclaimed
    writeWithServiceRole = true;
  } else {
    // pat mode: use the pasted token once, never store it. Fetch the token
    // owner's own data (viewer) — a PAT can only see what its owner can see,
    // so this is inherently abuse-proof regardless of the typed username.
    fetchToken = mode.token;
    targetUsername = undefined;
    ownerUserId = null; // unclaimed
    writeWithServiceRole = true;
  }

  const { from, to } = dateRangeForYear(year);

  let stats: WrappedStats;
  try {
    if (allTime) {
      // Lifetime path: loop year-by-year (GitHub caps the contributions
      // connection at a 1-year span) then aggregate over the whole career.
      const now = new Date();
      const { result, accountCreatedYear } = await fetchWrappedDataAllTime(
        fetchToken,
        targetUsername,
      );
      stats = aggregateAllTimeStats(result, accountCreatedYear, now);
    } else {
      const fetchResult = await fetchWrappedData(
        fetchToken,
        from,
        to,
        targetUsername,
      );
      stats = aggregateWrappedStats(fetchResult, { from, to });
    }
  } catch (err) {
    if (err instanceof GitHubApiError) {
      console.error("[api/generate] GitHub API error", err);
      const status = err.status === 401 ? 401 : err.status === 403 ? 403 : 502;
      return {
        ok: false,
        status,
        payload: {
          error: "github_api_error",
          status: err.status,
          message: err.message,
          retryAfter: err.retryAfterSeconds,
        },
      };
    }
    console.error("[api/generate] unexpected error", err);
    return {
      ok: false,
      status: 500,
      payload: {
        error: "internal_error",
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }

  // 0-commit years are usually "user wasn't active that year". Surface a
  // friendly error so the year picker can show "no activity" instead of
  // generating an empty wrapped.
  if (stats.totalCommits === 0) {
    return {
      ok: false,
      status: 422,
      payload: {
        error: "no_commits",
        hint: allTime
          ? "No GitHub commits found for this account."
          : `No GitHub commits found for ${year}. Try a different year.`,
      },
    };
  }

  // For yearly wraps, force stats.year to match the requested year (the
  // aggregator derives it from the `to` date, which is already correct, but
  // being explicit is safer). All-time wraps keep the sentinel year 0 set by
  // aggregateAllTimeStats.
  if (!allTime) stats.year = year;

  // Share URL slug: all-time uses `/all` (DB year 0), yearly uses the year.
  const redirectUrl = allTime
    ? `/u/${stats.username}/all`
    : `/u/${stats.username}/${stats.year}`;

  // Pick the write client: authed users write their own row through RLS;
  // anonymous (username / pat) writes go through the service role since the
  // row has no user_id and RLS would otherwise reject it.
  const svc = createServiceRoleClient();
  const writeClient = writeWithServiceRole ? svc : supabase;

  // Ownership guard for anonymous writes: never overwrite a wrap that a
  // signed-in user has already claimed. If a claimed row exists, return its
  // share URL instead of regenerating over it.
  if (writeWithServiceRole) {
    const { data: existing } = await svc
      .from("wrapped_reports")
      .select("id, user_id")
      .eq("github_username", stats.username)
      .eq("year", stats.year)
      .maybeSingle();
    if (existing && existing.user_id) {
      return {
        ok: true,
        payload: {
          wrappedId: existing.id as string,
          redirectUrl,
          stats,
        },
      };
    }
  }

  const { data: row, error: dbError } = await writeClient
    .from("wrapped_reports")
    .upsert(
      {
        user_id: ownerUserId,
        github_username: stats.username,
        year: stats.year,
        stats_json: stats,
        is_public: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "github_username,year" },
    )
    .select("id")
    .single();

  if (dbError || !row) {
    console.error("[api/generate] DB upsert failed", dbError);
    return {
      ok: false,
      status: 500,
      payload: {
        error: "db_upsert_failed",
        message: dbError?.message ?? "unknown",
      },
    };
  }

  return {
    ok: true,
    payload: {
      wrappedId: row.id as string,
      redirectUrl,
      stats,
    },
  };
}

function strField(body: unknown, key: string): string | null {
  if (body && typeof body === "object" && key in body) {
    const v = (body as Record<string, unknown>)[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

/**
 * Detect an all-time ("Since Day One") request: `year: "all"` (string) or an
 * explicit `allTime: true` flag in the body, or `?year=all` in the URL. The
 * year value is irrelevant for all-time — it stores as the sentinel 0.
 */
function isAllTimeRequest(body: unknown, urlYear: string | null): boolean {
  if (urlYear === "all") return true;
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (b.year === "all") return true;
    if (b.allTime === true) return true;
  }
  return false;
}

/**
 * Parse year + generation mode from the request body. Mode precedence:
 *   token present  → pat
 *   username present → username
 *   neither        → authenticated
 */
function parseRequest(
  body: unknown,
  urlYear: string | null,
):
  | { ok: true; year: number; allTime: boolean; mode: GenerateMode }
  | { ok: false; error: string } {
  const allTime = isAllTimeRequest(body, urlYear);

  let year = new Date().getUTCFullYear();
  const bodyYear = parseYearFromBody(body);
  if (bodyYear !== null) year = bodyYear;
  else if (urlYear) year = Number.parseInt(urlYear, 10);

  // For all-time the year is a placeholder (stored as 0), so skip validation —
  // a `?year=all` URL or `year: "all"` body would otherwise fail validateYear.
  if (!allTime) {
    const v = validateYear(year);
    if (!v.ok) return { ok: false, error: `invalid_year:${v.reason}` };
  }

  const token = strField(body, "token");
  const username = strField(body, "username");

  if (token) {
    if (!GITHUB_TOKEN_RE.test(token)) {
      return { ok: false, error: "invalid_token_format" };
    }
    return {
      ok: true,
      year,
      allTime,
      mode: { kind: "pat", token, username: username ?? null },
    };
  }
  if (username) {
    if (!GITHUB_USERNAME_RE.test(username)) {
      return { ok: false, error: "invalid_username" };
    }
    return { ok: true, year, allTime, mode: { kind: "username", username } };
  }
  return { ok: true, year, allTime, mode: { kind: "authenticated" } };
}

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const body = await request.json().catch(() => null);
  const parsed = parseRequest(body, url.searchParams.get("year"));
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "invalid_request", detail: parsed.error },
      { status: 400 },
    );
  }

  // Rate-limit the public (no-auth) paths per IP. Authenticated requests are
  // already gated by sign-in, so they skip the limiter.
  if (parsed.mode.kind !== "authenticated") {
    const limit = rateLimit(`generate:${clientIp(request)}`);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "rate_limited",
          hint: "Too many wraps in a short window. Try again soon.",
          retryAfter: limit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "retry-after": String(limit.retryAfterSeconds) },
        },
      );
    }
  }

  const result = await runGeneration(parsed.year, parsed.mode, parsed.allTime);
  if (!result.ok) {
    return NextResponse.json(result.payload, { status: result.status });
  }
  const { wrappedId, redirectUrl } = result.payload;
  return NextResponse.json({ wrappedId, redirectUrl });
}

// GET variant: convenience for manual testing of the authenticated flow. On
// success, 307-redirects to the share page. Username / PAT modes are POST-only
// (a token must never ride in a URL / query string / browser history).
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = parseRequest(null, url.searchParams.get("year"));
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "invalid_request", detail: parsed.error },
      { status: 400 },
    );
  }
  const result = await runGeneration(
    parsed.year,
    { kind: "authenticated" },
    parsed.allTime,
  );
  if (!result.ok) {
    return NextResponse.json(result.payload, { status: result.status });
  }
  const redirect = new URL(result.payload.redirectUrl, request.url);
  return NextResponse.redirect(redirect, 307);
}
