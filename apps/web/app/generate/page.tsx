import { redirect } from "next/navigation";
import { createClient, getUserSafe } from "@/lib/supabase/server";
import GenerateClient from "./GenerateClient";
import YearPicker from "./YearPicker";

export const dynamic = "force-dynamic";

const YEARS_TO_SHOW = 6; // current year + 5 past years

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; force?: string }>;
}) {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);

  if (!user) {
    redirect("/");
  }

  const meta = user.user_metadata ?? {};
  const githubLogin: string | undefined =
    meta.user_name ?? meta.preferred_username ?? meta.login;

  if (!githubLogin) {
    redirect("/me");
  }

  const params = await searchParams;
  const currentYear = new Date().getUTCFullYear();
  const requestedYear = params.year
    ? Number.parseInt(params.year, 10)
    : null;
  const force = params.force === "1";

  // ---- Branch A: a specific year was requested.
  if (requestedYear !== null && Number.isFinite(requestedYear)) {
    // If they already have a wrapped for this year, send them to the share
    // page UNLESS ?force=1 was passed (regenerate flow). The API upserts
    // on conflict, so a forced regen overwrites the existing row in place.
    if (!force) {
      const { data: existing } = await supabase
        .from("wrapped_reports")
        .select("id")
        .eq("github_username", githubLogin)
        .eq("year", requestedYear)
        .maybeSingle();

      if (existing) {
        redirect(`/u/${githubLogin}/${requestedYear}`);
      }
    }

    return <GenerateClient year={requestedYear} />;
  }

  // ---- Branch B: no year requested → show the picker.
  const years: number[] = [];
  for (let i = 0; i < YEARS_TO_SHOW; i += 1) {
    years.push(currentYear - i);
  }

  // Fetch existing wrappeds for this user across the visible years so we can
  // mark each row as "view" vs "generate".
  const { data: ownedRows } = await supabase
    .from("wrapped_reports")
    .select("year, view_count")
    .eq("user_id", user.id)
    .in("year", years);

  const ownedByYear = new Map<number, { viewCount: number }>(
    (ownedRows ?? []).map((row) => [row.year as number, { viewCount: (row.view_count ?? 0) as number }]),
  );

  const items = years.map((year) => ({
    year,
    isCurrent: year === currentYear,
    owned: ownedByYear.get(year) ?? null,
  }));

  return <YearPicker username={githubLogin} items={items} />;
}
