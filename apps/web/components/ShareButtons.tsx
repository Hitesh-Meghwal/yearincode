"use client";

import { useEffect, useState } from "react";
import type { WrappedStats } from "@/lib/types";

type Props = {
  stats: WrappedStats;
  shareUrl: string;
  visible: boolean;
};

function buildShareText(stats: WrappedStats): string {
  return [
    `My ${stats.year} in code:`,
    `${stats.totalCommits.toLocaleString()} commits,`,
    `${stats.longestStreak.days}-day streak,`,
    `${stats.archetype.name} ${stats.archetype.emoji}`,
  ].join(" ");
}

export default function ShareButtons({ stats, shareUrl, visible }: Props) {
  const [copied, setCopied] = useState(false);
  const [canWebShare, setCanWebShare] = useState(false);

  useEffect(() => {
    setCanWebShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  const text = buildShareText(stats);
  const encoded = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(shareUrl);

  async function webShare() {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") return;
    try {
      await navigator.share({
        title: `${stats.username}'s ${stats.year} in code`,
        text,
        url: shareUrl,
      });
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        console.error("[share] navigator.share failed", err);
      }
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch (err) {
      console.error("[share] clipboard write failed", err);
    }
  }

  return (
    <div
      aria-hidden={!visible}
      className={`w-full transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <p className="text-center text-sm text-neutral-400 mb-3">
        Share your wrapped
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {canWebShare ? (
          <button
            type="button"
            onClick={webShare}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            <ShareIcon />
            Share
          </button>
        ) : null}

        <ShareLink
          label="X"
          href={`https://twitter.com/intent/tweet?text=${encoded}&url=${encodedUrl}`}
          icon={<XIcon />}
        />
        <ShareLink
          label="LinkedIn"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          icon={<LinkedInIcon />}
        />
        <ShareLink
          label="Reddit"
          href={`https://reddit.com/submit?url=${encodedUrl}&title=${encoded}`}
          icon={<RedditIcon />}
        />
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-100 hover:bg-neutral-900 transition-colors"
        >
          <LinkIcon />
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function ShareLink({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-100 hover:bg-neutral-900 transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.9l-5.4-7.06L4.5 22H1.244l8.04-9.18L1 2h7.06l4.88 6.46L18.244 2Zm-1.21 18h1.8L7.06 4H5.18l11.853 16Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .78 0 1.74v20.52C0 23.22.79 24 1.77 24h20.46c.98 0 1.77-.78 1.77-1.74V1.74C24 .78 23.21 0 22.23 0Z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12s12-5.37 12-12c0-6.63-5.37-12-12-12Zm6.85 13.6c.04.27.06.55.06.83 0 2.86-3.32 5.18-7.41 5.18-4.08 0-7.4-2.32-7.4-5.18 0-.29.02-.57.06-.85-.6-.27-1.02-.86-1.02-1.55a1.7 1.7 0 0 1 2.94-1.16c1.32-.95 3.13-1.55 5.13-1.61l.97-4.58 3.2.68a1.2 1.2 0 1 1-.16.78l-2.84-.6-.84 3.98c1.99.06 3.78.65 5.1 1.59a1.7 1.7 0 1 1 2.21 2.49ZM8.4 13.5a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm7.2 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm-.66 2.85a.45.45 0 0 1 0 .63c-.83.83-2.17 1.24-3.94 1.24-1.76 0-3.1-.41-3.94-1.24a.45.45 0 0 1 .63-.63c.63.63 1.79.99 3.31.99 1.52 0 2.68-.36 3.31-.99a.45.45 0 0 1 .63 0Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
