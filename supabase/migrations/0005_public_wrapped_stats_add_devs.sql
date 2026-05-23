-- Extend the landing-strip aggregate to also return distinct dev count.
-- Lets the landing switch its copy at scale from "N wrappeds shipped" to
-- "M devs have wrapped their year" once enough people are in the table.
--
-- Postgres rejects changing the RETURN TABLE shape of an existing function
-- via CREATE OR REPLACE, so we DROP + CREATE instead.

drop function if exists public.public_wrapped_stats();

create function public.public_wrapped_stats()
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
    count(distinct user_id)::bigint               as total_devs
  from public.wrapped_reports
  where is_public = true;
$$;

grant execute on function public.public_wrapped_stats()
  to anon, authenticated;
