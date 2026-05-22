"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { WrappedStats } from "@/lib/types";

function encodeStats(stats: WrappedStats): string {
  const json = JSON.stringify(stats);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export default function SampleEmbed({
  stats,
  fallbackHref,
}: {
  stats: unknown;
  fallbackHref: string;
}) {
  const src = useMemo(() => {
    if (!stats) return null;
    try {
      return `/player/index.html?stats=${encodeStats(stats as WrappedStats)}`;
    } catch (err) {
      console.error("[sample] encode failed", err);
      return null;
    }
  }, [stats]);

  if (!src) {
    return (
      <div className="mx-auto w-full max-w-[360px] aspect-[9/16] rounded-md border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 gap-4">
        <div className="text-5xl">📼</div>
        <p className="text-neutral-300 text-sm">
          Live sample loads once a wrapped exists.
        </p>
        <Link
          href={fallbackHref}
          className="text-emerald-300 text-sm hover:underline"
        >
          See an example →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[360px] aspect-[9/16] rounded-md overflow-hidden border border-neutral-800 bg-black shadow-2xl">
      <iframe
        src={src}
        title="sample wrapped"
        allow="clipboard-write"
        className="w-full h-full border-0 block"
      />
    </div>
  );
}
