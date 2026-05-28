"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const CURRENT_YEAR = new Date().getUTCFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

// Real, well-known handles cycled through the placeholder so the input reads
// as "type ANY username" and invites a tap.
const SAMPLE_HANDLES = [
  "torvalds",
  "gaearon",
  "sindresorhus",
  "yyx990803",
  "tj",
  "antfu",
];

function friendlyError(code: string | undefined, status: number): string {
  switch (code) {
    case "invalid_username":
      return "That doesn't look like a GitHub username.";
    case "invalid_token_format":
      return "That token should start with ghp_ or github_pat_.";
    case "no_commits":
      return "No public commits found for that year. Try another year.";
    case "rate_limited":
      return "Too many wraps in a short window. Give it a minute.";
    case "app_token_missing":
      return "Username mode isn't configured on the server yet.";
    case "github_api_error":
      return status === 404
        ? "No GitHub user by that name."
        : "GitHub had a hiccup. Try again in a moment.";
    default:
      return "Something went wrong. Try again.";
  }
}

// "all" is the all-time ("Since Day One") sentinel; everything else is a
// numeric calendar year. Kept as a string in state so the <select> round-trips
// it cleanly.
type YearValue = number | "all";

export default function GenerateForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [year, setYear] = useState<YearValue>(CURRENT_YEAR);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle the placeholder handle while the field is empty + unfocused.
  useEffect(() => {
    if (username || focused) return;
    const id = setInterval(
      () => setPlaceholderIdx((i) => (i + 1) % SAMPLE_HANDLES.length),
      2600,
    );
    return () => clearInterval(id);
  }, [username, focused]);

  // A username OR a token is enough: in token mode the username comes from
  // the token's owner, so the field is optional once a token is pasted.
  const canSubmit = useMemo(
    () => (username.trim().length > 0 || token.trim().length > 0) && !loading,
    [username, token, loading],
  );

  const allTime = year === "all";
  const buttonLabel = username.trim()
    ? `Wrap @${username.trim()}${allTime ? " · all-time" : ""}`
    : token.trim()
      ? allTime
        ? "Wrap it all"
        : "Wrap my year"
      : allTime
        ? "Wrap it all"
        : "Wrap the year";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          // Sends the numeric year, or the literal string "all" for the
          // all-time ("Since Day One") wrap.
          year,
          token: token.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        redirectUrl?: string;
        error?: string;
      };
      if (res.ok && data.redirectUrl) {
        router.push(data.redirectUrl);
        return; // keep the spinner up through navigation
      }
      setError(friendlyError(data.error, res.status));
    } catch {
      setError("Network error. Check your connection and try again.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[30rem]">
      {/* The input is the hero moment: tall, a single clear field, emerald $
          prompt, a quiet year pill, and a soft emerald glow on focus. The
          action lives on its own line below so nothing feels crammed. */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-neutral-900/50 px-5 py-4 backdrop-blur transition-all ${
          focused
            ? "border-emerald-500/60 shadow-[0_0_0_4px_rgba(16,185,129,0.10),0_20px_50px_-20px_rgba(16,185,129,0.35)]"
            : "border-neutral-800 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)]"
        }`}
      >
        <span className="select-none font-mono text-xl font-medium text-emerald-400">
          @
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={SAMPLE_HANDLES[placeholderIdx]}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={loading}
          className="w-full min-w-0 bg-transparent font-mono text-xl text-neutral-50 placeholder:text-neutral-600 focus:outline-none disabled:opacity-50"
          aria-label="GitHub username"
        />
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <select
            value={year}
            onChange={(e) => {
              const v = e.target.value;
              setYear(v === "all" ? "all" : Number(v));
            }}
            disabled={loading}
            className="cursor-pointer appearance-none rounded-lg bg-neutral-800/80 py-1.5 pl-3 pr-7 font-mono text-sm text-neutral-300 transition-colors hover:bg-neutral-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
            aria-label="Year"
          >
            {/* All-time sits above the numeric years — the headline option. */}
            <option value="all">∞ all-time</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500">
            ▾
          </span>
        </div>
      </div>

      {/* Primary action. Big, confident, full width — the obvious next move. */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="group mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-50 py-4 text-base font-bold text-neutral-950 transition-all hover:bg-white active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950" />
            Reading commits…
          </>
        ) : (
          <>
            {buttonLabel}
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </>
        )}
      </button>

      {/* Private repos — quiet, opt-in, honest. */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => setShowToken((s) => !s)}
          aria-expanded={showToken}
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
            showToken
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-neutral-700 bg-neutral-900/70 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800/70 hover:text-neutral-100"
          }`}
        >
          <span aria-hidden className="text-[13px] leading-none">🔒</span>
          include private repos
          <span
            aria-hidden
            className={`text-[10px] leading-none transition-transform duration-200 ${
              showToken ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
        </button>
      </div>

      {showToken ? (
        <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950/70 p-3.5">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-black/40 px-3 py-2.5">
            <span className="select-none font-mono text-sm text-neutral-600">
              🔑
            </span>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent font-mono text-sm text-neutral-100 placeholder:text-neutral-700 focus:outline-none disabled:opacity-50"
              aria-label="GitHub personal access token"
            />
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-neutral-500">
            <span className="text-neutral-400">🔒 Used once, then discarded.</span>{" "}
            Never stored. Private repos only ever add to the totals, never names
            or messages. Make a read-only one →{" "}
            <a
              href="https://github.com/settings/tokens?type=beta"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-300 hover:underline"
            >
              create token
            </a>
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-center text-sm text-red-400">{error}</p>
      ) : null}
    </form>
  );
}
