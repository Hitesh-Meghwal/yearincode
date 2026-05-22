-- Server-side storage for the GitHub OAuth access token, captured in the
-- /auth/callback handler. Supabase newer versions don't persist
-- `provider_token` in subsequent sessions, so we store it ourselves.
--
-- Security: RLS enabled with NO policies. That means anon + authenticated
-- clients literally cannot read this table. Only the service role bypasses
-- RLS and reads from it. /api/generate reads it via a service-role client.

create table if not exists public.user_github_tokens (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  updated_at   timestamptz not null default now()
);

alter table public.user_github_tokens enable row level security;

-- Intentionally no policies. Service role bypasses RLS and is the only path
-- of access. Anon + authenticated clients get an empty result for any query.
