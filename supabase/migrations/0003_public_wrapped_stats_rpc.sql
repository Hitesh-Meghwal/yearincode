-- Aggregate counters for the landing page social-proof strip.
-- Returns (total_wrappeds, total_views) across all public wrappeds.

create or replace function public.public_wrapped_stats()
returns table (
  total_wrappeds bigint,
  total_views    bigint
)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::bigint                       as total_wrappeds,
    coalesce(sum(view_count), 0)::bigint   as total_views
  from public.wrapped_reports
  where is_public = true;
$$;

grant execute on function public.public_wrapped_stats()
  to anon, authenticated;
