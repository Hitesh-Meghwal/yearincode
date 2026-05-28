import type { Archetype, ArchetypeId } from "./types";

// Lifetime ("Since Day One") archetypes. Unlike the yearly engine — which
// reads a single year's *behavior pattern* — these reward tenure and scale
// across a whole GitHub career. Run over lifetime totals so the reveal feels
// like a career achievement, not "you commit on weekends."

export type LifetimeArchetypeInput = {
  totalCommits: number; // lifetime
  accountCreatedYear: number; // GitHub join year
  currentYear: number;
  activeYears: number[]; // calendar years with >= 1 commit (any order)
};

type LifetimeArchetypeDef = Omit<Archetype, "id"> & { id: ArchetypeId };

const ARCHETYPES: Record<string, LifetimeArchetypeDef> = {
  architect: {
    id: "architect",
    name: "The Architect",
    emoji: "🏛️",
    description:
      "Ten thousand commits and counting. You didn't just use the tools, you built the cathedral.",
    rarity: "legendary",
  },
  og: {
    id: "og",
    name: "The OG",
    emoji: "🧬",
    description:
      "On GitHub before it was cool, and still shipping. You remember when the contribution graph was new.",
    rarity: "legendary",
  },
  veteran: {
    id: "veteran",
    name: "The Veteran",
    emoji: "🎖️",
    description:
      "Years deep and still in the trenches. Frameworks came and went; you kept committing.",
    rarity: "rare",
  },
  lifer: {
    id: "lifer",
    name: "The Lifer",
    emoji: "♾️",
    description:
      "Every single year since you joined has a commit in it. Not one gap year. Relentless.",
    rarity: "rare",
  },
  prolific: {
    id: "prolific",
    name: "The Prolific",
    emoji: "🚀",
    description:
      "Thousands of commits across your career. Output is your love language.",
    rarity: "rare",
  },
  comeback: {
    id: "comeback",
    name: "The Comeback",
    emoji: "🔁",
    description:
      "You went quiet, then came back swinging. The arc has a second act.",
    rarity: "uncommon",
  },
  journeyman: {
    id: "journeyman",
    name: "The Journeyman",
    emoji: "🧭",
    description:
      "A few solid years on the board. Past the rookie phase, into the craft.",
    rarity: "uncommon",
  },
  rookie: {
    id: "rookie",
    name: "The Rookie",
    emoji: "🌱",
    description:
      "Fresh on GitHub and already shipping. The whole story is ahead of you.",
    rarity: "common",
  },
  builder: {
    id: "builder",
    name: "The Builder",
    emoji: "🔨",
    description:
      "Heads down, year after year. No single pattern dominates, you just build.",
    rarity: "common",
  },
};

export function detectLifetimeArchetype(
  input: LifetimeArchetypeInput,
): Archetype {
  const { totalCommits, accountCreatedYear, currentYear, activeYears } = input;
  const accountAge = Math.max(0, currentYear - accountCreatedYear);
  const yearsActive = new Set(activeYears).size;

  const sorted = [...new Set(activeYears)].sort((a, b) => a - b);
  const firstActive = sorted[0] ?? currentYear;
  const lastActive = sorted[sorted.length - 1] ?? currentYear;
  const stillActive = lastActive >= currentYear - 1;

  // "No gap year" = active every calendar year from join → now.
  const expectedSpan = currentYear - accountCreatedYear + 1;
  const noGaps = yearsActive >= expectedSpan && accountAge >= 3;

  // A dormant year (gap) somewhere between first and last activity.
  const hasGap = sorted.some((y, i) => i > 0 && y - sorted[i - 1] > 1);

  // Priority order — first match wins. Rarest / grandest flexes first.
  if (totalCommits >= 10000) return ARCHETYPES.architect;
  if (accountCreatedYear < 2013 && stillActive) return ARCHETYPES.og;
  if (accountAge >= 8 && yearsActive >= Math.ceil(accountAge * 0.5)) {
    return ARCHETYPES.veteran;
  }
  if (noGaps) return ARCHETYPES.lifer;
  if (totalCommits >= 5000) return ARCHETYPES.prolific;
  if (hasGap && stillActive && accountAge >= 3) return ARCHETYPES.comeback;
  if (accountAge >= 4) return ARCHETYPES.journeyman;
  if (accountAge < 2) return ARCHETYPES.rookie;
  return ARCHETYPES.builder;
}

export const LIFETIME_ARCHETYPE_REGISTRY = ARCHETYPES;
