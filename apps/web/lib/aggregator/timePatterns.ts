import type { RawCommit } from "../types";

export type TimePatterns = {
  peakHour: number;
  peakHourCommits: number;
  peakDayOfWeek: number;
  weekendRatio: number;
};

// GitHub returns `committedDate` as ISO 8601 in UTC. For v1 we use UTC for
// hour/day-of-week analysis — the PRD §4.4 says "user's local timezone" but
// per Checkpoint 2 we accept the approximation.
export function computeTimePatterns(commits: RawCommit[]): TimePatterns {
  if (commits.length === 0) {
    return {
      peakHour: 0,
      peakHourCommits: 0,
      peakDayOfWeek: 0,
      weekendRatio: 0,
    };
  }

  const hourCounts = new Array<number>(24).fill(0);
  const dayCounts = new Array<number>(7).fill(0);
  let weekendCount = 0;

  for (const commit of commits) {
    const date = new Date(commit.committedDate);
    const hour = date.getUTCHours();
    const dow = date.getUTCDay(); // 0=Sun … 6=Sat
    hourCounts[hour] += 1;
    dayCounts[dow] += 1;
    if (dow === 0 || dow === 6) weekendCount += 1;
  }

  let peakHour = 0;
  let peakHourCommits = 0;
  for (let h = 0; h < 24; h += 1) {
    if (hourCounts[h] > peakHourCommits) {
      peakHour = h;
      peakHourCommits = hourCounts[h];
    }
  }

  let peakDayOfWeek = 0;
  let peakDayCount = 0;
  for (let d = 0; d < 7; d += 1) {
    if (dayCounts[d] > peakDayCount) {
      peakDayOfWeek = d;
      peakDayCount = dayCounts[d];
    }
  }

  return {
    peakHour,
    peakHourCommits,
    peakDayOfWeek,
    weekendRatio: weekendCount / commits.length,
  };
}
