"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WrappedStats } from "@/lib/types";

// Synthwave soundtrack that plays under the deck. Lives in /public/audio
// so it's served verbatim. Lazy autoplay starts muted (browsers allow
// `autoplay + muted`); the corner button unmutes on user gesture.
const AUDIO_SRC = "/audio/monume-synthwave-retro-80s-519247.mp3";

type Props = {
  stats: WrappedStats;
  playerVersion: string;
  onEnded?: () => void;
};

// Browser-safe base64url encoder for a JSON-serialisable value. We use
// base64url (no padding) so the result is URL-safe.
function encodeStats(stats: WrappedStats): string {
  const json = JSON.stringify(stats);
  // TextEncoder → Uint8Array → base64url.
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export default function WrappedEmbed({ stats, playerVersion, onEnded }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(true);

  const src = useMemo(() => {
    const encoded = encodeStats(stats);
    return `/player/index.html?v=${encodeURIComponent(playerVersion)}&stats=${encoded}`;
  }, [stats, playerVersion]);

  useEffect(() => {
    function handle(event: MessageEvent) {
      // We only accept messages from our own iframe.
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
        return;
      }
      const data = event.data as { type?: string } | null;
      if (data && data.type === "wrapped:ended") {
        setEnded(true);
        onEnded?.();
      }
    }
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [onEnded]);

  // Sync the mute state to the actual <audio> element. On unmute we also
  // explicitly call play() — autoplay may have been blocked at mount on
  // browsers without an existing user gesture, but the click that toggled
  // the button is a fresh gesture that always allows playback.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (!muted) {
      audio.play().catch(() => {});
    }
  }, [muted]);

  // Pause when the deck ends so the share-buttons reveal isn't underscored
  // by the loop continuing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (ended) audio.pause();
  }, [ended]);

  return (
    <div
      data-wrapped-ended={ended ? "true" : "false"}
      className="relative mx-auto aspect-[9/16] rounded-md overflow-hidden bg-black shadow-2xl"
      // Width is the smallest of: parent's available width, the height-
      // constrained equivalent (so the 9:16 portrait fits within ~80% of
      // the viewport height), and the 540px design cap. Width drives,
      // aspect-ratio gives us the height — guaranteeing the player never
      // gets clipped at the bottom on a desktop with browser chrome.
      style={{ width: "min(100%, calc(80dvh * 9 / 16), 540px)" }}
    >
      <iframe
        ref={iframeRef}
        src={src}
        title={`${stats.username}'s ${stats.year} in code`}
        allow="clipboard-write; autoplay"
        className="w-full h-full border-0 block"
      />

      {/* Mute / unmute toggle. Translucent dark pill so it reads cleanly on
          both the dark slides (peak hour, lines) and the bright ones
          (pink intro, yellow outro). */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute music" : "Mute music"}
        title={muted ? "Unmute music" : "Mute music"}
        className="absolute top-3 right-3 z-10 grid place-items-center h-9 w-9 rounded-full bg-black/55 text-white text-base backdrop-blur-sm transition-colors hover:bg-black/75 active:bg-black/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
      </button>

      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        autoPlay
        loop
        muted
        preload="auto"
      />
    </div>
  );
}
