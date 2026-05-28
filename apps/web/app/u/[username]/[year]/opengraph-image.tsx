import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import type { WrappedStats } from "@/lib/types";

// Edge runtime sidesteps a Windows-only bug in Next.js 15.1.x where the
// bundled Noto Sans font path is mangled by Windows backslashes.
export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "yearincode wrapped";

// Per archetype, returns matching primary/secondary/background colors. Mirrors
// apps/player/lib/themes/archetype_themes.dart so the OG card feels like the
// player.
function themeFor(id: string): {
  primary: string;
  secondary: string;
  background: string;
} {
  switch (id) {
    case "night-owl-refactorer":
      return { primary: "#7C3AED", secondary: "#FBBF24", background: "#0F0524" };
    case "weekend-warrior":
      return { primary: "#EF4444", secondary: "#FBBF24", background: "#1A0A0A" };
    case "metronome":
      return { primary: "#06B6D4", secondary: "#FFFFFF", background: "#000814" };
    case "refactorer":
      return { primary: "#F97316", secondary: "#FFFFFF", background: "#1A0E05" };
    case "polyglot":
      return { primary: "#10B981", secondary: "#EC4899", background: "#02180F" };
    // Lifetime ("Since Day One") archetypes — must match the Flutter player's
    // archetype_themes.dart exactly so the OG card and player agree.
    case "architect":
      return { primary: "#A78BFA", secondary: "#FBBF24", background: "#150B2E" };
    case "og":
      return { primary: "#34D399", secondary: "#FFFFFF", background: "#04140E" };
    case "veteran":
      return { primary: "#F59E0B", secondary: "#FFFFFF", background: "#1A1206" };
    case "lifer":
      return { primary: "#22D3EE", secondary: "#FFFFFF", background: "#04141A" };
    case "prolific":
      return { primary: "#F472B6", secondary: "#A78BFA", background: "#1A0A16" };
    case "comeback":
      return { primary: "#FB923C", secondary: "#FFFFFF", background: "#1A0E05" };
    case "journeyman":
      return { primary: "#60A5FA", secondary: "#FBBF24", background: "#0A0F1F" };
    case "rookie":
      return { primary: "#4ADE80", secondary: "#FFFFFF", background: "#04140A" };
    case "builder":
      return { primary: "#3B82F6", secondary: "#F59E0B", background: "#0A0F1F" };
    default:
      return { primary: "#3B82F6", secondary: "#F59E0B", background: "#0A0F1F" };
  }
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ username: string; year: string }>;
}) {
  const { username, year } = await params;
  // The `all` slug ↔ the all-time sentinel year 0; else a numeric year.
  const queryYear = year === "all" ? 0 : Number.parseInt(year, 10);

  const supabase = await createClient();
  const { data } = await supabase
    .from("wrapped_reports")
    .select("stats_json")
    .eq("github_username", username)
    .eq("year", queryYear)
    .maybeSingle();

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0A0F1F",
            color: "#FAFAFA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          yearincode
        </div>
      ),
      size,
    );
  }

  const stats = data.stats_json as WrappedStats;
  const theme = themeFor(stats.archetype.id);
  const heroNumber = fmt(stats.netLines >= 0 ? stats.netLines : stats.totalCommits);
  const heroLabel = stats.netLines >= 0 ? "lines" : "commits";

  // Satori is strict: every <div> with >1 child needs `display: flex` (or
  // `display: none`). String + variable counts as multiple children, so we
  // pre-concatenate text and set display on every container div.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          color: "#FAFAFA",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: `linear-gradient(135deg, ${theme.background} 0%, ${blend(theme.primary, theme.background, 0.18)} 100%)`,
        }}
      >
        {/* Top: avatar + handle */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {stats.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={stats.avatarUrl}
              alt={stats.username}
              width={96}
              height={96}
              style={{
                width: 96,
                height: 96,
                borderRadius: 96,
                border: `2px solid ${theme.primary}`,
              }}
            />
          ) : null}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 42, fontWeight: 700 }}>
              {`@${stats.username}`}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "#9CA3AF",
                marginTop: 4,
              }}
            >
              {stats.isAllTime
                ? stats.yearsActive
                  ? `Since Day One · ${stats.yearsActive} years`
                  : "Since Day One"
                : `${stats.year} in code`}
            </div>
          </div>
        </div>

        {/* Middle: hero number */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 168,
              fontWeight: 900,
              color: theme.primary,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {heroNumber}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: "#E5E7EB",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            {heroLabel}
          </div>
        </div>

        {/* Bottom: archetype + watermark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 24px",
              borderRadius: 999,
              background: `${theme.secondary}22`,
              border: `2px solid ${theme.secondary}`,
            }}
          >
            <div style={{ display: "flex", fontSize: 48 }}>
              {stats.archetype.emoji}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 32,
                fontWeight: 700,
                color: theme.secondary,
              }}
            >
              {stats.archetype.name}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#9CA3AF",
              fontWeight: 500,
            }}
          >
            yearincode.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}

// Blend `a` over `b` at the given alpha (0..1) and return a hex string. Used
// to mimic the player's gradient background.
function blend(a: string, b: string, alpha: number): string {
  const ax = parseHex(a);
  const bx = parseHex(b);
  const r = Math.round(ax.r * alpha + bx.r * (1 - alpha));
  const g = Math.round(ax.g * alpha + bx.g * (1 - alpha));
  const bl = Math.round(ax.b * alpha + bx.b * (1 - alpha));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}
