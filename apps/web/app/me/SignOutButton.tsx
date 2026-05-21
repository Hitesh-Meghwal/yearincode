"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[sign-out] signOut failed", error);
      setLoading(false);
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-5 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
