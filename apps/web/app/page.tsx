import Link from "next/link";
import { createClient, getUserSafe } from "@/lib/supabase/server";
import SignInButton from "./SignInButton";
import SampleEmbed from "./SampleEmbed";
import ArchetypeShowcase from "./ArchetypeShowcase";
import ContributionGridBg from "./ContributionGridBg";

const SAMPLE_PATH = "/u/Hitesh-Meghwal/2026";

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

  // For the sample iframe we want stats; fetch the row that backs SAMPLE_PATH
  // if it exists. Falls back to a static teaser if not.
  const sampleSlug = SAMPLE_PATH.replace(/^\/u\//, "").split("/");
  const sampleUsername = sampleSlug[0];
  const sampleYear = Number.parseInt(sampleSlug[1], 10);

  let sampleStats: unknown = null;
  if (Number.isFinite(sampleYear)) {
    const { data: sample } = await supabase
      .from("wrapped_reports")
      .select("stats_json")
      .eq("github_username", sampleUsername)
      .eq("year", sampleYear)
      .maybeSingle();
    sampleStats = sample?.stats_json ?? null;
  }

  // Aggregate stats for the social-proof line. Requires the
  // public_wrapped_stats RPC from 0003_public_wrapped_stats_rpc.sql; if the
  // migration hasn't been applied yet we silently hide the strip.
  const { data: globalStats } = await supabase
    .rpc("public_wrapped_stats")
    .maybeSingle();
  const totalWrappeds = Number(
    (globalStats as { total_wrappeds?: number | string } | null)
      ?.total_wrappeds ?? 0,
  );
  const totalViews = Number(
    (globalStats as { total_views?: number | string } | null)?.total_views ??
      0,
  );
  const fmtCount = (n: number) =>
    new Intl.NumberFormat("en-US").format(n);

  const params = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden">
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
          <Link
            href="/generate"
            className="text-sm text-neutral-300 hover:text-white transition-colors"
          >
            Your wrapped →
          </Link>
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
              free · public + private repos · we never see your code, only metadata
            </p>
            {totalWrappeds > 0 ? (
              <p className="font-mono text-[12px] text-neutral-400 mt-2 flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300">
                  {fmtCount(totalWrappeds)}
                </span>
                <span className="text-neutral-600">
                  wrapped{totalWrappeds === 1 ? "" : "s"} generated
                </span>
                <span className="text-neutral-700">·</span>
                <span className="text-emerald-300">
                  {fmtCount(totalViews)}
                </span>
                <span className="text-neutral-600">
                  total view{totalViews === 1 ? "" : "s"}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Sample */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              See it in motion
            </h2>
            {sampleStats ? (
              <Link
                href={SAMPLE_PATH}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Open this wrapped →
              </Link>
            ) : null}
          </div>

          <SampleEmbed
            stats={sampleStats}
            fallbackHref={SAMPLE_PATH}
          />
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

      <footer className="px-6 pb-10 text-center text-xs text-neutral-500 space-y-2">
        <div>
          Built for developers · open-source friendly · {new Date().getFullYear()}
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
