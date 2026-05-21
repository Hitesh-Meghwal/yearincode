// Marketing strip on the landing page that explains the "vibe check"
// (PRD §4.5). All 15 archetypes in the priority order the rules engine
// evaluates — first match wins.

type Card = {
  emoji: string;
  name: string;
  trigger: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  accent: string; // tailwind text color
  bg: string;    // tailwind background tint
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
    emoji: "🔥",
    name: "The Refactorer",
    trigger: "Deletions outweigh additions by 1.5×.",
    rarity: "rare",
    accent: "text-orange-300",
    bg: "from-orange-500/15 to-transparent",
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
    emoji: "🗿",
    name: "The Monolith",
    trigger: "70%+ of your commits in a single repo.",
    rarity: "common",
    accent: "text-stone-300",
    bg: "from-stone-500/15 to-transparent",
  },
  {
    emoji: "🌅",
    name: "The Dawn Patrol",
    trigger: "First commit lands between 5 and 9 AM.",
    rarity: "uncommon",
    accent: "text-amber-300",
    bg: "from-amber-500/15 to-transparent",
  },
  {
    emoji: "🥪",
    name: "The Lunch Hour Hero",
    trigger: "Peaks between noon and 1 PM. Side projects don't build themselves.",
    rarity: "common",
    accent: "text-lime-300",
    bg: "from-lime-500/15 to-transparent",
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
    emoji: "💨",
    name: "The Sprinter",
    trigger: "Shipped 50+ commits in a single day. When you ship, you SHIP.",
    rarity: "uncommon",
    accent: "text-sky-300",
    bg: "from-sky-500/15 to-transparent",
  },
  {
    emoji: "📈",
    name: "The Consistent One",
    trigger: "Active 250+ days out of 365. Discipline is a superpower.",
    rarity: "rare",
    accent: "text-teal-300",
    bg: "from-teal-500/15 to-transparent",
  },
  {
    emoji: "🤝",
    name: "The Social Coder",
    trigger: "50+ shared commits with one person. Team sport energy.",
    rarity: "common",
    accent: "text-rose-300",
    bg: "from-rose-500/15 to-transparent",
  },
  {
    emoji: "🐺",
    name: "The Lone Wolf",
    trigger: "Shipped this year with zero co-committers.",
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
  {
    emoji: "🔨",
    name: "The Builder",
    trigger: "Heads down, shipping. No single pattern dominated — pure execution.",
    rarity: "common",
    accent: "text-blue-300",
    bg: "from-blue-500/15 to-transparent",
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
            much you delete — and crown you with one of 15 archetypes. Rules
            are evaluated in priority order; first match wins.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}
