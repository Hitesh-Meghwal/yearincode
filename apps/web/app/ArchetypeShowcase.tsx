// The vibe-check section. Two horizontal marquees scrolling in opposite
// directions, pause-on-hover, edge fade. All 15 archetypes flow continuously
// — no tier walls, no broken side-by-side panels, no card grid monotony.

import { TwemojiImage } from "@/components/TwemojiImage";

type Rarity = "common" | "uncommon" | "rare" | "legendary";

type Archetype = {
  emoji: string;
  name: string;
  trigger: string;
  rarity: Rarity;
};

const ARCHETYPES: Archetype[] = [
  { emoji: "🦉", name: "The Night Owl Refactorer", trigger: "Peaks past midnight, light on weekends.", rarity: "uncommon" },
  { emoji: "⚔️", name: "The Weekend Warrior",      trigger: "Over 60% of commits land Sat / Sun.", rarity: "uncommon" },
  { emoji: "⏱️", name: "The Metronome",            trigger: "A streak longer than 90 days straight.", rarity: "rare" },
  { emoji: "🔥", name: "The Refactorer",            trigger: "Deletions outweigh additions by 1.5×.", rarity: "rare" },
  { emoji: "🌍", name: "The Polyglot",              trigger: "No language above 40%, 4+ in rotation.", rarity: "uncommon" },
  { emoji: "🗿", name: "The Monolith",              trigger: "70%+ of commits in a single repo.", rarity: "common" },
  { emoji: "🌅", name: "The Dawn Patrol",           trigger: "First commit lands between 5 and 9 AM.", rarity: "uncommon" },
  { emoji: "🥪", name: "The Lunch Hour Hero",       trigger: "Peaks between noon and 1 PM.", rarity: "common" },
  { emoji: "🏃", name: "The Marathoner",            trigger: "2,000+ commits in a single year.", rarity: "rare" },
  { emoji: "💨", name: "The Sprinter",              trigger: "Shipped 50+ commits in a single day.", rarity: "uncommon" },
  { emoji: "📈", name: "The Consistent One",        trigger: "Active 250+ days out of 365.", rarity: "rare" },
  { emoji: "🤝", name: "The Social Coder",          trigger: "50+ shared commits with one person.", rarity: "common" },
  { emoji: "🐺", name: "The Lone Wolf",             trigger: "Zero co-committers all year.", rarity: "common" },
  { emoji: "✈️", name: "The Globe Trotter",         trigger: "Commits scattered across so many hours, your timezone is anywhere.", rarity: "legendary" },
  { emoji: "🔨", name: "The Builder",               trigger: "Heads down, shipping. No single pattern dominated.", rarity: "common" },
];

const RARITY_ACCENT: Record<Rarity, { dot: string; label: string }> = {
  common: { dot: "bg-neutral-500", label: "text-neutral-400" },
  uncommon: { dot: "bg-emerald-400", label: "text-emerald-300" },
  rare: { dot: "bg-amber-400", label: "text-amber-300" },
  legendary: { dot: "bg-pink-400", label: "text-pink-300" },
};

const RARITY_LABEL: Record<Rarity, string> = {
  common: "COMMON",
  uncommon: "UNCOMMON",
  rare: "RARE",
  legendary: "LEGENDARY",
};

// Split the deck into two rows for the dual marquee. Interleaved so each row
// has a mix of rarities.
const ROW_A = ARCHETYPES.filter((_, i) => i % 2 === 0);
const ROW_B = ARCHETYPES.filter((_, i) => i % 2 === 1);

export default function ArchetypeShowcase() {
  return (
    <section className="pb-28">
      {/* Heading lives inside the page gutter; the marquees themselves go
          edge-to-edge so the fade-out really feels infinite. */}
      <div className="px-6">
        <div className="mx-auto max-w-6xl mb-12">
          <header className="max-w-3xl">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02] text-neutral-50">
              What kind of developer were you?
            </h2>
            <p className="mt-5 text-lg text-neutral-400 leading-relaxed">
              A rules engine grades your year into one of fifteen archetypes,
              from common to legendary. Hover to pause the deck.
            </p>
          </header>
        </div>
      </div>

      <MarqueeRow items={ROW_A} duration={48} direction="left" />
      <div className="h-4" />
      <MarqueeRow items={ROW_B} duration={56} direction="right" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* MarqueeRow — duplicates its items so the loop reads as infinite.    */
/* Pauses the animation when any descendant card is hovered.           */
/* ------------------------------------------------------------------ */
function MarqueeRow({
  items,
  duration,
  direction,
}: {
  items: Archetype[];
  duration: number;
  direction: "left" | "right";
}) {
  // Two copies of the deck end-to-end. Translate the whole strip by -50%
  // and the second copy slides into place exactly where the first one was.
  const animationName = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div className="group relative overflow-x-clip py-2">
      {/* Edge fades to dissolve cards in/out of the viewport. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-32 z-10"
        style={{
          background:
            "linear-gradient(to right, var(--background, #0a0a0a) 10%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-32 z-10"
        style={{
          background:
            "linear-gradient(to left, var(--background, #0a0a0a) 10%, transparent 100%)",
        }}
      />

      <div
        className="flex w-max gap-4 group-hover:[animation-play-state:paused]"
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
        }}
      >
        {[...items, ...items].map((a, i) => (
          <Card key={`${a.name}-${i}`} a={a} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card — fixed width so the marquee has a consistent rhythm.          */
/* ------------------------------------------------------------------ */
function Card({ a }: { a: Archetype }) {
  const accent = RARITY_ACCENT[a.rarity];
  const isLegendary = a.rarity === "legendary";
  return (
    <article
      className={`relative shrink-0 w-[300px] rounded-2xl border bg-neutral-950 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-900 ${
        isLegendary
          ? "border-pink-900/60 shadow-[0_0_40px_-12px_rgba(236,72,153,0.35)]"
          : "border-neutral-900 hover:border-neutral-700"
      }`}
    >
      {isLegendary ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-pink-500/15 blur-3xl"
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-3 mb-3">
        <TwemojiImage emoji={a.emoji} size={36} alt={a.name} />

        <div className="flex items-center gap-1.5 mt-1">
          <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
          <span
            className={`font-mono text-[10px] tracking-[0.18em] font-bold ${accent.label}`}
          >
            {RARITY_LABEL[a.rarity]}
          </span>
        </div>
      </div>

      <h4 className="relative text-base font-bold tracking-tight text-neutral-50 leading-snug">
        {a.name}
      </h4>
      <p className="relative mt-1.5 text-[13px] text-neutral-400 leading-relaxed line-clamp-2">
        {a.trigger}
      </p>
    </article>
  );
}
