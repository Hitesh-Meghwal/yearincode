export type ArchetypeId =
  | "night-owl-refactorer"
  | "weekend-warrior"
  | "metronome"
  | "refactorer"
  | "polyglot"
  | "monolith"
  | "dawn-patrol"
  | "lunch-coder"
  | "marathoner"
  | "sprinter"
  | "consistent"
  | "social-coder"
  | "lone-wolf"
  | "globe-trotter"
  | "default";

export type ArchetypeRarity = "common" | "uncommon" | "rare" | "legendary";

export type Archetype = {
  id: ArchetypeId;
  name: string;
  emoji: string;
  description: string;
  rarity: ArchetypeRarity;
};

export type LanguageStat = {
  name: string;
  commits: number;
  percentage: number;
};

export type RepoStat = {
  name: string;
  commits: number;
  isPrivate: boolean;
};

export type CollaboratorStat = {
  username: string;
  sharedCommits: number;
};

export type CommitMessageMarker = {
  text: string;
  sha: string;
  repo: string;
};

export type WrappedStats = {
  // Identity
  username: string;
  avatarUrl: string;
  year: number;
  generatedAt: string;
  dateRange: { from: string; to: string };

  // Totals
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  netLines: number;
  totalRepos: number;
  totalActiveDays: number;

  // Time patterns
  peakHour: number;
  peakHourCommits: number;
  peakDayOfWeek: number;
  weekendRatio: number;
  longestStreak: { days: number; from: string; to: string };

  // Language breakdown
  topLanguages: LanguageStat[];

  // Repository ranking
  topRepos: RepoStat[];

  // Collaboration
  topCollaborators: CollaboratorStat[];

  // The vibe check
  archetype: Archetype;

  // Fun stats
  longestCommitMessage: CommitMessageMarker;
  shortestCommitMessage: CommitMessageMarker;
  totalCommitMessages: {
    exclamations: number;
    questions: number;
    allCaps: number;
  };
};

// ---------------------------------------------------------------------------
// Intermediate shapes used by the aggregator (not part of the public output).
// ---------------------------------------------------------------------------

export type RawCommit = {
  sha: string;
  repo: string; // "owner/name"
  repoIsPrivate: boolean;
  author: string | null; // GitHub login of the committer (may be null for unattributed)
  messageHeadline: string;
  committedDate: string; // ISO 8601, UTC
  additions: number;
  deletions: number;
};

export type RepoLanguageBreakdown = {
  repo: string; // "owner/name"
  primaryLanguage: string | null;
  // Map of language name -> bytes (from GraphQL `languages` connection)
  languageBytes: Record<string, number>;
};

export type FetchResult = {
  username: string;
  avatarUrl: string;
  userCommits: RawCommit[];
  // Co-contributor commits in the user's repos (used to compute collaborators)
  coContributorCommitsByLogin: Record<string, number>;
  repoLanguages: RepoLanguageBreakdown[];
};
