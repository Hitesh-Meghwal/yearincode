-- yearincode initial schema
-- Per PRD §4.6

create table if not exists public.wrapped_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  github_username text not null,
  year integer not null,
  stats_json jsonb not null,
  raw_commit_cache jsonb,
  cache_expires_at timestamptz,
  is_public boolean default true,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (github_username, year)
);

create index if not exists idx_wrapped_username_year
  on public.wrapped_reports (github_username, year);

create index if not exists idx_wrapped_user_id
  on public.wrapped_reports (user_id);

alter table public.wrapped_reports enable row level security;

-- Public can read all public wrappeds.
drop policy if exists "Public wrappeds are viewable by everyone"
  on public.wrapped_reports;
create policy "Public wrappeds are viewable by everyone"
  on public.wrapped_reports for select
  using (is_public = true);

-- Users can manage their own wrappeds (insert / update / delete).
drop policy if exists "Users can manage their own wrappeds"
  on public.wrapped_reports;
create policy "Users can manage their own wrappeds"
  on public.wrapped_reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
