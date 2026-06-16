"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FollowDiff, GithubUser } from "@/lib/github/ghosts";

const SAMPLE_HANDLES = ["torvalds", "gaearon", "sindresorhus", "tj", "antfu"];

type TabKey = "ghosts" | "fans" | "mutuals";

const TABS: Array<{
  key: TabKey;
  emoji: string;
  label: string;
  blurb: string;
  empty: string;
  accent: string;
}> = [
  {
    key: "ghosts",
    emoji: "👻",
    label: "Ghosts",
    blurb: "You follow them, they don't follow you back.",
    empty: "No ghosts — everyone you follow follows you back.",
    accent: "text-pink-300",
  },
  {
    key: "fans",
    emoji: "⭐",
    label: "Fans",
    blurb: "They follow you, you don't follow them back.",
    empty: "No fans yet — you follow back everyone who follows you.",
    accent: "text-amber-300",
  },
  {
    key: "mutuals",
    emoji: "🤝",
    label: "Mutuals",
    blurb: "You both follow each other.",
    empty: "No mutuals yet.",
    accent: "text-emerald-300",
  },
];

function friendlyError(code: string | undefined): string {
  switch (code) {
    case "not-found":
      return "No GitHub user by that name.";
    case "rate-limit":
      return "Too many lookups in a short window. Give it a minute.";
    case "network":
      return "Couldn't reach GitHub. Check your connection.";
    case "config":
      return "The follow-back checker isn't configured on the server yet.";
    default:
      return "Something went wrong. Try again.";
  }
}

// Append a size param so the grid fetches small avatars, not full-res ones.
function avatarSrc(url: string): string {
  return url.includes("?") ? `${url}&s=96` : `${url}?s=96`;
}

export default function GhostsClient({
  prefillUsername = null,
}: {
  prefillUsername?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diff, setDiff] = useState<FollowDiff | null>(null);
  const [tab, setTab] = useState<TabKey>("ghosts");
  const [focused, setFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const lookup = useCallback(
    async (rawHandle: string) => {
      const handle = rawHandle.trim().replace(/^@/, "");
      if (!handle) return;

      setLoading(true);
      setError(null);
      setDiff(null);
      try {
        const res = await fetch(`/api/ghosts?u=${encodeURIComponent(handle)}`);
        const data = (await res.json().catch(() => ({}))) as
          | FollowDiff
          | { error?: string };
        if (res.ok && "username" in data) {
          setDiff(data);
          setTab("ghosts");
          // Reflect the looked-up handle in the URL so results are linkable,
          // without adding a history entry per lookup.
          router.replace(`/ghosts?u=${encodeURIComponent(data.username)}`, {
            scroll: false,
          });
        } else {
          setError(
            friendlyError("error" in data ? data.error : undefined),
          );
        }
      } catch {
        setError("Network error. Check your connection and try again.");
      }
      setLoading(false);
    },
    [router],
  );

  // On mount (once): a ?u= in the URL wins so shared links resolve to the
  // linked user. Otherwise, if the visitor is signed in, prefill + auto-run
  // their own handle so the checker is zero-effort.
  const ranInitial = useRef(false);
  useEffect(() => {
    if (ranInitial.current) return;
    ranInitial.current = true;
    const initial = searchParams.get("u") ?? prefillUsername;
    if (initial) {
      setUsername(initial);
      void lookup(initial);
    }
  }, [searchParams, prefillUsername, lookup]);

  // Cycle the placeholder handle while the field is empty + unfocused.
  useEffect(() => {
    if (username || focused) return;
    const id = setInterval(
      () => setPlaceholderIdx((i) => (i + 1) % SAMPLE_HANDLES.length),
      2600,
    );
    return () => clearInterval(id);
  }, [username, focused]);

  // Detect browser autofill — Chrome/Edge can prefill the input visually
  // without firing React's onChange, leaving `username` state empty (so the
  // submit button stays disabled despite the field looking filled). After
  // mount, read the DOM value and sync it into state if there's a mismatch.
  useEffect(() => {
    const t = setTimeout(() => {
      const v = inputRef.current?.value ?? "";
      if (v && !username) setUsername(v);
    }, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = username.trim().length > 0 && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    void lookup(username);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[30rem]">
        <div
          onClick={() => inputRef.current?.focus()}
          className={`flex items-center gap-3 rounded-2xl border bg-neutral-900/50 px-5 py-4 backdrop-blur transition-all ${
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
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="group mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-50 py-4 text-base font-bold text-neutral-950 transition-all hover:bg-white active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950" />
              Checking follows…
            </>
          ) : (
            <>
              <span className="min-w-0 truncate">
                {username.trim()
                  ? `Check @${username.trim()}`
                  : "Check follows"}
              </span>
              <span className="shrink-0 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </>
          )}
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      ) : null}

      {diff ? <Results diff={diff} tab={tab} setTab={setTab} /> : null}
    </div>
  );
}

function Results({
  diff,
  tab,
  setTab,
}: {
  diff: FollowDiff;
  tab: TabKey;
  setTab: (t: TabKey) => void;
}) {
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  const counts: Record<TabKey, number> = {
    ghosts: diff.ghosts.length,
    fans: diff.fans.length,
    mutuals: diff.mutuals.length,
  };

  // Empty-account fast path: when the user follows nobody AND has no
  // followers, every tab and every count is vacuously zero. The per-tab
  // "everyone follows you back" copy reads broken in that case, so we
  // short-circuit to a clearer "fresh account" message instead.
  if (diff.followingCount === 0 && diff.followerCount === 0) {
    return (
      <div className="mt-10 text-left">
        <div className="rise rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-center backdrop-blur-sm">
          <p className="truncate font-mono text-xs uppercase tracking-wider text-neutral-500">
            @{diff.username}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight">
            <span className="text-pink-400">Fresh account.</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            @{diff.username} doesn&apos;t follow anyone and has no followers yet,
            so there&apos;s nothing to diff. Try a more active handle to see the
            checker in action.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {SAMPLE_HANDLES.map((h) => (
              <a
                key={h}
                href={`/ghosts?u=${encodeURIComponent(h)}`}
                className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 font-mono text-xs text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-800/70 hover:text-neutral-100"
              >
                @{h}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const active = TABS.find((t) => t.key === tab)!;
  const list = diff[tab];

  return (
    <div className="mt-10 text-left">
      {/* Summary — the ghost count is the hook. */}
      <div className="rise rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 backdrop-blur-sm sm:p-6">
        <p className="truncate font-mono text-xs uppercase tracking-wider text-neutral-500">
          @{diff.username}
        </p>
        <p className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
          <span className="text-pink-400">{fmt(counts.ghosts)}</span>{" "}
          {counts.ghosts === 1 ? "ghost" : "ghosts"} 👻
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm text-neutral-400">
          <span>
            <span className="text-neutral-200">{fmt(diff.followingCount)}</span>{" "}
            following
          </span>
          <span>
            <span className="text-neutral-200">{fmt(diff.followerCount)}</span>{" "}
            followers
          </span>
          <span>
            <span className="text-emerald-300">{fmt(counts.mutuals)}</span>{" "}
            mutuals
          </span>
        </div>
        {diff.truncated ? (
          <p className="mt-3 text-xs text-amber-300/80">
            This account is large — results are capped at the first few thousand
            on each list, so some entries may be missing.
          </p>
        ) : null}
      </div>

      {/* Tabs. Each is an equal-width column; on very narrow screens the text
          label is hidden so the emoji + count badge always fit without
          overflow. min-w-0 lets the flex children shrink below content size. */}
      <div
        role="tablist"
        aria-label="Follow-back lists"
        className="mt-6 flex gap-2"
      >
        {TABS.map((t) => {
          const selected = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(t.key)}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors sm:gap-1.5 sm:px-3 ${
                selected
                  ? "border-neutral-600 bg-neutral-800/80 text-neutral-50"
                  : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
              }`}
            >
              <span aria-hidden>{t.emoji}</span>
              <span className="hidden truncate min-[380px]:inline">
                {t.label}
              </span>
              <span
                className={`ml-0.5 shrink-0 rounded-md px-1.5 py-0.5 font-mono text-xs ${
                  selected
                    ? "bg-neutral-900 text-neutral-300"
                    : "bg-neutral-900/70 text-neutral-500"
                }`}
              >
                {fmt(counts[t.key])}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-neutral-500">{active.blurb}</p>

      {/* Grid / empty state */}
      {list.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 px-4 py-10 text-center text-sm text-neutral-500">
          {active.empty}
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-3">
          {list.map((u) => (
            <UserCell key={u.login} user={u} />
          ))}
        </ul>
      )}
    </div>
  );
}

function UserCell({ user }: { user: GithubUser }) {
  return (
    <li>
      <a
        href={user.html_url}
        target="_blank"
        rel="noreferrer noopener"
        className="flex min-w-0 items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2.5 transition-colors hover:border-neutral-700 hover:bg-neutral-900/70"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc(user.avatar_url)}
          alt=""
          aria-hidden="true"
          width={36}
          height={36}
          loading="lazy"
          className="h-9 w-9 shrink-0 rounded-full bg-neutral-800"
        />
        <span className="min-w-0 truncate font-mono text-sm text-neutral-200">
          {user.login}
        </span>
      </a>
    </li>
  );
}
