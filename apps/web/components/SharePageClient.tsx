"use client";

import { useState } from "react";
import type { WrappedStats } from "@/lib/types";
import WrappedEmbed from "./WrappedEmbed";
import ShareButtons from "./ShareButtons";

type Props = {
  stats: WrappedStats;
  shareUrl: string;
  playerVersion: string;
};

export default function SharePageClient({ stats, shareUrl, playerVersion }: Props) {
  const [ended, setEnded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <WrappedEmbed
        stats={stats}
        playerVersion={playerVersion}
        onEnded={() => setEnded(true)}
      />
      <ShareButtons stats={stats} shareUrl={shareUrl} visible={ended} />
      {!ended ? (
        <p className="text-xs text-neutral-500">
          Share buttons appear when the wrapped finishes.
        </p>
      ) : null}
    </div>
  );
}
