import Link from "next/link";
import { createClient, getUserSafe } from "@/lib/supabase/server";
import { LANDING_DEMO_STATS } from "@/lib/landingDemoStats";
import SignInButton from "./SignInButton";
import SignOutLink from "./SignOutLink";
import SampleEmbed from "./SampleEmbed";
import ArchetypeShowcase from "./ArchetypeShowcase";
import ContributionGridBg from "./ContributionGridBg";

// The "see an example" sample on the landing uses a synthetic wrapped (NOT
// tied to any real GitHub user). Three reasons:
//   1. Avoid exposing the maintainer's (or any first user's) actual data on
//      the public homepage.
//   2. Predictable visuals — every visitor sees the same polished sample.
//   3. One fewer DB query on the busiest route.
// The data lives in @/lib/landingDemoStats.
const sampleStats: unknown = LANDING_DEMO_STATS;

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  const githubLogin =
    (user?.user_metadata?.user_name as string | undefined) ??
    (user?.user_metadata?.preferred_username as string | undefined);

  // Aggregate stats for the social-proof line. RPC from migrations
  // 0003 + 0005 — if 0005 isn't applied, total_devs falls back to
  // total_wrappeds (lower bound: at least one dev per wrapped).
  const { data: globalStats } = await supabase
    .rpc("public_wrapped_stats")
    .maybeSingle();
  const stats = globalStats as
    | {
        total_wrappeds?: number | string;
        total_views?: number | string;
        total_devs?: number | string;
      }
    | null;
  const totalWrappeds = Number(stats?.total_wrappeds ?? 0);
  const totalViews = Number(stats?.total_views ?? 0);
  const totalDevs = Number(stats?.total_devs ?? totalWrappeds ?? 0);
  const fmtCount = (n: number) =>
    new Intl.NumberFormat("en-US").format(n);

  const params = await searchParams;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://yearincode.com";

  // JSON-LD structured data. WebSite gives Google the sitelinks searchbox
  // hook; SoftwareApplication tells it this is a free web app for devs.
  // Both are inlined via a <script type="application/ld+json"> so crawlers
  // pick them up on the very first render.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "yearincode",
      url: siteUrl,
      description:
        "Turn a year of your GitHub activity into an animated Spotify-Wrapped-style recap.",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "yearincode",
      url: siteUrl,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description:
        "An animated recap of every commit, streak, language, and archetype from your GitHub year. Shareable in 60 seconds.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Person",
        name: "Hitesh Meghwal",
        url: "https://github.com/Hitesh-Meghwal",
      },
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContributionGridBg />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          aria-label="yearincode home"
          className="flex items-center gap-2.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/yearincode-logo.svg"
            alt=""
            aria-hidden="true"
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
          <span className="font-semibold tracking-tight text-base sm:text-lg">
            yearincode
          </span>
        </Link>
        {user ? (
          <div className="flex items-center gap-5">
            <Link
              href="/generate"
              className="text-sm text-neutral-300 hover:text-white transition-colors"
            >
              Your wrapped →
            </Link>
            <SignOutLink />
          </div>
        ) : null}
      </nav>

      {/* Hero */}
      <section className="px-6 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950/70 px-3 py-1.5 mb-6 font-mono text-[12px] sm:text-[13px] text-neutral-400 backdrop-blur-sm">
            <span className="text-emerald-400">$</span>
            <span>yearincode</span>
            <span className="text-neutral-600">--user</span>
            <span className="text-emerald-300">
              @{githubLogin ?? "you"}
            </span>
            <span className="inline-block h-3.5 w-[2px] bg-neutral-300 animate-pulse" />
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            Your{" "}
            <span className="bg-gradient-to-br from-emerald-300 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              year in code
            </span>
            ,{" "}
            <br className="hidden sm:block" />
            wrapped.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto">
            Sign in with GitHub. 15 seconds later, get a beautiful animated
            recap of your year: commits, languages, peak hours, your archetype.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            {user ? (
              <Link
                href="/generate"
                className="inline-flex items-center justify-center rounded-full bg-white text-black px-6 py-3 text-base font-semibold hover:bg-neutral-200 transition-colors"
              >
                {githubLogin ? "View your wrapped →" : "Continue →"}
              </Link>
            ) : (
              <SignInButton />
            )}
            {params?.error ? (
              <p className="text-red-400 text-sm">{params.error}</p>
            ) : null}
            <p className="text-xs text-neutral-500">
              free · read-only public-repo access · we never see your code, only commit metadata
            </p>
            <p className="font-mono text-[12px] text-neutral-400 mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <SocialProofCopy
                totalWrappeds={totalWrappeds}
                totalViews={totalViews}
                totalDevs={totalDevs}
                fmtCount={fmtCount}
              />
            </p>
          </div>
        </div>
      </section>

      {/* Sample */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              See it in motion
            </h2>
          </div>

          <SampleEmbed stats={sampleStats} fallbackHref="/" />
        </div>
      </section>

      {/* Archetype showcase — explains the killer "vibe check" feature. */}
      <ArchetypeShowcase />

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-2">
          <Feature
            color="text-pink-300"
            emoji="📈"
            title="Streaks + patterns"
            body="Longest streak, peak coding hour, weekend ratio, top repos and languages. Numbers you'll actually want to share."
          />
          <Feature
            color="text-violet-300"
            emoji="🔗"
            title="One link to flex"
            body="A permanent shareable URL with a custom social card. Drop it in your portfolio, your CV, your group chat."
          />
        </div>
      </section>

      <footer className="px-6 pb-10 text-center text-xs text-neutral-500 space-y-3">
        <div>
          Built by{" "}
          <a
            href="https://github.com/Hitesh-Meghwal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white transition-colors font-medium"
          >
            @Hitesh-Meghwal
          </a>
          {" · "}
          {new Date().getFullYear()}
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-neutral-300 transition-colors">
            Privacy
          </Link>
          <span className="text-neutral-700">·</span>
          <Link href="/terms" className="hover:text-neutral-300 transition-colors">
            Terms
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  color,
  emoji,
  title,
  body,
}: {
  color: string;
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 backdrop-blur-sm">
      <div className={`text-3xl mb-3 ${color}`}>{emoji}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-neutral-400 leading-relaxed">{body}</p>
    </div>
  );
}

/**
 * Social-proof copy that adapts to actual numbers in three tiers, so the
 * landing reads positively whether we're at zero users or ten thousand.
 * No fake numbers — just smart phrasing per stage of growth.
 *
 *   tier 1   0 wrappeds:     "just launched · be the first to ship your wrapped"
 *   tier 2   1-9 wrappeds:   "{N} wrapped(s) shipped · be next →"
 *   tier 3   10+ wrappeds:   "{D} devs have wrapped their year · {V} plays"
 */
function SocialProofCopy({
  totalWrappeds,
  totalViews,
  totalDevs,
  fmtCount,
}: {
  totalWrappeds: number;
  totalViews: number;
  totalDevs: number;
  fmtCount: (n: number) => string;
}) {
  if (totalWrappeds === 0) {
    return (
      <>
        <span className="text-emerald-300">just launched</span>
        <span className="text-neutral-700">·</span>
        <span className="text-neutral-600">
          be the first to ship your wrapped
        </span>
      </>
    );
  }

  if (totalWrappeds < 10) {
    return (
      <>
        <span className="text-emerald-300">{fmtCount(totalWrappeds)}</span>
        <span className="text-neutral-600">
          wrapped{totalWrappeds === 1 ? "" : "s"} shipped
        </span>
        <span className="text-neutral-700">·</span>
        <span className="text-neutral-500">be next →</span>
      </>
    );
  }

  return (
    <>
      <span className="text-emerald-300">{fmtCount(totalDevs)}</span>
      <span className="text-neutral-600">
        dev{totalDevs === 1 ? "" : "s"} wrapped their year
      </span>
      <span className="text-neutral-700">·</span>
      <span className="text-emerald-300">{fmtCount(totalViews)}</span>
      <span className="text-neutral-600">
        play{totalViews === 1 ? "" : "s"}
      </span>
    </>
  );
}
