import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import SharePageClient from "@/components/SharePageClient";
import { TwemojiImage } from "@/components/TwemojiImage";
import { getPlayerVersion } from "@/lib/playerVersion";
import { createClient } from "@/lib/supabase/server";
import type { WrappedStats } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; year: string }>;
}): Promise<Metadata> {
  const { username, year } = await params;
  const yearNum = Number.parseInt(year, 10);
  if (!Number.isFinite(yearNum)) return { title: "yearincode" };

  const supabase = await createClient();
  const { data } = await supabase
    .from("wrapped_reports")
    .select("stats_json")
    .eq("github_username", username)
    .eq("year", yearNum)
    .maybeSingle();

  if (!data) return { title: `${username} — yearincode` };

  const stats = data.stats_json as WrappedStats;
  const title = `@${stats.username}'s ${stats.year} in code`;
  const description = `${stats.totalCommits.toLocaleString()} commits · ${stats.longestStreak.days}-day streak · ${stats.archetype.name} ${stats.archetype.emoji}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function fmtPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

async function resolveShareUrl(path: string): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return `${envUrl.replace(/\/$/, "")}${path}`;
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ username: string; year: string }>;
}) {
  const { username, year } = await params;
  const yearNum = Number.parseInt(year, 10);
  if (!Number.isFinite(yearNum)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wrapped_reports")
    .select("stats_json, view_count, created_at, updated_at, is_public")
    .eq("github_username", username)
    .eq("year", yearNum)
    .maybeSingle();

  if (error) {
    console.error("[share-page] query failed", error);
  }
  if (!data) notFound();

  // Increment the view counter atomically via an SQL RPC. Fire-and-forget —
  // the page render shouldn't depend on it succeeding. Migration:
  // supabase/migrations/0002_view_count_rpc.sql
  void supabase
    .rpc("increment_wrapped_view", {
      p_username: username,
      p_year: yearNum,
    })
    .then(({ error: rpcError }) => {
      if (rpcError) {
        console.warn("[share-page] view increment failed:", rpcError.message);
      }
    });

  const stats = data.stats_json as WrappedStats;
  const shareUrl = await resolveShareUrl(`/u/${username}/${yearNum}`);

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl space-y-10">
        <header className="flex items-center gap-4">
          {stats.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={stats.avatarUrl}
              alt={stats.username}
              width={56}
              height={56}
              className="rounded-full border border-neutral-800"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-semibold">@{stats.username}</h1>
            <p className="text-sm text-neutral-400">{stats.year} in code</p>
          </div>
        </header>

        <SharePageClient
          stats={stats}
          shareUrl={shareUrl}
          playerVersion={getPlayerVersion()}
        />

        {/* Plain-text summary kept below the player as an accessibility +
            no-JS fallback. PRD §5.5 calls for a screen-reader-friendly
            structured summary. */}
        <section className="space-y-6 pt-4 border-t border-neutral-900">
          <h2 className="sr-only">Wrapped summary</h2>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Totals</h3>
            <ul className="text-sm text-neutral-300 space-y-1">
              <li>Commits: {fmtNumber(stats.totalCommits)}</li>
              <li>Repos contributed to: {fmtNumber(stats.totalRepos)}</li>
              <li>Active days: {fmtNumber(stats.totalActiveDays)}</li>
              <li>Additions: +{fmtNumber(stats.totalAdditions)}</li>
              <li>Deletions: -{fmtNumber(stats.totalDeletions)}</li>
              <li>Net lines: {fmtNumber(stats.netLines)}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Time patterns</h3>
            <ul className="text-sm text-neutral-300 space-y-1">
              <li>
                Peak hour: {stats.peakHour}:00 UTC ({fmtNumber(stats.peakHourCommits)} commits)
              </li>
              <li>Peak day: {DAY_NAMES[stats.peakDayOfWeek]}</li>
              <li>Weekend ratio: {fmtPercent(stats.weekendRatio)}</li>
              <li>
                Longest streak: {stats.longestStreak.days} day(s)
                {stats.longestStreak.from && stats.longestStreak.to ? (
                  <> · {stats.longestStreak.from} → {stats.longestStreak.to}</>
                ) : null}
              </li>
              {typeof stats.disciplineScore === "number" ? (
                <li>
                  Discipline score:{" "}
                  <span className="text-neutral-100 font-semibold">
                    {stats.disciplineScore}
                  </span>
                  <span className="text-neutral-500"> / 100</span>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Archetype</h3>
            <p className="flex items-center gap-2">
              <TwemojiImage
                emoji={stats.archetype.emoji}
                size={24}
                alt={stats.archetype.name}
              />
              <span>
                {stats.archetype.name}{" "}
                <span className="text-sm text-neutral-400">
                  ({stats.archetype.rarity})
                </span>
              </span>
            </p>
            <p className="text-sm text-neutral-300">
              {stats.archetype.description}
            </p>
          </div>

          {stats.topLanguages.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Tech stack</h3>
              <ol className="text-sm text-neutral-300 space-y-1 list-decimal list-inside">
                {stats.topLanguages.map((l) => (
                  <li key={l.name}>
                    {l.name} — {fmtNumber(l.commits)} commits ({l.percentage}%)
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {/* "Top repos" section intentionally removed: share pages are public
              and we don't want private repo names visible to any visitor.
              Repo counts inform the archetype + totals; the names themselves
              don't add value to viewers. */}

          {stats.topCollaborators.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Top collaborators</h3>
              <ol className="text-sm text-neutral-300 space-y-1 list-decimal list-inside">
                {stats.topCollaborators.map((c) => (
                  <li key={c.username}>
                    @{c.username} — {fmtNumber(c.sharedCommits)} shared commits
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>

        <footer className="text-xs text-neutral-500 pt-4 border-t border-neutral-900">
          views: {fmtNumber(data.view_count ?? 0)} · created{" "}
          {new Date(data.created_at).toLocaleString()}
          {data.is_public ? "" : " · PRIVATE"}
        </footer>
      </div>
    </main>
  );
}
