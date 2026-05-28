export type ArchetypeId =
  // Yearly archetypes (behavior pattern in a single year).
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
  | "default"
  // Lifetime archetypes ("Since Day One" — tenure + scale over a career).
  | "architect"
  | "og"
  | "veteran"
  | "lifer"
  | "prolific"
  | "comeback"
  | "journeyman"
  | "rookie"
  | "builder";

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
  // Calendar year for a yearly wrap. For the all-time "Since Day One" wrap
  // this is the sentinel 0 (the public URL uses the slug `/u/{username}/all`).
  year: number;
  generatedAt: string;
  dateRange: { from: string; to: string };

  // All-time ("Since Day One") metadata. Present only when isAllTime is true;
  // a normal yearly wrap leaves these undefined. dateRange spans the GitHub
  // join date → now, and `archetype` is drawn from the lifetime engine
  // (lib/archetypesLifetime.ts) rather than the yearly one.
  isAllTime?: boolean;
  accountCreatedYear?: number; // GitHub join year
  yearsActive?: number; // distinct calendar years with >= 1 commit
  firstActiveYear?: number;
  lastActiveYear?: number;

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

  // Discipline score (0–100) derived from active days, longest streak,
  // commit volume, and weekend balance. See lib/aggregator/index.ts.
  disciplineScore: number;

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
