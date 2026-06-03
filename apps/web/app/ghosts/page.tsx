import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient, getUserSafe } from "@/lib/supabase/server";
import ContributionGridBg from "../ContributionGridBg";
import GhostsClient from "./GhostsClient";

export const metadata: Metadata = {
  title: "GitHub Ghosts & Mutuals — who doesn't follow you back",
  description:
    "Type any GitHub username and instantly see who you follow that doesn't follow you back (ghosts), who follows you that you don't follow (fans), and your mutuals. No login, nothing stored.",
  alternates: { canonical: "/ghosts" },
  openGraph: {
    type: "website",
    title: "GitHub Ghosts & Mutuals",
    description:
      "See who doesn't follow you back on GitHub — ghosts, fans, and mutuals for any public username.",
    url: "/ghosts",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Ghosts & Mutuals",
    description: "See who doesn't follow you back on GitHub.",
  },
};

export default async function GhostsPage() {
  // If the visitor is signed in, prefill their own GitHub handle so the
  // checker is one tap. An explicit ?u= in the URL still wins (handled
  // client-side), so shared links resolve to the linked user, not the viewer.
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  const githubLogin =
    (user?.user_metadata?.user_name as string | undefined) ??
    (user?.user_metadata?.preferred_username as string | undefined) ??
    null;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ContributionGridBg />

      {/* Nav — mirrors the landing's nav so the page reads as native. */}
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
        <Link
          href="/"
          className="text-sm text-neutral-300 hover:text-white transition-colors"
        >
          ← Wrap your year
        </Link>
      </nav>

      {/* Hero + tool */}
      <section className="px-6 pt-10 pb-20 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="rise inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950/70 px-3 py-1.5 mb-7 font-mono text-[12px] sm:text-[13px] text-neutral-400 backdrop-blur-sm"
            style={{ animationDelay: "0ms" }}
          >
            <span className="text-emerald-400">$</span>
            <span>github</span>
            <span className="text-neutral-600">--ghosts</span>
            <span className="inline-block h-3.5 w-[2px] bg-neutral-300 animate-pulse" />
          </div>
          <h1
            className="rise text-4xl sm:text-6xl font-black tracking-[-0.04em] leading-[0.95]"
            style={{ animationDelay: "80ms" }}
          >
            Who doesn&apos;t
            <br />
            <span className="text-pink-400">follow you back?</span>
          </h1>
          <p
            className="rise mt-6 text-base sm:text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed"
            style={{ animationDelay: "160ms" }}
          >
            Type any GitHub username. See your ghosts 👻, fans ⭐, and mutuals 🤝
            instantly. No login, nothing stored.
          </p>

          <div className="rise mt-9" style={{ animationDelay: "240ms" }}>
            <Suspense fallback={null}>
              <GhostsClient prefillUsername={githubLogin} />
            </Suspense>
          </div>

          <p className="mt-6 text-xs text-neutral-500">
            free · reads only public follower lists · we store nothing
          </p>
        </div>
      </section>

      <footer className="px-6 pb-10 text-center text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-300 transition-colors">
          yearincode
        </Link>{" "}
        · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
