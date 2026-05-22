import { NextResponse } from "next/server";
import { aggregateWrappedStats } from "@/lib/aggregator";
import { GitHubApiError } from "@/lib/github/client";
import { fetchWrappedData } from "@/lib/github/fetchCommits";
import { createClient, getUserSafe } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import type { WrappedStats } from "@/lib/types";

export const runtime = "nodejs";
// Per PRD §5.1, generation can take up to ~60s for power users.
export const maxDuration = 60;

// GitHub launched in April 2008; nothing older than that is meaningful.
const GITHUB_FOUNDED_YEAR = 2008;

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
): Promise<
  | { ok: true; payload: GenerateOk }
  | { ok: false; status: number; payload: GenerateErr }
> {
  const supabase = await createClient();

  const user = await getUserSafe(supabase);
  if (!user) {
    return {
      ok: false,
      status: 401,
      payload: { error: "not_authenticated" },
    };
  }

  // Read the GitHub token from user_github_tokens (captured in
  // /auth/callback). Service-role client bypasses RLS.
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
      payload: {
        error: "token_lookup_failed",
        message: tokenError.message,
      },
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
          "Sign out and back in. The new auth flow captures and stores your GitHub token on sign-in. If you see this after re-signing in, the user_github_tokens migration (0004) may not be applied.",
      },
    };
  }

  const { from, to } = dateRangeForYear(year);

  let stats: WrappedStats;
  try {
    const fetchResult = await fetchWrappedData(providerToken, from, to);
    stats = aggregateWrappedStats(fetchResult, { from, to });
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
        hint: `No GitHub commits found for ${year}. Try a different year.`,
      },
    };
  }

  // Force stats.year to match the requested year (aggregator derives it from
  // the `to` date, which would be wrong if the requested year was in the past
  // — `to` would be Dec 31 of that past year so this is already correct, but
  // being explicit is safer).
  stats.year = year;

  // Persist (upsert by github_username + year). RLS policy "Users can manage
  // their own wrappeds" lets the authenticated user write their own row.
  const { data: row, error: dbError } = await supabase
    .from("wrapped_reports")
    .upsert(
      {
        user_id: user.id,
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
      redirectUrl: `/u/${stats.username}/${stats.year}`,
      stats,
    },
  };
}

/**
 * Resolve which year to generate from the request. Body wins over query
 * string; falls back to the current calendar year.
 */
async function resolveYear(request: Request): Promise<number | { error: string }> {
  const url = new URL(request.url);
  const urlYear = url.searchParams.get("year");
  let year: number = new Date().getUTCFullYear();

  if (request.method === "POST") {
    try {
      const body = await request.json().catch(() => null);
      const bodyYear = parseYearFromBody(body);
      if (bodyYear !== null) year = bodyYear;
      else if (urlYear) year = Number.parseInt(urlYear, 10);
    } catch {
      // ignore — fall through to default
    }
  } else if (urlYear) {
    year = Number.parseInt(urlYear, 10);
  }

  const v = validateYear(year);
  if (!v.ok) return { error: v.reason };
  return year;
}

export async function POST(request: Request): Promise<Response> {
  const resolved = await resolveYear(request);
  if (typeof resolved !== "number") {
    return NextResponse.json(
      { error: "invalid_year", detail: resolved.error },
      { status: 400 },
    );
  }
  const result = await runGeneration(resolved);
  if (!result.ok) {
    return NextResponse.json(result.payload, { status: result.status });
  }
  const { wrappedId, redirectUrl } = result.payload;
  return NextResponse.json({ wrappedId, redirectUrl });
}

// GET variant: convenience for manual testing. On success, 307-redirects to
// the share page so visiting /api/generate in a browser triggers the full
// pipeline + lands on the share page.
export async function GET(request: Request): Promise<Response> {
  const resolved = await resolveYear(request);
  if (typeof resolved !== "number") {
    return NextResponse.json(
      { error: "invalid_year", detail: resolved.error },
      { status: 400 },
    );
  }
  const result = await runGeneration(resolved);
  if (!result.ok) {
    return NextResponse.json(result.payload, { status: result.status });
  }
  const url = new URL(result.payload.redirectUrl, request.url);
  return NextResponse.redirect(url, 307);
}
