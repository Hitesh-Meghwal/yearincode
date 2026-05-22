"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  wrappedId: string;
  wrappedYear: number;
};

export default function DeleteWrappedButton({ wrappedId, wrappedYear }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doDelete() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/wrapped/${wrappedId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? body?.error ?? `HTTP ${res.status}`);
        setPending(false);
        return;
      }
      // Force a re-render: page will re-query and show the "Generate" CTA.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center rounded-full border border-red-900/60 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40 transition-colors"
      >
        Delete my {wrappedYear} wrapped
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-neutral-300 text-center max-w-xs">
        Delete your {wrappedYear} wrapped and free up the share URL? This can&apos;t be undone.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={doDelete}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
