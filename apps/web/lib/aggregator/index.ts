import { detectArchetype } from "../archetypes";
import { detectLifetimeArchetype } from "../archetypesLifetime";
import type {
  CommitMessageMarker,
  FetchResult,
  RawCommit,
  RepoStat,
  WrappedStats,
} from "../types";
import { computeTopCollaborators } from "./collaborators";
import { computeTopLanguages } from "./languages";
import { computeStreaks } from "./streaks";
import { computeTimePatterns } from "./timePatterns";

const PLACEHOLDER_MARKER: CommitMessageMarker = {
  text: "",
  sha: "",
  repo: "",
};

function computeTopRepos(commits: RawCommit[], limit = 5): RepoStat[] {
  const counts: Record<string, { count: number; isPrivate: boolean }> = {};
  for (const c of commits) {
    const entry = counts[c.repo] ?? { count: 0, isPrivate: c.repoIsPrivate };
    entry.count += 1;
    entry.isPrivate = c.repoIsPrivate;
    counts[c.repo] = entry;
  }
  return Object.entries(counts)
    .map(([name, v]) => ({ name, commits: v.count, isPrivate: v.isPrivate }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, limit);
}

/**
 * Discipline score, 0–100. Derived from four pillars that already exist in
 * the aggregator output, no extra GitHub API calls.
 *
 *   40%  consistency       active days / 250 (PRD §4.5 "Consistent One" cutoff)
 *   30%  longest streak    streak / 30 days
 *   20%  volume            commits / 500
 *   10%  weekend balance   distance from a "natural" 28.6% weekend share
 *
 * Each pillar clamped to [0, 1] before weighting. A perfect score (~100)
 * means: active most days of the year, long streaks, real volume, and a
 * weekday/weekend split that looks like an actual sustainable rhythm.
 */
function computeDisciplineScore(args: {
  activeDays: number;
  longestStreakDays: number;
  totalCommits: number;
  weekendRatio: number;
}): number {
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

  const consistency = clamp01(args.activeDays / 250);
  const streak = clamp01(args.longestStreakDays / 30);
  const volume = clamp01(args.totalCommits / 500);
  // Natural weekend share = 2/7 ≈ 0.286. Score peaks there, drops linearly
  // to 0 at the extremes (0% or 100% weekend ratio).
  const NATURAL = 2 / 7;
  const balance = clamp01(1 - Math.abs(args.weekendRatio - NATURAL) / NATURAL);

  const score =
    0.40 * consistency +
    0.30 * streak +
    0.20 * volume +
    0.10 * balance;

  return Math.round(score * 100);
}

function computeCommitMessageStats(commits: RawCommit[]) {
  let longest: CommitMessageMarker = PLACEHOLDER_MARKER;
  let shortest: CommitMessageMarker = PLACEHOLDER_MARKER;
  let exclamations = 0;
  let questions = 0;
  let allCaps = 0;

  for (const c of commits) {
    const msg = c.messageHeadline ?? "";
    if (msg.includes("!")) exclamations += 1;
    if (msg.includes("?")) questions += 1;
    if (msg.length >= 4 && msg === msg.toUpperCase() && /[A-Z]/.test(msg)) {
      allCaps += 1;
    }
    if (!longest.text || msg.length > longest.text.length) {
      longest = { text: msg, sha: c.sha, repo: c.repo };
    }
    if (
      msg.length > 0 &&
      (shortest === PLACEHOLDER_MARKER || msg.length < shortest.text.length)
    ) {
      shortest = { text: msg, sha: c.sha, repo: c.repo };
    }
  }

  return {
    longestCommitMessage: longest,
    shortestCommitMessage: shortest,
    totalCommitMessages: { exclamations, questions, allCaps },
  };
}

export function aggregateWrappedStats(
  fetch: FetchResult,
  dateRange: { from: Date; to: Date },
): WrappedStats {
  const commits = fetch.userCommits;
  const totalAdditions = commits.reduce((s, c) => s + c.additions, 0);
  const totalDeletions = commits.reduce((s, c) => s + c.deletions, 0);

  const timePatterns = computeTimePatterns(commits);
  const streaks = computeStreaks(commits);
  const topLanguages = computeTopLanguages(commits, fetch.repoLanguages);
  const topRepos = computeTopRepos(commits);
  const topCollaborators = computeTopCollaborators(
    fetch.coContributorCommitsByLogin,
  );
  const messageStats = computeCommitMessageStats(commits);
  const totalRepos = new Set(commits.map((c) => c.repo)).size;
  const disciplineScore = computeDisciplineScore({
    activeDays: streaks.totalActiveDays,
    longestStreakDays: streaks.longestStreak.days,
    totalCommits: commits.length,
    weekendRatio: timePatterns.weekendRatio,
  });

  const archetype = detectArchetype({
    peakHour: timePatterns.peakHour,
    weekendRatio: timePatterns.weekendRatio,
    longestStreakDays: streaks.longestStreak.days,
    totalAdditions,
    totalDeletions,
    topLanguages,
    topRepos,
    totalCommits: commits.length,
    totalActiveDays: streaks.totalActiveDays,
    topCollaborators,
    commits,
  });

  return {
    username: fetch.username,
    avatarUrl: fetch.avatarUrl,
    year: dateRange.to.getUTCFullYear(),
    generatedAt: new Date().toISOString(),
    dateRange: {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    },

    totalCommits: commits.length,
    totalAdditions,
    totalDeletions,
    netLines: totalAdditions - totalDeletions,
    totalRepos,
    totalActiveDays: streaks.totalActiveDays,

    peakHour: timePatterns.peakHour,
    peakHourCommits: timePatterns.peakHourCommits,
    peakDayOfWeek: timePatterns.peakDayOfWeek,
    weekendRatio: timePatterns.weekendRatio,
    longestStreak: streaks.longestStreak,

    disciplineScore,

    topLanguages,
    topRepos,
    topCollaborators,

    archetype,

    longestCommitMessage: messageStats.longestCommitMessage,
    shortestCommitMessage: messageStats.shortestCommitMessage,
    totalCommitMessages: messageStats.totalCommitMessages,
  };
}

/**
 * All-time ("Since Day One") aggregation. Reuses the yearly aggregator over the
 * full join-date → now span for every numeric stat, then overrides the
 * year-specific bits: the sentinel `year = 0`, the lifetime metadata, and the
 * archetype (drawn from the tenure-aware lifetime engine, not the yearly one).
 */
export function aggregateAllTimeStats(
  fetch: FetchResult,
  accountCreatedYear: number,
  now: Date,
): WrappedStats {
  const stats = aggregateWrappedStats(fetch, {
    from: new Date(Date.UTC(accountCreatedYear, 0, 1)),
    to: now,
  });

  // Distinct calendar years (UTC) with >= 1 commit, ascending.
  const activeYears = [
    ...new Set(
      fetch.userCommits.map((c) =>
        new Date(c.committedDate).getUTCFullYear(),
      ),
    ),
  ].sort((a, b) => a - b);

  stats.year = 0;
  stats.isAllTime = true;
  stats.accountCreatedYear = accountCreatedYear;
  stats.yearsActive = activeYears.length;
  stats.firstActiveYear = activeYears[0];
  stats.lastActiveYear = activeYears[activeYears.length - 1];

  stats.archetype = detectLifetimeArchetype({
    totalCommits: stats.totalCommits,
    accountCreatedYear,
    currentYear: now.getUTCFullYear(),
    activeYears,
  });

  return stats;
}
