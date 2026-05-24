import { ImageResponse } from "next/og";

// Edge runtime sidesteps a Windows-only bug in older Next.js where the
// bundled Noto Sans font path is mangled by Windows backslashes.
export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "yearincode — your year in code, wrapped";

// Root-level OG card. Renders the same engineering-grid-paper aesthetic the
// player uses (DepartureMono CRT vibe, dot-grid backdrop) so the social
// preview matches the brand instead of looking like a stock OpenGraph card.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          padding: "72px 80px",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: "#f5f5f5",
        }}
      >
        {/* Header band */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 4,
            color: "#a3a3a3",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <span>yearincode</span>
          <span>2026</span>
        </div>

        {/* Hero copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: -3,
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            Your year in code,
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: -3,
              color: "#ec4899",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            wrapped.
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#a3a3a3",
              maxWidth: 880,
              lineHeight: 1.35,
              marginTop: 16,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            An animated recap of every commit, streak, and language from
            your GitHub year. Shareable in 60 seconds.
          </div>
        </div>

        {/* Footer band */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#737373",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <span>yearincode.com</span>
          <span>· github wrapped ·</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
