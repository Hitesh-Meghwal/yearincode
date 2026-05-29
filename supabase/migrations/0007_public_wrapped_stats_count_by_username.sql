-- 0007_public_wrapped_stats_count_by_username.sql
--
-- Fix the landing "X devs wrapped their year" number so it counts EVERYONE,
-- not just signed-in users.
--
-- Before: total_devs = count(distinct user_id). But username- and PAT-mode
-- wraps store user_id = NULL (they're unclaimed), and Postgres'
-- count(distinct ...) ignores NULLs — so every no-login wrap was invisible to
-- the counter. After launching the no-login path, that's most of them.
--
-- After: count(distinct github_username) — one tally per unique handle,
-- regardless of how the wrap was generated. The return shape is unchanged, so
-- CREATE OR REPLACE keeps existing grants intact.

create or replace function public.public_wrapped_stats()
returns table (
  total_wrappeds bigint,
  total_views    bigint,
  total_devs     bigint
)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::bigint                              as total_wrappeds,
    coalesce(sum(view_count), 0)::bigint          as total_views,
    count(distinct github_username)::bigint       as total_devs
  from public.wrapped_reports
  where is_public = true;
$$;

grant execute on function public.public_wrapped_stats()
  to anon, authenticated;
