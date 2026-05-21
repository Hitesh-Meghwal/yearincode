// Deterministic GitHub-contribution-grid background. Server-rendered so it
// ships zero JS. Cells are mostly dim with a sparse, seeded "lit" pattern so
// the background reads as developer-native rather than generic gradient blobs.

const COLS = 60;
const ROWS = 14;
const CELL = 14;
const GAP = 4;

// Lightweight seeded PRNG so the pattern is identical across renders without
// any client-side state.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTE = [
  "#0e2417", // very dim emerald
  "#155a35",
  "#1c8049",
  "#22c55e", // bright emerald
  "#ec4899", // pink accent (rare)
  "#8b5cf6", // violet accent (rare)
];

export default function ContributionGridBg() {
  const rand = mulberry32(42);
  const width = COLS * (CELL + GAP);
  const height = ROWS * (CELL + GAP);

  const cells: Array<{ x: number; y: number; color: string }> = [];
  for (let c = 0; c < COLS; c += 1) {
    for (let r = 0; r < ROWS; r += 1) {
      const roll = rand();
      let color = "#101010";
      if (roll > 0.985) color = PALETTE[5];
      else if (roll > 0.97) color = PALETTE[4];
      else if (roll > 0.9) color = PALETTE[3];
      else if (roll > 0.78) color = PALETTE[2];
      else if (roll > 0.6) color = PALETTE[1];
      else if (roll > 0.4) color = PALETTE[0];
      cells.push({ x: c * (CELL + GAP), y: r * (CELL + GAP), color });
    }
  }

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMin slice"
        width="100%"
        height="100%"
        aria-hidden="true"
        className="opacity-40"
      >
        {cells.map((cell, i) => (
          <rect
            key={i}
            x={cell.x}
            y={cell.y}
            width={CELL}
            height={CELL}
            rx={3}
            ry={3}
            fill={cell.color}
          />
        ))}
      </svg>
      {/* Vignette: fade the grid into pure black at the edges so content
          stays readable without competing with the texture. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 30%, #0a0a0a 80%)",
        }}
      />
    </div>
  );
}
