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
  const providerToken = data.session?.provider_token;
  const userId = data.user?.id;
  if (providerToken && userId) {
    try {
      const svc = createServiceRoleClient();
      const { error: upsertError } = await svc
        .from("user_github_tokens")
        .upsert({
          user_id: userId,
          access_token: providerToken,
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
