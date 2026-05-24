import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/generate";
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (errorParam) {
    const redirect = new URL("/", url.origin);
    redirect.searchParams.set("error", errorDescription ?? errorParam);
    return NextResponse.redirect(redirect);
  }

  if (!code) {
    const redirect = new URL("/", url.origin);
    redirect.searchParams.set("error", "missing_code");
    return NextResponse.redirect(redirect);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed", error);
    const redirect = new URL("/", url.origin);
    redirect.searchParams.set("error", error.message);
    return NextResponse.redirect(redirect);
  }

  // Capture the GitHub provider_token here — this is the only place Supabase
  // reliably returns it (subsequent getSession() calls in newer Supabase
  // versions don't include it). Persist it to user_github_tokens (RLS lets
  // only the service role touch the table). /api/generate reads from there.
  //
  // Also fetch viewer.createdAt in the same callback so the year picker can
  // show every year since the user joined GitHub instead of a fixed
  // past-5-years window. If the fetch fails for any reason, we still save
  // the token — the picker has a lazy backfill fallback.
  const providerToken = data.session?.provider_token;
  const userId = data.user?.id;
  if (providerToken && userId) {
    let githubCreatedAt: string | null = null;
    try {
      const viewerResp = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          authorization: `Bearer ${providerToken}`,
          "content-type": "application/json",
          accept: "application/vnd.github+json",
          "user-agent": "yearincode/0.1 (+https://yearincode.com)",
        },
        body: JSON.stringify({
          query: "query { viewer { createdAt } }",
        }),
      });
      if (viewerResp.ok) {
        const json = (await viewerResp.json()) as {
          data?: { viewer?: { createdAt?: string } };
        };
        githubCreatedAt = json.data?.viewer?.createdAt ?? null;
      }
    } catch (e) {
      console.warn("[auth/callback] viewer.createdAt fetch failed", e);
    }

    try {
      const svc = createServiceRoleClient();
      const { error: upsertError } = await svc
        .from("user_github_tokens")
        .upsert({
          user_id: userId,
          access_token: providerToken,
          github_created_at: githubCreatedAt,
          updated_at: new Date().toISOString(),
        });
      if (upsertError) {
        console.error(
          "[auth/callback] failed to persist GitHub token",
          upsertError,
        );
        // Don't block sign-in — the user can still browse public pages.
      }
    } catch (e) {
      console.error("[auth/callback] token persist threw", e);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
