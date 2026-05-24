-- 0006_add_github_created_at.sql
--
-- Adds a column for the user's GitHub account creation date. We capture this
-- once at sign-in (in /auth/callback) or lazily on first /generate visit,
-- then use it to render every year since the user joined GitHub in the year
-- picker — instead of a fixed past-5-years window.
--
-- The column is nullable so existing rows from before this migration keep
-- working: the generate page falls back to the past-5-years behavior until
-- the user signs in again or hits the picker (which lazily backfills it).

alter table user_github_tokens
  add column if not exists github_created_at timestamptz;

comment on column user_github_tokens.github_created_at is
  'When the GitHub account was created (viewer.createdAt from GraphQL). Drives the year picker range so we show every year since the user joined GitHub.';
