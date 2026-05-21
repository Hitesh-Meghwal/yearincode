import type {
  Archetype,
  ArchetypeId,
  ArchetypeRarity,
  CollaboratorStat,
  LanguageStat,
  RawCommit,
  RepoStat,
} from "./types";

export type ArchetypeInput = {
  peakHour: number;
  weekendRatio: number;
  longestStreakDays: number;
  totalAdditions: number;
  totalDeletions: number;
  topLanguages: LanguageStat[];
  topRepos: RepoStat[];
  totalCommits: number;
  totalActiveDays: number;
  topCollaborators: CollaboratorStat[];
  commits: RawCommit[];
};

type ArchetypeDef = Omit<Archetype, "id"> & { id: ArchetypeId };

const ARCHETYPES: Record<ArchetypeId, ArchetypeDef> = {
  "night-owl-refactorer": {
    id: "night-owl-refactorer",
    name: "The Night Owl Refactorer",
    emoji: "🦉",
    description:
      "Your best ideas come after midnight, when the rest of the world is asleep and the linter is the only thing watching.",
    rarity: "uncommon",
  },
  "weekend-warrior": {
    id: "weekend-warrior",
    name: "The Weekend Warrior",
    emoji: "⚔️",
    description:
      "Monday-to-Friday is the warmup. The real shipping happens when the office is empty.",
    rarity: "uncommon",
  },
  metronome: {
    id: "metronome",
    name: "The Metronome",
    emoji: "⏱️",
    description:
      "Day after day, week after week. Your contribution graph looks like a heartbeat.",
    rarity: "rare",
  },
  refactorer: {
    id: "refactorer",
    name: "The Refactorer",
    emoji: "🔥",
    description:
      "You delete more than you write. Less code is better code, and you live by it.",
    rarity: "rare",
  },
  polyglot: {
    id: "polyglot",
    name: "The Polyglot",
    emoji: "🌍",
    description:
      "Why pick one language when you can have them all? Your stack is more diverse than most companies.",
    rarity: "uncommon",
  },
  monolith: {
    id: "monolith",
    name: "The Monolith",
    emoji: "🗿",
    description:
      "One repo to rule them all. Focus is a virtue and you have it in abundance.",
    rarity: "common",
  },
  "dawn-patrol": {
    id: "dawn-patrol",
    name: "The Dawn Patrol",
    emoji: "🌅",
    description:
      "First commit lands before most people pour their coffee. The early bird gets the merge.",
    rarity: "uncommon",
  },
  "lunch-coder": {
    id: "lunch-coder",
    name: "The Lunch Hour Hero",
    emoji: "🥪",
    description:
      "Side projects don't build themselves — and apparently neither does lunch.",
    rarity: "common",
  },
  marathoner: {
    id: "marathoner",
    name: "The Marathoner",
    emoji: "🏃",
    description:
      "Thousands of commits this year. Pacing? Never heard of her.",
    rarity: "rare",
  },
  sprinter: {
    id: "sprinter",
    name: "The Sprinter",
    emoji: "💨",
    description:
      "When you ship, you SHIP. Bursts of 50+ commits in a single day.",
    rarity: "uncommon",
  },
  consistent: {
    id: "consistent",
    name: "The Consistent One",
    emoji: "📈",
    description:
      "You showed up almost every day. Discipline is a superpower.",
    rarity: "rare",
  },
  "social-coder": {
    id: "social-coder",
    name: "The Social Coder",
    emoji: "🤝",
    description:
      "Software is a team sport, and you're playing in midfield.",
    rarity: "common",
  },
  "lone-wolf": {
    id: "lone-wolf",
    name: "The Lone Wolf",
    emoji: "🐺",
    description:
      "You and your editor, alone in the woods. Building.",
    rarity: "common",
  },
  "globe-trotter": {
    id: "globe-trotter",
    name: "The Globe Trotter",
    emoji: "✈️",
    description:
      "Your commit times look like a frequent-flyer log. The world is your office.",
    rarity: "legendary",
  },
  default: {
    id: "default",
    name: "The Builder",
    emoji: "🔨",
    description:
      "Heads down, shipping. Every commit moves the needle a little bit further.",
    rarity: "common",
  },
};

function maxCommitsInOneDay(commits: RawCommit[]): number {
  if (commits.length === 0) return 0;
  const counts: Record<string, number> = {};
  for (const c of commits) {
    const day = c.committedDate.slice(0, 10);
    counts[day] = (counts[day] ?? 0) + 1;
  }
  return Math.max(...Object.values(counts));
}

function hourSpreadSignature(commits: RawCommit[]): {
  busyBuckets: number;
  peakShare: number;
} {
  if (commits.length < 50) return { busyBuckets: 0, peakShare: 1 };
  const buckets = new Array<number>(24).fill(0);
  for (const c of commits) {
    const h = new Date(c.committedDate).getUTCHours();
    buckets[h] += 1;
  }
  const threshold = commits.length * 0.03;
  const busyBuckets = buckets.filter((n) => n >= threshold).length;
  const peakShare = Math.max(...buckets) / commits.length;
  return { busyBuckets, peakShare };
}

export function detectArchetype(input: ArchetypeInput): Archetype {
  const {
    peakHour,
    weekendRatio,
    longestStreakDays,
    totalAdditions,
    totalDeletions,
    topLanguages,
    topRepos,
    totalCommits,
    totalActiveDays,
    topCollaborators,
    commits,
  } = input;

  const topRepoShare =
    topRepos.length > 0 && totalCommits > 0
      ? topRepos[0].commits / totalCommits
      : 0;
  const topLanguageShare =
    topLanguages.length > 0 ? topLanguages[0].percentage / 100 : 0;
  const distinctLanguages = topLanguages.length;
  const topCollaboratorCount = topCollaborators[0]?.sharedCommits ?? 0;

  // Priority order matches PRD §4.5.
  if (peakHour >= 0 && peakHour <= 5 && weekendRatio < 0.3) {
    return ARCHETYPES["night-owl-refactorer"];
  }
  if (weekendRatio > 0.6) {
    return ARCHETYPES["weekend-warrior"];
  }
  if (longestStreakDays > 90) {
    return ARCHETYPES.metronome;
  }
  if (totalAdditions > 0 && totalDeletions > totalAdditions * 1.5) {
    return ARCHETYPES.refactorer;
  }
  if (topLanguageShare > 0 && topLanguageShare < 0.4 && distinctLanguages >= 4) {
    return ARCHETYPES.polyglot;
  }
  if (topRepoShare > 0.7) {
    return ARCHETYPES.monolith;
  }
  if (peakHour >= 5 && peakHour < 9) {
    return ARCHETYPES["dawn-patrol"];
  }
  if (peakHour === 12 || peakHour === 13) {
    return ARCHETYPES["lunch-coder"];
  }
  if (totalCommits > 2000) {
    return ARCHETYPES.marathoner;
  }
  if (maxCommitsInOneDay(commits) > 50) {
    return ARCHETYPES.sprinter;
  }
  if (totalActiveDays > 250) {
    return ARCHETYPES.consistent;
  }
  if (topCollaboratorCount > 50) {
    return ARCHETYPES["social-coder"];
  }
  if (topCollaborators.length === 0 && totalCommits > 0) {
    return ARCHETYPES["lone-wolf"];
  }
  const spread = hourSpreadSignature(commits);
  if (spread.busyBuckets >= 14 && spread.peakShare < 0.1) {
    return ARCHETYPES["globe-trotter"];
  }
  return ARCHETYPES.default;
}

export const ARCHETYPE_REGISTRY: Record<ArchetypeId, ArchetypeDef> = ARCHETYPES;
export type { ArchetypeRarity };
