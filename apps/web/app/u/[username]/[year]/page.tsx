import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import SharePageClient from "@/components/SharePageClient";
import { TwemojiImage } from "@/components/TwemojiImage";
import { getPlayerVersion } from "@/lib/playerVersion";
import { createClient } from "@/lib/supabase/server";
import type { WrappedStats } from "@/lib/types";

// Maps the route's `year` slug to the DB query year. The public slug `all`
// ↔ the all-time sentinel 0; everything else is a numeric calendar year.
// Returns null for anything that isn't a valid year/slug.
function resolveQueryYear(year: string): number | null {
  if (year === "all") return 0;
  const n = Number.parseInt(year, 10);
  return Number.isFinite(n) ? n : null;
}

// The path segment we link back to: `all` for all-time, else the numeric year.
function yearSlug(stats: WrappedStats): string {
  return stats.isAllTime ? "all" : String(stats.year);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; year: string }>;
}): Promise<Metadata> {
  const { username, year } = await params;
  const queryYear = resolveQueryYear(year);
  if (queryYear === null) return { title: "yearincode" };

  const supabase = await createClient();
  const { data } = await supabase
    .from("wrapped_reports")
    .select("stats_json")
    .eq("github_username", username)
    .eq("year", queryYear)
    .maybeSingle();

  if (!data) return { title: `${username} — yearincode` };

  const stats = data.stats_json as WrappedStats;
  const title = stats.isAllTime
    ? `@${stats.username}'s GitHub story · Since Day One`
    : `@${stats.username}'s ${stats.year} in code`;
  const description = stats.isAllTime
    ? `${stats.yearsActive ?? 0} years, ${stats.totalCommits.toLocaleString()} commits · ${stats.archetype.name} ${stats.archetype.emoji}`
    : `${stats.totalCommits.toLocaleString()} commits · ${stats.longestStreak.days}-day streak · ${stats.archetype.name} ${stats.archetype.emoji}`;
  const path = `/u/${encodeURIComponent(username)}/${yearSlug(stats)}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      type: "profile",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
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
  const queryYear = resolveQueryYear(year);
  if (queryYear === null) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wrapped_reports")
    .select("stats_json, view_count, created_at, updated_at, is_public")
    .eq("github_username", username)
    .eq("year", queryYear)
    .maybeSingle();

  if (error) {
    console.error("[share-page] query failed", error);
  }
  if (!data) notFound();

  // Increment the view counter atomically via an SQL RPC. Fire-and-forget —
  // the page render shouldn't depend on it succeeding. All-time passes the
  // sentinel year 0. Migration: supabase/migrations/0002_view_count_rpc.sql
  void supabase
    .rpc("increment_wrapped_view", {
      p_username: username,
      p_year: queryYear,
    })
    .then(({ error: rpcError }) => {
      if (rpcError) {
        console.warn("[share-page] view increment failed:", rpcError.message);
      }
    });

  const stats = data.stats_json as WrappedStats;
  const shareUrl = await resolveShareUrl(`/u/${username}/${yearSlug(stats)}`);

  // Per-wrap JSON-LD. ProfilePage with an embedded CreativeWork lets
  // Google understand this is a personal recap belonging to a developer —
  // candidate for rich result rendering once the site has authority.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: stats.isAllTime
      ? `@${stats.username}'s GitHub story · Since Day One`
      : `@${stats.username}'s ${stats.year} in code`,
    url: shareUrl,
    dateModified: data.updated_at,
    mainEntity: {
      "@type": "Person",
      name: stats.username,
      alternateName: `@${stats.username}`,
      url: `https://github.com/${stats.username}`,
      image: stats.avatarUrl || undefined,
    },
    about: {
      "@type": "CreativeWork",
      name: stats.isAllTime
        ? "All-time GitHub Wrapped"
        : `${stats.year} GitHub Wrapped`,
      description: stats.isAllTime
        ? `${stats.yearsActive ?? 0} years active, ${stats.totalCommits.toLocaleString()} commits, archetype: ${stats.archetype.name}.`
        : `${stats.totalCommits.toLocaleString()} commits, ${stats.longestStreak.days}-day longest streak, archetype: ${stats.archetype.name}.`,
    },
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            <p className="text-sm text-neutral-400">
              {stats.isAllTime
                ? `Since Day One${stats.accountCreatedYear ? ` · ${stats.accountCreatedYear}–now` : ""}`
                : `${stats.year} in code`}
            </p>
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
