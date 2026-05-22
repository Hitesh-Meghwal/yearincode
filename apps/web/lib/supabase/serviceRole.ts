import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS — must only ever be used from
 * server-side code (route handlers, server components, server actions),
 * never shipped to the browser.
 *
 * We use this specifically to read/write the user_github_tokens table, which
 * has RLS enabled with no policies, so the service role is the only way in.
 */
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
