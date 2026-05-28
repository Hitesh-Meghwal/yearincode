import Link from "next/link";
import SignOutLink from "../SignOutLink";

type Item = {
  year: number;
  isCurrent: boolean;
  owned: { viewCount: number } | null;
};

type Props = {
  username: string;
  items: Item[];
  joinYear: number | null;
  // Ownership of the all-time ("Since Day One") wrap, stored under year 0.
  allTimeOwned: { viewCount: number } | null;
};

export default function YearPicker({
  username,
  items,
  joinYear,
  allTimeOwned,
}: Props) {
  return (
    <main className="min-h-screen px-6 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Top utility row — sign out always reachable. */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-white transition-colors"
          >
            ← home
          </Link>
          <SignOutLink />
        </div>

        <header className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-300 mb-3">
            // pick a year
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] text-neutral-50">
            Which year do you want wrapped?
          </h1>
          <p className="mt-4 text-neutral-400 leading-relaxed">
            Each year is generated separately from your GitHub history. Pick
            the one you want, watch the loading screen, share the result.
          </p>
        </header>

        <ul className="border-y border-neutral-900 divide-y divide-neutral-900">
          {/* All-time leads the list — the whole career in one wrap. */}
          <AllTimeRow username={username} owned={allTimeOwned} />
          {items.map((item) => (
            <YearRow key={item.year} item={item} username={username} />
          ))}
        </ul>

        <p className="mt-6 text-xs text-neutral-600 font-mono">
          {joinYear
            ? `Showing every year since you joined GitHub in ${joinYear}.`
            : `Showing the most recent ${items.length} years.`}
          {" "}The current year is updated through today.
        </p>
      </div>
    </main>
  );
}

// The all-time row. Same shape as a YearRow but points at the `/all` slug
// (server-side year 0) and the year:"all" generate flow.
function AllTimeRow({
  username,
  owned,
}: {
  username: string;
  owned: { viewCount: number } | null;
}) {
  const sharePath = `/u/${username}/all`;

  return (
    <li className="grid grid-cols-[5ch_1fr_auto] items-center gap-5 py-5">
      <span className="font-mono text-2xl text-emerald-300 leading-none">∞</span>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-200 tracking-tight">
          All-time
          <span className="ml-2 text-xs font-normal text-neutral-500">
            Since Day One
          </span>
        </p>
        {owned ? (
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">
            {owned.viewCount} {owned.viewCount === 1 ? "view" : "views"}
            <span className="text-neutral-700"> · </span>
            <span className="truncate">{sharePath}</span>
          </p>
        ) : (
          <p className="text-xs text-neutral-600 mt-0.5">
            Your whole GitHub story in one wrap
          </p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {owned ? (
          <>
            <Link
              href="/generate?year=all&force=1"
              className="text-xs text-neutral-500 hover:text-white transition-colors"
              title="Regenerate this wrapped from fresh GitHub data"
            >
              Regenerate
            </Link>
            <Link
              href={sharePath}
              className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-100 hover:bg-neutral-900 transition-colors"
            >
              View →
            </Link>
          </>
        ) : (
          <Link
            href="/generate?year=all"
            className="inline-flex items-center justify-center rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition-colors"
          >
            Generate →
          </Link>
        )}
      </div>
    </li>
  );
}

function YearRow({ item, username }: { item: Item; username: string }) {
  const sharePath = `/u/${username}/${item.year}`;

  return (
    <li className="grid grid-cols-[5ch_1fr_auto] items-center gap-5 py-5">
      <span className="font-mono text-lg text-neutral-500 tabular-nums">
        {item.year}
      </span>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-200 tracking-tight">
          {item.isCurrent ? "Current year" : "Calendar year"}
          {item.isCurrent ? (
            <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ) : null}
        </p>
        {item.owned ? (
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">
            {item.owned.viewCount} {item.owned.viewCount === 1 ? "view" : "views"}
            <span className="text-neutral-700"> · </span>
            <span className="truncate">{sharePath}</span>
          </p>
        ) : (
          <p className="text-xs text-neutral-600 mt-0.5">
            Not generated yet
          </p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {item.owned ? (
          <>
            <Link
              href={`/generate?year=${item.year}&force=1`}
              className="text-xs text-neutral-500 hover:text-white transition-colors"
              title="Regenerate this wrapped from fresh GitHub data"
            >
              Regenerate
            </Link>
            <Link
              href={sharePath}
              className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-100 hover:bg-neutral-900 transition-colors"
            >
              View →
            </Link>
          </>
        ) : (
          <Link
            href={`/generate?year=${item.year}`}
            className="inline-flex items-center justify-center rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition-colors"
          >
            Generate →
          </Link>
        )}
      </div>
    </li>
  );
}
