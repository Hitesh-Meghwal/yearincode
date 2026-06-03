import type { Metadata } from "next";
import Link from "next/link";
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

// A single metric tile for the share-page summary grid. Mirrors the landing
// page's card tokens (rounded-2xl / border-neutral-800 / bg-neutral-950/60)
// with a big mono number in an archetype-palette accent over a quiet label.
function StatCard({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 backdrop-blur-sm">
      <div className={`font-mono text-2xl font-bold tracking-tight ${accent}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-neutral-500">{label}</div>
    </div>
  );
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
        {/* In-page back link: most visitors arrive from a shared link, so
            browser-back would leave the site entirely. This is a plain row
            above the centered content — it doesn't affect the player's
            centering below. */}
        <nav>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <span aria-hidden>←</span> yearincode
          </Link>
        </nav>

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

        {/* Branded stat summary below the player. Doubles as the
            screen-reader-friendly + no-JS fallback (PRD §5.5) — every figure
            is real text inside semantic cards, so it reads cleanly without
            the Flutter deck. Styling mirrors the landing page's card tokens:
            rounded-2xl / border-neutral-800 / bg-neutral-950/60 / backdrop-blur. */}
        <section className="space-y-8 pt-6 border-t border-neutral-900">
          <h2 className="text-xl font-bold tracking-tight">
            {stats.isAllTime ? "Since day one" : `${stats.year} in numbers`}
          </h2>

          {/* Archetype — the hero card, full-width with a violet→pink accent
              ring echoing the landing's pink/violet palette. */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 backdrop-blur-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 blur-3xl"
            />
            <div className="relative flex items-center gap-4">
              <TwemojiImage
                emoji={stats.archetype.emoji}
                size={48}
                alt={stats.archetype.name}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">{stats.archetype.name}</h3>
                  <span className="rounded-full border border-neutral-700 bg-neutral-900/80 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-neutral-400">
                    {stats.archetype.rarity}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                  {stats.archetype.description}
                </p>
              </div>
            </div>
          </div>

          {/* Headline numbers as a responsive stat-card grid. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              value={fmtNumber(stats.totalCommits)}
              label="commits"
              accent="text-pink-300"
            />
            <StatCard
              value={`${stats.longestStreak.days}d`}
              label="longest streak"
              accent="text-violet-300"
            />
            <StatCard
              value={fmtNumber(stats.totalActiveDays)}
              label="active days"
              accent="text-emerald-300"
            />
            <StatCard
              value={fmtNumber(stats.totalRepos)}
              label="repos"
              accent="text-pink-300"
            />
            <StatCard
              value={`${stats.peakHour}:00`}
              label="peak hour · UTC"
              accent="text-violet-300"
            />
            <StatCard
              value={DAY_NAMES[stats.peakDayOfWeek].slice(0, 3)}
              label="busiest day"
              accent="text-emerald-300"
            />
            <StatCard
              value={`+${fmtNumber(stats.totalAdditions)}`}
              label="lines added"
              accent="text-emerald-300"
            />
            <StatCard
              value={`-${fmtNumber(stats.totalDeletions)}`}
              label="lines removed"
              accent="text-pink-300"
            />
            <StatCard
              value={fmtPercent(stats.weekendRatio)}
              label="weekend ratio"
              accent="text-violet-300"
            />
          </div>

          {/* Discipline score — a labelled bar so the 0–100 reads at a glance. */}
          {typeof stats.disciplineScore === "number" ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 backdrop-blur-sm">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-medium text-neutral-400">
                  Discipline score
                </h3>
                <p className="font-mono text-sm">
                  <span className="text-lg font-bold text-white">
                    {stats.disciplineScore}
                  </span>
                  <span className="text-neutral-500"> / 100</span>
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, stats.disciplineScore))}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {/* Tech stack — language bars. */}
          {stats.topLanguages.length > 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-neutral-400">
                Top languages
              </h3>
              <ul className="mt-4 space-y-3">
                {stats.topLanguages.map((l) => (
                  <li key={l.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-neutral-200">
                        {l.name}
                      </span>
                      <span className="font-mono text-xs text-neutral-500">
                        {fmtNumber(l.commits)} · {l.percentage}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500"
                        style={{
                          width: `${Math.max(2, Math.min(100, l.percentage))}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* "Top repos" section intentionally removed: share pages are public
              and we don't want private repo names visible to any visitor.
              Repo counts inform the archetype + totals; the names themselves
              don't add value to viewers. */}

          {stats.topCollaborators.length > 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-neutral-400">
                Top collaborators
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {stats.topCollaborators.map((c) => (
                  <li
                    key={c.username}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-sm"
                  >
                    <span className="font-medium text-neutral-200">
                      @{c.username}
                    </span>
                    <span className="font-mono text-xs text-neutral-500">
                      {fmtNumber(c.sharedCommits)}
                    </span>
                  </li>
                ))}
              </ul>
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
