# yearincode

**Spotify Wrapped for your git history.** Sign in with GitHub, pick a year, wait ~15 seconds, get a vertical animated recap of that year of your coding life: commits, languages, peak coding hour, top repos, longest streak, your archetype.

- **Live**: <https://yearincode.com>
- **Maker**: [@Hitesh-Meghwal](https://github.com/Hitesh-Meghwal)
- **Spec**: [`docs/PRD.md`](docs/PRD.md) is the source of truth for product + technical decisions. This README is the operating manual.

---

## What you get

| Feature | Where |
|---|---|
| GitHub OAuth via Supabase | `/` (Sign in button) |
| Multi-year picker (current + 5 past years) | `/generate` |
| Animated Flutter wasm player (10 slides, ~50 seconds) | `/u/{username}/{year}` |
| 15-archetype rules engine (the "vibe check") | computed server-side, themed per archetype |
| Permanent public share URL + 1200×630 OG card | `/u/{username}/{year}` + `/opengraph-image` |
| Web Share + X / LinkedIn / Reddit / copy-link | revealed after the player ends |
| `/me` dashboard: all your wrappeds, views, created date, delete | `/me` |
| Tiered landing social-proof strip (adapts copy as numbers grow) | `/` |
| Marquee deck of all 15 archetypes | `/` (the vibe check section) |
| Privacy + Terms pages | `/privacy`, `/terms` |
| Auto-generated `robots.txt` + `sitemap.xml` | route conventions |
| `prefers-reduced-motion` respected | CSS + Flutter |

---

## Repo layout

```
yearincode/
├── apps/
│   ├── web/        Next.js 16 (App Router) — landing, share pages, /me, OG card, API
│   └── player/     Flutter Web (wasm) — the 10-slide animated player
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql               wrapped_reports table + RLS
│       ├── 0002_view_count_rpc.sql               atomic view-count increment RPC
│       ├── 0003_public_wrapped_stats_rpc.sql     aggregate counts for landing
│       ├── 0004_user_github_tokens.sql           server-side GitHub OAuth token storage
│       └── 0005_public_wrapped_stats_add_devs.sql adds total_devs to the stats RPC
└── docs/
    └── PRD.md      product + technical spec (source of truth)
```

Two pnpm workspaces (`apps/web`, `apps/player`). Flutter build output gets copied into `apps/web/public/player/` and Next.js serves it as static assets — no Flutter toolchain on the deploy server.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node | ≥ 20 (developed against 23.7.0) |
| pnpm | ≥ 10 (developed against 10.18.3) |
| Flutter SDK | ≥ 3.27 (developed against 3.29.2). Chrome installed for `flutter run -d chrome`. |
| Supabase project | free tier. GitHub OAuth provider enabled. |
| GitHub OAuth app | github.com/settings/developers |

---

## Local setup

### 1. Install dependencies

```bash
pnpm install
flutter pub get --directory=apps/player
```

### 2. Set up Supabase

1. Create a new project at <https://supabase.com>.
2. SQL Editor → run the five migrations **in order**:
   - [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql) — `wrapped_reports` table, indexes, RLS policies.
   - [`supabase/migrations/0002_view_count_rpc.sql`](supabase/migrations/0002_view_count_rpc.sql) — `increment_wrapped_view(p_username, p_year)` RPC for share-page view tracking.
   - [`supabase/migrations/0003_public_wrapped_stats_rpc.sql`](supabase/migrations/0003_public_wrapped_stats_rpc.sql) — `public_wrapped_stats()` RPC for the landing-page social-proof strip.
   - [`supabase/migrations/0004_user_github_tokens.sql`](supabase/migrations/0004_user_github_tokens.sql) — `user_github_tokens` table where `/auth/callback` persists each user's GitHub access token (service-role only, used by `/api/generate`). Without this, generation fails with `missing_github_token`.
   - [`supabase/migrations/0005_public_wrapped_stats_add_devs.sql`](supabase/migrations/0005_public_wrapped_stats_add_devs.sql) — extends the stats RPC with `total_devs` (distinct user count) so the landing strip can switch to "X devs have wrapped their year" once it scales.
3. **Authentication → Providers → GitHub**: enable it. Copy the **callback URL** Supabase shows you, looks like `https://<project-ref>.supabase.co/auth/v1/callback`.
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: add `http://localhost:3000/auth/callback`

### 3. Set up the GitHub OAuth app

github.com/settings/developers → New OAuth App:

- Homepage URL: `http://localhost:3000`
- **Authorization callback URL**: the Supabase callback URL from step 2.3 (this is the one GitHub talks to first; the app talks back to itself via Supabase).

Copy the Client ID + Client Secret. Paste them into Supabase → Authentication → Providers → GitHub.

### 4. Environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase → Project Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase → Project Settings → API → anon key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase → Project Settings → API → service_role key
GITHUB_CLIENT_ID=                # From the GitHub OAuth app
GITHUB_CLIENT_SECRET=            # From the GitHub OAuth app
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Build the Flutter player

The Next.js share page embeds `apps/web/public/player/index.html` in an iframe. To produce those static assets:

```bash
cd apps/player
flutter build web --release --wasm --base-href "/player/"
```

Then copy the build output to `apps/web/public/player/`:

**PowerShell:**
```powershell
$dest = "..\web\public\player"
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest -Force | Out-Null
Copy-Item -Path "build\web\*" -Destination $dest -Recurse -Force
```

**POSIX:**
```bash
rm -rf ../web/public/player
mkdir -p ../web/public/player
cp -R build/web/. ../web/public/player/
```

Repeat this whenever you change Flutter code. The Next.js dev server does not watch Flutter sources.

### 6. Run

```bash
pnpm dev
```

Opens at <http://localhost:3000>. Sign in with GitHub → land on the year picker → pick a year → watch the wrapped play → share it.

---

## How it works (the full flow)

### 1. Auth

`SignInButton` calls `supabase.auth.signInWithOAuth({ provider: "github", redirectTo: '<site>/auth/callback?next=/generate', scopes: 'read:user user:email read:org repo' })`. Supabase handles the OAuth dance; GitHub redirects back to Supabase's callback URL, which then redirects to our `/auth/callback`.

In the callback we (a) exchange the code for a session, and (b) **capture `provider_token` from that session and persist it to `user_github_tokens` via a service-role client**. This is the only reliable moment to grab the GitHub access token — newer Supabase versions don't expose it on subsequent `getSession()` calls. The table has RLS enabled with no policies, so only the service role can read or write it. Then we redirect to `/generate`.

### 2. Year picker

`/generate` (server component) reads the user, lists the current year and the five prior years, then queries `wrapped_reports` for any rows the user already owns across those years. The picker shows each year with either a **View** link (if already generated) or a **Generate** button (if not).

Clicking **Generate** navigates to `/generate?year=YYYY`, which:
- Re-checks the DB for that specific year — if a wrapped exists, redirects straight to the share page.
- Otherwise renders `GenerateClient` with `year={YYYY}` as a prop.

### 3. Generation

`GenerateClient` POSTs `/api/generate` with `{ year }` in the body and shows the rotating loading copy (PRD §6.3) while it waits. The route:

1. Reads the authenticated user via cookies, then reads the GitHub access token from `user_github_tokens` using a service-role client (the table is RLS-locked to service-role only). If no row exists, returns `missing_github_token` and the UI offers a "Sign out & sign in →" action to trigger a fresh capture in `/auth/callback`.
2. Computes the calendar date range for that year (Jan 1 → Dec 31, or → today if current year).
3. Calls `lib/github/fetchCommits`:
   - GraphQL `contributionsCollection` for repo list + commit counts + language sizes.
   - Per repo, paginated `history(author: { id: ... })` for commit metadata + additions/deletions.
   - Max 5 repos in parallel; max 30 pages × 100 commits per repo.
4. Calls `lib/aggregator`: totals, streaks, time patterns, top languages/repos/collaborators, message stats.
5. Calls `lib/archetypes`: 15 rules evaluated in priority order, first match wins.
6. Upserts the row into `wrapped_reports` (unique on `github_username + year`).
7. Returns `{ redirectUrl: '/u/{username}/{year}' }`.

If commit count is 0 for the requested year (user wasn't active that year), returns `error: 'no_commits'` and the picker shows a friendly message.

### 4. Share page

`/u/[username]/[year]` server-fetches the row, renders the Flutter player in an iframe with the stats encoded as `?stats={base64url(JSON)}`, and lists the plain-text stats summary below the player (this doubles as the accessibility fallback per PRD §5.5).

The page also fires `increment_wrapped_view(p_username, p_year)` fire-and-forget so the view count ticks up on every render. Once the Flutter player finishes, it calls a `window.notifyWrappedEnded()` shim that `postMessage`s `{ type: 'wrapped:ended' }` to the parent, and the share buttons fade in.

### 5. OG card

`/u/[username]/[year]/opengraph-image` runs on the **edge runtime** (sidesteps a Windows-only Next.js 15.1.x font path bug) and returns a 1200×630 PNG via `next/og`, themed with the archetype's primary/secondary colors. Twitter, LinkedIn, Slack, etc. all pick it up via the OG meta tags emitted by the share page's `generateMetadata`.

### 6. Player

The Flutter app is rendered inside a **540×960 design canvas** wrapped in `FittedBox(contain)`, then scaled to whatever the iframe gives it on the host page. Slides assume the 540×960 dimensions internally, so absolute positioning is safe.

Ten slides, each ~5 seconds, ~50 seconds total runtime:

1. **Intro** — masthead-style year
2. **Commits** — gradient hero number + sticker tags for active days / repos
3. **Lines** — solid green/red blocks with oversized +/- glyphs + a yellow NET sticker on the seam
4. **Languages** — Spotify-style segmented bar
5. **Peak hour** — oversized HH:MM + 24-row vertical rail + italic pull-quote
6. **Top repo** — macOS terminal card with traffic lights + PRIVATE tag if applicable
7. **Streak** — 52×7 calendar grid as the primary visual + day-count overlapping
8. **Collaborator** — two-up overlapping solid avatars; lone-wolf fallback
9. **Archetype** — rotated polaroid card with confetti burst + rarity stamp
10. **Outro** — concert-ticket / receipt stub with dotted-leader stat rows + faux barcode

Animations respect `MediaQuery.disableAnimations` (reduced motion). FadeIn / ScaleIn / GentlePulse / AnimatedBackground / ConfettiBurst all skip to their final state under reduced motion.

---

## Deploying to Vercel

1. Connect the repo on Vercel.
2. **Root Directory** = `apps/web` (we're in a pnpm monorepo).
3. Add all six env vars from `apps/web/.env.local` to **Production** scope. For prod, swap `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://yearincode.com`).
4. Apply all five SQL migrations in the Supabase SQL editor (see step 2 of setup). Specifically `0004_user_github_tokens.sql` is required — without it generation fails with `missing_github_token`.
5. **GitHub OAuth app**: the Authorization callback URL stays pointing at Supabase's `/auth/v1/callback` — no change needed for prod.
6. **Supabase → Authentication → URL Configuration**:
   - Site URL: change to `https://<your-domain>`
   - Redirect URLs: add `https://<your-domain>/auth/callback`
7. Vercel doesn't re-bake existing builds when you add env vars — trigger a redeploy (Deployments → ⋯ → Redeploy) after step 3 or 6.

The Flutter player assets in `apps/web/public/player/` are committed to the repo, so Vercel deploys them as static files. **After any Flutter change**, rebuild locally (step 5 of setup) and commit the regenerated `apps/web/public/player/` directory.

### Custom domain (optional)

Once `https://yearincode.com` is healthy and you've shared with friends, add a custom domain in Vercel and update:

- GitHub OAuth: no change (Supabase callback URL is unchanged).
- Supabase → Authentication → URL Configuration: add the new domain.
- Vercel env: `NEXT_PUBLIC_SITE_URL=https://<new-domain>` → redeploy.

---

## Common gotchas

| Symptom | Fix |
|---|---|
| `missing_github_token` from `/api/generate` | Your row in `user_github_tokens` is missing. Use the "Sign out & sign in →" button on the error screen (or `/me` → Sign out → land back at `/` → Sign in). The `/auth/callback` handler captures and persists the token on a fresh sign-in. If it still fails: verify migration `0004` was applied. |
| Vercel build warns "Vulnerable version of Next.js" | Bump: `pnpm --filter web add next@latest`, rebuild, redeploy. |
| OG image 500 on local dev (Windows) | Known Next.js 15.1.x bundled-font path bug. The OG route uses `export const runtime = "edge"` to sidestep it. |
| Iframe says "Module not found" or shows blank | The Flutter build wasn't copied — re-run step 5. |
| Supabase migration "policy already exists" | The migrations use `drop policy if exists` first, so re-runs are safe. |
| Stale "Invalid refresh token" 500 on `/me` after long inactivity | `getUserSafe` / `getSessionSafe` already catch this. Hard-refresh; the broken cookie clears and the page returns to "signed out" state. |
| Slide content cut at top/bottom on certain viewports | Already fixed via `height: 1.0` on hero TextStyles + removal of `Align(heightFactor:)` squeezes. If you see new occurrences, check whether you've added new text with `height: 0.X`. |
| New year picker shows "Not generated yet" forever | Did you apply migration `0002`? View count + row existence both come from the same `wrapped_reports` table; the picker checks `user_id` ownership. |
| Landing strip stays on "just launched" even after wrappeds exist | Migration `0005` not applied. The RPC needs the new `total_devs` column shape. Run `0005` (it auto-drops the older 0003 function and recreates with the new return type). |

---

## Contributing

Conventions:

- **Commit style**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- **No new dependencies** without thinking twice. The stack in PRD §7.1 is intentional. Notable existing deps: `next`, `@supabase/ssr`, `@supabase/supabase-js`, `tailwindcss` v4, `next/font` (for Geist Sans + Geist Mono), `next/og`. No additional Flutter packages beyond the SDK + `flutter_test` + `flutter_lints`.
- **Tests**: none yet. Real tests come after the v1 launch milestone (PRD §11.10).
- **Editor**: any LSP-aware editor with TypeScript + Dart support.

Issues: please open one with the deployed URL of your wrapped + your GitHub username so we can reproduce.

---

## License

Not yet specified. Personal project. Ping the maintainer before reuse.
