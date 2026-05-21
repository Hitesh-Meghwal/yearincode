// Small marketing strip on the landing page that explains the "vibe check"
// (PRD §4.5). Hand-picked subset of the 15 archetypes — punchy mix of
// rarities — with a one-line "trigger" so visitors get the gist.

type Card = {
  emoji: string;
  name: string;
  trigger: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  accent: string; // tailwind text color class
  bg: string;    // tailwind background tint class
};

const CARDS: Card[] = [
  {
    emoji: "🦉",
    name: "The Night Owl Refactorer",
    trigger: "Peaks past midnight, light on weekends.",
    rarity: "uncommon",
    accent: "text-violet-300",
    bg: "from-violet-500/15 to-transparent",
  },
  {
    emoji: "⚔️",
    name: "The Weekend Warrior",
    trigger: "More than 60% of your commits land Sat / Sun.",
    rarity: "uncommon",
    accent: "text-red-300",
    bg: "from-red-500/15 to-transparent",
  },
  {
    emoji: "⏱️",
    name: "The Metronome",
    trigger: "A streak longer than 90 days straight.",
    rarity: "rare",
    accent: "text-cyan-300",
    bg: "from-cyan-500/15 to-transparent",
  },
  {
    emoji: "🌍",
    name: "The Polyglot",
    trigger: "No single language above 40%, 4+ in rotation.",
    rarity: "uncommon",
    accent: "text-emerald-300",
    bg: "from-emerald-500/15 to-transparent",
  },
  {
    emoji: "🔥",
    name: "The Refactorer",
    trigger: "Deletions outweigh additions by 1.5×.",
    rarity: "rare",
    accent: "text-orange-300",
    bg: "from-orange-500/15 to-transparent",
  },
  {
    emoji: "🏃",
    name: "The Marathoner",
    trigger: "2,000+ commits in a single year.",
    rarity: "rare",
    accent: "text-pink-300",
    bg: "from-pink-500/15 to-transparent",
  },
  {
    emoji: "🐺",
    name: "The Lone Wolf",
    trigger: "You shipped this year with zero co-committers.",
    rarity: "common",
    accent: "text-zinc-200",
    bg: "from-zinc-500/15 to-transparent",
  },
  {
    emoji: "✈️",
    name: "The Globe Trotter",
    trigger: "Commits scattered across so many hours, your timezone is anywhere.",
    rarity: "legendary",
    accent: "text-yellow-300",
    bg: "from-yellow-500/15 to-transparent",
  },
];

const RARITY_LABEL: Record<Card["rarity"], string> = {
  common: "COMMON",
  uncommon: "UNCOMMON",
  rare: "RARE ✨",
  legendary: "LEGENDARY ✨",
};

export default function ArchetypeShowcase() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p className="uppercase tracking-[0.3em] text-xs text-pink-300 mb-3">
            The vibe check
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            What kind of developer were you this year?
          </h2>
          <p className="mt-4 text-neutral-300 max-w-2xl mx-auto">
            We crunch your commit patterns — when you ship, what you ship, how
            much you delete — and crown you with one of 15 archetypes. From
            Night Owl Refactorer to Globe Trotter. The rarer ones are hard to
            earn.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <li
              key={card.name}
              className={`rounded-2xl border border-neutral-800 bg-gradient-to-br ${card.bg} p-5 backdrop-blur-sm`}
            >
              <div className="text-3xl mb-3">{card.emoji}</div>
              <div className={`text-base font-semibold ${card.accent}`}>
                {card.name}
              </div>
              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                {card.trigger}
              </p>
              <div className="mt-4 inline-flex text-[10px] font-bold tracking-wider text-neutral-500">
                {RARITY_LABEL[card.rarity]}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-neutral-500">
          + 7 more archetypes waiting to be unlocked.
        </p>
      </div>
    </section>
  );
}
