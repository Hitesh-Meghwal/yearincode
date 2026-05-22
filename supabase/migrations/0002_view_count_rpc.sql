-- Atomic view-count increment for shared wrapped pages. Called by the share
-- page's server component once per render.

create or replace function public.increment_wrapped_view(
  p_username text,
  p_year integer
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.wrapped_reports
     set view_count = view_count + 1
   where github_username = p_username
     and year = p_year
     and is_public = true;
$$;

-- Allow anonymous + authenticated callers to invoke it (it only increments,
-- it cannot read or expose any row data).
grant execute on function public.increment_wrapped_view(text, integer)
  to anon, authenticated;
