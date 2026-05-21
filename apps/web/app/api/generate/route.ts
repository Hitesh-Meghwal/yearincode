import { NextResponse } from "next/server";
import { aggregateWrappedStats } from "@/lib/aggregator";
import { GitHubApiError } from "@/lib/github/client";
import { fetchWrappedData } from "@/lib/github/fetchCommits";
import { createClient } from "@/lib/supabase/server";
import type { WrappedStats } from "@/lib/types";

export const runtime = "nodejs";
// Per PRD §5.1, generation can take up to ~60s for power users.
export const maxDuration = 60;

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

async function runGeneration(): Promise<
  | { ok: true; payload: GenerateOk }
  | { ok: false; status: number; payload: GenerateErr }
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      status: 401,
      payload: { error: "not_authenticated" },
    };
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("[api/generate] getSession failed", sessionError);
    return {
      ok: false,
      status: 500,
      payload: { error: "session_error", detail: sessionError.message },
    };
  }

  const providerToken = session?.provider_token;
  if (!providerToken) {
    return {
      ok: false,
      status: 412,
      payload: {
        error: "missing_github_token",
        hint:
          "Sign out and back in. If it still fails, enable 'Save provider tokens' on the Supabase GitHub auth provider.",
      },
    };
  }

  const to = new Date();
  const from = new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000);

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

export async function POST(): Promise<Response> {
  const result = await runGeneration();
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
  const result = await runGeneration();
  if (!result.ok) {
    return NextResponse.json(result.payload, { status: result.status });
  }
  const url = new URL(result.payload.redirectUrl, request.url);
  return NextResponse.redirect(url, 307);
}
