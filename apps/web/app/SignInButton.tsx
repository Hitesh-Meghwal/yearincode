"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/me`,
        scopes: "read:user user:email read:org repo",
      },
    });
    if (signInError) {
      console.error("[sign-in] signInWithOAuth failed", signInError);
      setError(signInError.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="inline-flex items-center justify-center gap-3 rounded-full bg-white text-black px-6 py-3 text-base font-medium hover:bg-neutral-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.8 0c2.2-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
        </svg>
        {loading ? "Redirecting…" : "Sign in with GitHub"}
      </button>
      {error ? <p className="text-red-400 text-sm">{error}</p> : null}
    </>
  );
}
