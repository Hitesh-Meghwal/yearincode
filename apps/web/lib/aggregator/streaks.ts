import type { RawCommit } from "../types";

export type StreakResult = {
  longestStreak: { days: number; from: string; to: string };
  totalActiveDays: number;
};

function dayKey(iso: string): string {
  // YYYY-MM-DD in UTC. Aligns with the time-pattern aggregator (also UTC).
  return iso.slice(0, 10);
}

function addDaysIso(key: string, days: number): string {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function computeStreaks(commits: RawCommit[]): StreakResult {
  if (commits.length === 0) {
    return {
      longestStreak: { days: 0, from: "", to: "" },
      totalActiveDays: 0,
    };
  }

  const dayKeys = new Set<string>();
  for (const commit of commits) {
    dayKeys.add(dayKey(commit.committedDate));
  }

  const sortedDays = Array.from(dayKeys).sort();
  let bestLen = 1;
  let bestFrom = sortedDays[0];
  let bestTo = sortedDays[0];

  let curLen = 1;
  let curFrom = sortedDays[0];

  for (let i = 1; i < sortedDays.length; i += 1) {
    const prev = sortedDays[i - 1];
    const cur = sortedDays[i];
    if (addDaysIso(prev, 1) === cur) {
      curLen += 1;
    } else {
      curLen = 1;
      curFrom = cur;
    }
    if (curLen > bestLen) {
      bestLen = curLen;
      bestFrom = curFrom;
      bestTo = cur;
    }
  }

  return {
    longestStreak: { days: bestLen, from: bestFrom, to: bestTo },
    totalActiveDays: sortedDays.length,
  };
}
