import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GenerateClient from "./GenerateClient";

export const dynamic = "force-dynamic";

export default async function GeneratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const meta = user.user_metadata ?? {};
  const githubLogin: string | undefined =
    meta.user_name ?? meta.preferred_username ?? meta.login;

  if (!githubLogin) {
    // No GitHub identity attached — should not happen with our auth setup,
    // but bail gracefully.
    redirect("/me");
  }

  const year = new Date().getUTCFullYear();

  // Fast path: if a wrapped already exists for this user + year, skip the
  // generate flow entirely and send them to the share page.
  const { data: existing } = await supabase
    .from("wrapped_reports")
    .select("id")
    .eq("github_username", githubLogin)
    .eq("year", year)
    .maybeSingle();

  if (existing) {
    redirect(`/u/${githubLogin}/${year}`);
  }

  return <GenerateClient />;
}
