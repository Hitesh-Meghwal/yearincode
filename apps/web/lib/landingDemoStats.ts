import type { WrappedStats } from "./types";

// Synthetic wrapped used by the landing-page sample iframe. NOT tied to any
// real GitHub user — so the homepage can ship a polished, predictable demo
// without exposing the maintainer's (or any first user's) commit data.
//
// Numbers are tuned to:
//   - Trigger the Polyglot archetype (no language above 40%, 4+ in rotation)
//   - Land a healthy 78/100 discipline score
//   - Show a believable 23-day streak
//   - Spread cleanly across all 11 slides so first-time visitors see the deck
//     at its best.
export const LANDING_DEMO_STATS: WrappedStats = {
  username: "octocat",
  avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
  year: 2026,
  generatedAt: "2026-05-21T00:00:00.000Z",
  dateRange: {
    from: "2026-01-01T00:00:00.000Z",
    to: "2026-05-21T00:00:00.000Z",
  },

  totalCommits: 1247,
  totalAdditions: 84231,
  totalDeletions: 12108,
  netLines: 72123,
  totalRepos: 23,
  totalActiveDays: 184,

  peakHour: 14,
  peakHourCommits: 312,
  peakDayOfWeek: 3,
  weekendRatio: 0.22,

  longestStreak: {
    days: 23,
    from: "2026-02-09",
    to: "2026-03-03",
  },

  disciplineScore: 78,

  topLanguages: [
    { name: "TypeScript", commits: 281, percentage: 22.5 },
    { name: "Python", commits: 240, percentage: 19.2 },
    { name: "Rust", commits: 210, percentage: 16.8 },
    { name: "Go", commits: 180, percentage: 14.4 },
    { name: "Elixir", commits: 150, percentage: 12.0 },
  ],

  topRepos: [
    { name: "octocat/atomic-engine", commits: 412, isPrivate: true },
    { name: "octocat/dotfiles", commits: 218, isPrivate: false },
    { name: "octocat/notes", commits: 184, isPrivate: true },
    { name: "octocat/sandbox", commits: 96, isPrivate: false },
    { name: "octocat/scripts", commits: 41, isPrivate: true },
  ],

  topCollaborators: [
    { username: "monalisa", sharedCommits: 84 },
    { username: "spectre", sharedCommits: 31 },
    { username: "hubot", sharedCommits: 12 },
  ],

  archetype: {
    id: "polyglot",
    name: "The Polyglot",
    emoji: "🌍",
    description:
      "Why pick one language when you can have them all? Your stack is more diverse than most companies.",
    rarity: "uncommon",
  },

  longestCommitMessage: {
    text: "refactor: extract token pipeline into its own module",
    sha: "abc123",
    repo: "octocat/atomic-engine",
  },
  shortestCommitMessage: {
    text: "wip",
    sha: "def456",
    repo: "octocat/sandbox",
  },
  totalCommitMessages: {
    exclamations: 12,
    questions: 5,
    allCaps: 3,
  },
};
