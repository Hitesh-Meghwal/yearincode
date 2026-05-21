import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; ignored since middleware is not required for this checkpoint.
          }
        },
      },
    },
  );
}

/**
 * `supabase.auth.getUser()` throws an AuthApiError when the refresh token in
 * the cookie is invalid (e.g. user signed out elsewhere, or Supabase rotated
 * keys). For our purposes, an unreadable session = no user — never an
 * exception that crashes a server component. Use this everywhere instead of
 * calling `getUser()` directly.
 */
export async function getUserSafe(
  supabase: SupabaseClient,
): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.warn("[auth] getUser returned error:", error.message);
      return null;
    }
    return data.user;
  } catch (err) {
    console.warn(
      "[auth] getUser threw:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/** Same defensive wrapper for getSession(). */
export async function getSessionSafe(
  supabase: SupabaseClient,
): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn("[auth] getSession returned error:", error.message);
      return null;
    }
    return data.session;
  } catch (err) {
    console.warn(
      "[auth] getSession threw:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
