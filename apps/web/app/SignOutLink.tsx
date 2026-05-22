"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Compact text-link sign-out for use in nav bars and inline contexts.
 * The bigger pill-style button lives at app/me/SignOutButton.tsx.
 */
export default function SignOutLink({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[sign-out] failed", error);
      setLoading(false);
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className={`text-sm text-neutral-500 hover:text-white transition-colors disabled:opacity-60 ${className}`}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
