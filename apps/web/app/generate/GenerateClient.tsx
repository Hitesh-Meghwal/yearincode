"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";

// PRD §6.3 — rotating loading copy. Cycles while POST /api/generate runs.
const LOADING_LINES = [
  "Counting your commits…",
  "Judging your 3 AM merges…",
  "Measuring your snake_case habits…",
  "Calculating your refactor:feature ratio…",
  "Quietly noticing how many TODOs you've ignored…",
  "Ranking your branches by chaos…",
  "Almost there — preparing the verdict…",
];

type ErrorPayload = {
  error: string;
  message?: string;
  hint?: string;
  retryAfter?: number;
};

type Props = {
  year: number;
};

export default function GenerateClient({ year }: Props) {
  const router = useRouter();
  const [lineIndex, setLineIndex] = useState(0);
  const [error, setError] = useState<ErrorPayload | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const startedRef = useRef(false);

  async function signOutAndReauth() {
    setSigningOut(true);
    const supabase = createBrowserSupabase();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[sign-out] failed", err);
    }
    // Send them back to the landing so they can hit "Sign in with GitHub".
    router.push("/");
  }

  // Rotate the loading copy every 2.3s.
  useEffect(() => {
    const id = setInterval(() => {
      setLineIndex((i) => Math.min(i + 1, LOADING_LINES.length - 1));
    }, 2300);
    return () => clearInterval(id);
  }, []);

  // Kick off /api/generate once on mount (StrictMode-safe via ref guard).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runGenerate() {
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({ year }),
      });
      const body = (await res.json().catch(() => null)) as
        | { wrappedId?: string; redirectUrl?: string }
        | ErrorPayload
        | null;

      if (!res.ok || !body || !("redirectUrl" in body) || !body.redirectUrl) {
        const err = (body as ErrorPayload | null) ?? {
          error: "unknown",
          message: `HTTP ${res.status}`,
        };
        setError(err);
        return;
      }
      router.replace(body.redirectUrl);
    } catch (err) {
      setError({
        error: "network_error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (error) {
    const isTokenMissing = error.error === "missing_github_token";
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="text-4xl">🫠</div>
          <h1 className="text-xl font-semibold">
            Couldn&apos;t cook your wrapped.
          </h1>
          <p className="text-sm text-neutral-400 break-words">
            {isTokenMissing
              ? "Your GitHub access token isn't on file. Sign out and sign back in to grant it again — that's the only fix."
              : error.message ?? error.error}
          </p>
          {!isTokenMissing && error.hint ? (
            <p className="text-xs text-neutral-500">{error.hint}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {isTokenMissing ? (
              <button
                type="button"
                onClick={signOutAndReauth}
                disabled={signingOut}
                className="inline-flex items-center justify-center rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-60"
              >
                {signingOut ? "Signing out…" : "Sign out & sign in →"}
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setRetrying(true);
                  startedRef.current = true;
                  await runGenerate();
                  setRetrying(false);
                }}
                disabled={retrying}
                className="inline-flex items-center justify-center rounded-full bg-white text-black px-5 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-60"
              >
                {retrying ? "Retrying…" : "Try again"}
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push("/generate")}
              className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-5 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition-colors"
            >
              Pick another year
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] h-[60vh] w-[60vh] rounded-full bg-emerald-500/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-violet-500/20 blur-[140px]" />
      </div>

      <div className="w-full max-w-md text-center space-y-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-300">
          cooking your {year} wrapped
        </p>

        <div className="mx-auto h-12 w-12 rounded-full border-2 border-neutral-700 border-t-white animate-spin" />

        <div className="min-h-[3.5rem] flex items-center justify-center">
          <p
            key={lineIndex}
            className="text-xl sm:text-2xl text-neutral-100 font-medium animate-[fadeIn_0.4s_ease-out]"
          >
            {LOADING_LINES[lineIndex]}
          </p>
        </div>

        <p className="text-xs text-neutral-500">
          This usually takes 15–30 seconds. Power users with thousands of
          commits may wait closer to a minute.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
