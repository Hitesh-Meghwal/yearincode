import { detectArchetype } from "../archetypes";
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

    topLanguages,
    topRepos,
    topCollaborators,

    archetype,

    longestCommitMessage: messageStats.longestCommitMessage,
    shortestCommitMessage: messageStats.shortestCommitMessage,
    totalCommitMessages: messageStats.totalCommitMessages,
  };
}
