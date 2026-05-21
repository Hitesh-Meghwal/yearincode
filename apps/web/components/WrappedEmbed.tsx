"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WrappedStats } from "@/lib/types";

type Props = {
  stats: WrappedStats;
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

export default function WrappedEmbed({ stats, onEnded }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [ended, setEnded] = useState(false);

  const src = useMemo(() => {
    const encoded = encodeStats(stats);
    return `/player/index.html?stats=${encoded}`;
  }, [stats]);

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

  // Notify parent (the share page) when state changes — exposed via a CSS
  // custom property + data attribute so the page can react without a second
  // prop drill.
  return (
    <div
      data-wrapped-ended={ended ? "true" : "false"}
      className="mx-auto w-full max-w-[540px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl"
    >
      <iframe
        ref={iframeRef}
        src={src}
        title={`${stats.username}'s ${stats.year} in code`}
        allow="clipboard-write"
        className="w-full h-full border-0 block"
      />
    </div>
  );
}
