// Render an emoji as a Twemoji PNG so the visual is identical across browsers,
// OSes, and our Flutter player (which loads from the same Twemoji CDN). The
// landing's archetype deck and the slide's archetype hero both use this source,
// so they always match.

type TwemojiImageProps = {
  emoji: string;
  size?: number;
  className?: string;
  alt?: string;
};

function emojiToCodepoints(emoji: string): string {
  // Strip the FE0F variation selector — Twemoji filenames drop it when the
  // base codepoint is unambiguous (⚔️ → 2694, ⏱️ → 23f1, ✈️ → 2708).
  const cps: string[] = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp === undefined || cp === 0xfe0f) continue;
    cps.push(cp.toString(16));
  }
  return cps.join("-");
}

export function TwemojiImage({
  emoji,
  size = 36,
  className,
  alt,
}: TwemojiImageProps) {
  const cps = emojiToCodepoints(emoji);
  const src = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/${cps}.png`;
  return (
    <img
      src={src}
      alt={alt ?? emoji}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      decoding="async"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    />
  );
}
