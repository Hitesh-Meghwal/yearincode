<div align="center">

<img src="apps/web/public/yearincode-logo.svg" alt="yearincode" width="96" height="96" />

# yearincode

**Spotify Wrapped for your GitHub year.**

Sign in with GitHub, pick a year, wait ~15 seconds, get a vertical animated recap of that year of your coding life: commits, languages, peak hour, top repo, longest streak, discipline score, your archetype — set to synthwave.

[![License: MIT](https://img.shields.io/badge/license-MIT-3EF4A3.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Hitesh-Meghwal/yearincode?style=flat-square&color=F24B73)](https://github.com/Hitesh-Meghwal/yearincode/stargazers)
[![Next.js](https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Flutter](https://img.shields.io/badge/Flutter-Web%20wasm-02569B?style=flat-square&logo=flutter)](https://flutter.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-6F55E7.svg?style=flat-square)](CONTRIBUTING.md)

[**Live demo →**](https://yearincode.com) ·
[Built by Hitesh Meghwal](https://github.com/Hitesh-Meghwal) ·
[Contributing](CONTRIBUTING.md) ·
[Security](SECURITY.md)

</div>

---

## Table of contents

- [Why this exists](#why-this-exists)
- [What you get](#what-you-get)
- [Quick start (self-host)](#quick-start-self-host)
- [Repo layout](#repo-layout)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [How it works (the full flow)](#how-it-works-the-full-flow)
- [Deploying to Vercel](#deploying-to-vercel)
- [Common gotchas](#common-gotchas)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## Why this exists

Spotify Wrapped works because looking back at a year of your own behavior, packaged with personality, is genuinely fun to see — and irresistible to share. Developers have a year's worth of behavior sitting in `git log`, and nobody had built the Wrapped for it. So I did.

Privacy-first by design: the default path never asks you to log in, and even the signed-in path requests **read-only `public_repo` scope only**. We never read your source code, never write anything, and never store a pasted token. Everything in the player is derived from public commit metadata (timestamps, additions/deletions, message subject lines). The full data inventory is in [the privacy policy](https://yearincode.com/privacy) and verifiable by reading [`apps/web/lib/github/`](apps/web/lib/github/) — that's the entire surface that talks to GitHub.

### Three ways to generate

| Mode | How | What it reads | Owns the wrap? |
|---|---|---|---|
| **Username** (default, no login) | Type any GitHub handle | that account's PUBLIC data (via a server app token) | no — unclaimed, claimable later |
| **Sign in with GitHub** | OAuth, `public_repo` scope | public data + private contribution _counts_ (if your profile opts in) | yes (`user_id` set) |
| **Personal access token** | Paste a token (optional) | your private repos too, read-only; **used once, never stored** | no — unclaimed |

Private repos (token mode) only ever feed the **aggregate totals** — a private repo's name, commit messages, and code never appear on the public page.

---

## What you get

| Feature | Where |
|---|---|
| No-login username generation (the viral entry) | `/` (type a handle, hit Wrap) |
| GitHub OAuth via Supabase (read-only `public_repo`) to claim + enrich a wrap | `/` (Sign in) |
| Optional pasted PAT for private-repo totals (used once, never stored) | `/` (include private repos) |
| **"Since Day One" all-time wrap** — your whole GitHub career, lifetime totals | `/u/{username}/all` (year sentinel `0`) |
| Per-IP rate limiting on the no-login path | `lib/rateLimit.ts` |
| Year picker — every year since you joined GitHub + all-time, regenerate | `/generate` |
| Animated Flutter wasm player — 11 slides, ~55 seconds, synthwave loop | `/u/{username}/{year}` |
| **Two archetype engines**: 15 yearly (behavior pattern) + 9 lifetime (tenure + scale) | computed server-side |
| Discipline score 0–100 (consistency × streak × volume × balance) | shown on slide 8 |
| Devicon SVG tiles for top languages (79 supported), Twemoji archetypes | Languages + Archetype slides |
| Boldonse display font for hero numbers, DepartureMono CRT font for labels | every slide |
| 3px engineering-grid texture overlay + decorative VS Code codicons | every slide |
| Bespoke world-map backdrop for the rare Globe Trotter archetype | Archetype slide only |
| Permanent public share URL + 1200×630 OG card (per-archetype themed) | `/u/{username}/{year}` + `/opengraph-image` |
| Web Share + X / LinkedIn / Reddit / copy-link | revealed after the player ends |
| `/me` dashboard — all your wrappeds, views, created date, regenerate, delete | `/me` |
| Tiered landing social-proof strip (adapts copy as numbers grow) | `/` |
| Marquee deck of all 23 archetypes (15 yearly + 8 lifetime unlocks) | `/` |
| Privacy + Terms pages | `/privacy`, `/terms` |
| Full SEO stack: root + per-page metadata, JSON-LD, sitemap, robots, GSC verified | route conventions |
| Web manifest + full favicon set (ICO, PNG, SVG, Apple touch) | `apps/web/app/` |
| `prefers-reduced-motion` respected | CSS + Flutter |

---

## Quick start (self-host)

If you trust the hosted version, just go to **<https://yearincode.com>**. If you want to run your own instance:

```bash
# 1. Clone + install
git clone https://github.com/Hitesh-Meghwal/yearincode
cd yearincode
pnpm install
flutter pub get --directory=apps/player

# 2. Configure a Supabase project (free tier) and a GitHub OAuth app.
#    Details + the 6 SQL migrations are in the "Local setup" section below.
cp apps/web/.env.example apps/web/.env.local
# fill in apps/web/.env.local with your Supabase + GitHub OAuth credentials

# 3. Build the Flutter player (Windows / PowerShell)
.\scripts\build-player.ps1
# or raw: cd apps/player && flutter build web --release --wasm --base-href "/player/" --pwa-strategy=none

# 4. Run
pnpm dev
# open http://localhost:3000
```

If anything trips, jump straight to [Common gotchas](#common-gotchas) — most setup failures are listed there with the exact fix.

---

## Repo layout

```
yearincode/
├── apps/
│   ├── web/                        Next.js 16 (App Router) — landing, share, /me, OG, API
│   │   ├── app/
│   │   │   ├── (legal)/            Privacy + Terms
│   │   │   ├── api/                Generate, Cleanup endpoints
│   │   │   ├── auth/callback/      Captures + persists GitHub provider_token
│   │   │   ├── u/[username]/[year]/  Share page + edge OG card
│   │   │   ├── opengraph-image.tsx Root OG card
│   │   │   ├── manifest.ts         PWA manifest
│   │   │   ├── robots.ts           Allow share pages, block /api /generate /me /auth
│   │   │   ├── sitemap.ts          Pulls public wrappeds hourly from Supabase
│   │   │   ├── favicon.ico         Google search-result favicon (legacy fallback)
│   │   │   ├── icon.{svg,png}      Modern browser favicon (192px raster + vector)
│   │   │   └── apple-icon.png      iOS Add-to-Home-Screen icon (180×180)
│   │   ├── public/
│   │   │   ├── player/             Flutter build output (committed; Vercel serves verbatim)
│   │   │   ├── audio/              Synthwave loop for the player
│   │   │   └── icons/              PWA install icons (192px + 512px PNG)
│   │   └── components/             WrappedEmbed (iframe + audio), TwemojiImage, etc.
│   └── player/                     Flutter Web (wasm) — the 11-slide animated player
│       ├── lib/slides/             One file per slide
│       ├── lib/widgets/            Codicon, DeviconImage, TwemojiImage, motion, etc.
│       └── assets/
│           ├── fonts/              Boldonse + DepartureMono
│           ├── lang/               79 Devicon language SVGs
│           ├── codicons/           18 VS Code codicon SVGs
│           ├── stickers/           Confetti SVGs
│           ├── textures/           Tileable PNG textures (3px-tile drives the grid)
│           └── maps/               world.svg (Globe Trotter only)
├── scripts/
│   └── build-player.ps1            One-shot Flutter build + stage + bootstrap patch + SW stub
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql               wrapped_reports table + RLS
│       ├── 0002_view_count_rpc.sql               atomic view-count increment RPC
│       ├── 0003_public_wrapped_stats_rpc.sql     aggregate counts for landing
│       ├── 0004_user_github_tokens.sql           server-side GitHub OAuth token storage
│       ├── 0005_public_wrapped_stats_add_devs.sql adds total_devs to the stats RPC
│       └── 0006_add_github_created_at.sql        captures GitHub join date for the year picker
└── docs/
    └── BRANCH_PROTECTION.md        manual GitHub-UI checklist for protecting main
```

Two pnpm workspaces (`apps/web`, `apps/player`). Flutter build output is committed to `apps/web/public/player/` so Vercel serves it as static assets — no Flutter toolchain on the deploy server.

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

`flutter pub get` resolves `flutter_svg` (used to render Devicon + codicon + world-map assets).

### 2. Set up Supabase

1. Create a new project at <https://supabase.com>.
2. SQL Editor → run the six migrations **in order**:
   - [`0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql) — `wrapped_reports` table, indexes, RLS policies.
   - [`0002_view_count_rpc.sql`](supabase/migrations/0002_view_count_rpc.sql) — `increment_wrapped_view(p_username, p_year)` RPC for share-page view tracking.
   - [`0003_public_wrapped_stats_rpc.sql`](supabase/migrations/0003_public_wrapped_stats_rpc.sql) — `public_wrapped_stats()` RPC for the landing-page social-proof strip.
   - [`0004_user_github_tokens.sql`](supabase/migrations/0004_user_github_tokens.sql) — `user_github_tokens` table where `/auth/callback` persists each user's GitHub access token (service-role only, used by `/api/generate`). Without this, generation fails with `missing_github_token`.
   - [`0005_public_wrapped_stats_add_devs.sql`](supabase/migrations/0005_public_wrapped_stats_add_devs.sql) — extends the stats RPC with `total_devs` (distinct user count) so the landing strip can switch to "X devs have wrapped their year" once it scales.
   - [`0006_add_github_created_at.sql`](supabase/migrations/0006_add_github_created_at.sql) — adds the `github_created_at` column to `user_github_tokens`. `/auth/callback` captures `viewer.createdAt` from GitHub at sign-in and writes it here; the year picker uses it to render every year since the user joined GitHub instead of a hard-coded 5-year window. Without this migration, the auth-callback upsert fails with `column does not exist`.
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
GITHUB_APP_TOKEN=                # Read-only PAT for no-login USERNAME mode (see below)
```

`GITHUB_APP_TOKEN` powers the no-login username path: when a visitor types a handle without signing in, the server reads that account's PUBLIC data with this token. Create a **classic PAT with NO scopes ticked** at github.com/settings/tokens (zero-scope = read public data only, 5,000 req/hr, no write access). Without it, username mode returns `app_token_missing`. It's not needed for the signed-in or pasted-token paths.

### 5. Build the Flutter player

The Next.js share page embeds `apps/web/public/player/index.html` in an iframe. The repo ships with a one-shot build script that handles the Flutter build, copies the output into `apps/web/public/player/`, patches `flutter_bootstrap.js` (strips its service-worker registration), and drops in a self-unregistering SW stub at the path the old SW used to live at.

**PowerShell:**
```powershell
& .\scripts\build-player.ps1
```

**Raw command (if you can't or won't use the script):**
```bash
cd apps/player
flutter build web --release --wasm --base-href "/player/" --pwa-strategy=none
# then copy build/web/* to apps/web/public/player/ and re-patch flutter_bootstrap.js
```

Repeat this whenever you change Flutter code. The Next.js dev server does not watch Flutter sources.

### 6. Run

```bash
pnpm dev
```

Opens at <http://localhost:3000>. Sign in with GitHub → land on the year picker → pick a year → watch the wrapped play (synthwave starts muted, 🔇 in top-right corner unmutes it) → share it.

---

## How it works (the full flow)

### 1. Auth (optional)

Auth is **not required** to generate a wrap — username mode is the default no-login path. Signing in just claims the wrap as yours and adds private contribution counts.

`SignInButton` calls `supabase.auth.signInWithOAuth({ provider: "github", redirectTo: '<site>/auth/callback?next=/generate', scopes: 'read:user user:email read:org public_repo' })`. The `public_repo` scope is intentional — the original `repo` scope made the consent screen read "this app wants to write to all your private code", which scared off prospective users. `public_repo` is read-only on public repos and unlocks the same per-language / per-repo data we need for the aggregation.

In the callback we (a) exchange the code for a session, (b) **capture `provider_token` from that session and persist it to `user_github_tokens` via a service-role client**, and (c) fetch `viewer.createdAt` from GitHub and write it to `user_github_tokens.github_created_at` on the same upsert. (a)+(b) is the only reliable moment to grab the GitHub access token — newer Supabase versions don't expose it on subsequent `getSession()` calls. The table has RLS enabled with no policies, so only the service role can read or write it. Then we redirect to `/generate`.

### 2. Year picker

`/generate` (server component) reads the user, asks `lib/github/joinYear.ts` for the user's GitHub join year (cached in `user_github_tokens.github_created_at`; if absent, it's lazily fetched from GitHub on this very visit using the stored token and persisted for next time), then builds a year list from the current year down to the join year. This means a 2024-vintage account sees 3 years and a 2010-vintage account sees 17 years — no arbitrary 5-year cap. Falls back to past-5-years if the join year can't be resolved.

The picker then queries `wrapped_reports` for any rows the user already owns across those years. Each row renders with either a **View** link (if already generated) or a **Generate** button (if not). Owned wrappeds can be regenerated via a `?force=1` flag on the URL.

Clicking **Generate** navigates to `/generate?year=YYYY`, which:
- Re-checks the DB for that specific year — if a wrapped exists and `force` isn't set, redirects straight to the share page.
- Otherwise renders `GenerateClient` with `year={YYYY}` as a prop.

### 3. Generation

`POST /api/generate` accepts a body of `{ year?, username?, token?, allTime? }` and resolves one of **three modes**:

- **authenticated** (no `username`/`token` in body): reads the signed-in user's stored token from `user_github_tokens` via the service-role client. If no row exists, returns `missing_github_token` and the UI offers "Sign out & sign in →". Row is owned (`user_id` set), written through RLS.
- **username** (`{ username }`, no auth): fetches that handle's PUBLIC data with `GITHUB_APP_TOKEN`. Row is unclaimed (`user_id = null`), written via service role. Rate-limited per IP.
- **pat** (`{ token }`): uses the pasted token once (never stored) to read the token owner's own data, private repos included. Row is unclaimed.

The no-auth modes are **rate-limited** (`lib/rateLimit.ts`, default 8 req / 10 min per IP) and protected by an **ownership guard** — an anonymous request never overwrites a wrap a signed-in user has claimed.

The fetch + aggregate pipeline (`lib/github/fetchCommits` → `lib/aggregator`):
- GraphQL `contributionsCollection` (viewer or by-login) for repo list + commit counts + language sizes; per-repo paginated `history(author:{id})` for commit metadata + additions/deletions. Max 5 repos in parallel, 30 pages × 100 commits per repo.
- Aggregates totals, streaks, time patterns, top languages/repos/collaborators, message stats, and the **discipline score** (`0.40 × consistency + 0.30 × streak + 0.20 × volume + 0.10 × balance`).
- **Yearly**: `lib/archetypes` runs the 15-rule yearly engine (first match wins). Stores under the calendar year.
- **All-time** (`year: "all"` / `allTime`): `fetchWrappedDataAllTime` loops year-by-year from the account's join date → now (GitHub caps the contributions connection at a 1-year span), merges into lifetime totals, and `lib/archetypesLifetime` runs the **9-rule lifetime engine** (tenure + scale: Architect → OG → Veteran → Lifer → Prolific → Comeback → Journeyman → Rookie → Builder). Stored under the sentinel `year = 0`; share URL is `/u/{username}/all`.

Upserts into `wrapped_reports` (unique on `github_username + year`). 0-commit results return `error: 'no_commits'`.

### 4. Share page

`/u/[username]/[year]` server-fetches the row, mounts `SharePageClient` → `WrappedEmbed` which renders the Flutter player in an iframe with the stats encoded as `?stats={base64url(JSON)}` plus a `?v={wasmMtime}` cache-buster (the mtime of `main.dart.wasm` — `.last_build_id` doesn't change reliably between Dart-only edits, so we use the wasm file mtime instead). The plain-text stats summary below the player doubles as the accessibility / no-JS fallback.

Audio: a single `<audio>` element next to the iframe loops `/audio/monume-synthwave-retro-80s-519247.mp3` muted on mount (browsers allow `autoplay + muted`); a 🔇/🔊 toggle in the iframe's top-right corner unmutes it (the click is a fresh user gesture that always satisfies autoplay policy even if the initial muted autoplay was blocked). The audio auto-pauses when the player postMessages `{ type: 'wrapped:ended' }`.

The page also fires `increment_wrapped_view(p_username, p_year)` fire-and-forget so the view count ticks up on every render. Once the Flutter player finishes, it calls a `window.notifyWrappedEnded()` shim that `postMessage`s `{ type: 'wrapped:ended' }` to the parent, and the share buttons fade in.

### 5. OG card

Two OG image routes:

- **`/u/[username]/[year]/opengraph-image`** — edge-rendered 1200×630 PNG via `next/og`, themed with the archetype's primary/secondary colors. Picked up by Twitter, LinkedIn, Slack, etc. via the OG meta tags emitted by `generateMetadata`.
- **`/opengraph-image`** — edge-rendered root OG card with the dot-grid backdrop and pink "wrapped." headline. Used when someone shares `yearincode.com` itself.

Both run on the **edge runtime** to sidestep a Windows-only Next.js bundled-font path bug.

### 6. Player

The Flutter app is rendered inside a **540×960 design canvas** wrapped in `FittedBox(contain)`, then scaled to whatever the iframe gives it on the host page. Slides assume the 540×960 dimensions internally, so absolute positioning is safe. `ClipRRect(6)` rounds the corners to match the iframe wrapper's mask.

Eleven slides, each 5–6 seconds, ~55 seconds total runtime:

1. **Intro** — Boldonse headline addressed to the user, avatar circle, "Here's how you shipped"
2. **Commits** — Boldonse hero number + sub-caption + faint git-commit dot column running down the right edge
3. **Lines** — solid green/red blocks with Boldonse +/- glyphs + a yellow NET sticker on the seam
4. **Languages** — numbered 1–5 chart with real Devicon SVG logos on soft white plates, percentage bar fill behind each row; ghosted "open slot" rows pad to 5 when sparse
5. **Peak hour** — Boldonse HH:00 + UTC label + ghosted clockface codicon low-left + 24-row hour distribution rail on the right edge
6. **Top repo** — Boldonse commit count + ghosted folder codicon top-right + privacy-safe density grid (no repo names exposed)
7. **Streak** — Boldonse day count + ghosted flame codicon top-right + 52-week calendar grid with the streak window highlighted
8. **Discipline** — Boldonse 0–100 score + grade word + animated progress bar (LinkedIn-tier slot for "ELITE", "LOCKED IN", "STEADY", etc.)
9. **Collaborator** — two-up overlapping initial circles; lone-wolf fallback with the 🐺 Twemoji
10. **Archetype** — Twemoji centerpiece, Boldonse name, rarity stamp, description, confetti overlay. The rare Globe Trotter archetype gets a bespoke world-map SVG backdrop none of the other 14 see.
11. **Outro** — concert-ticket / receipt stub with dotted-leader stat rows + faux barcode

Every slide gets a 3px-tile texture overlay (18% opacity) baked into `SlideScaffold` for engineering-grid-paper feel. Archetype emojis use Twemoji-via-jsDelivr (not the user's OS font) so the visual matches the landing-page archetype deck exactly across browsers, OSes, and the wasm renderer.

Animations respect `MediaQuery.disableAnimations` (reduced motion). FadeIn / ScaleIn / GentlePulse / ConfettiBurst all skip to their final state under reduced motion.

### 7. Cache busting

The Flutter wasm bundle was the source of months of "I changed it but the browser still shows the old one" pain. The current setup eliminates that:

- **`next.config.ts`** sets `Cache-Control: no-store` on `/player/*` so future fetches always come from the origin.
- **Iframe URL** appends `?v={mtime}` of `main.dart.wasm` so even cached HTML re-fetches when you rebuild.
- **`apps/web/public/player/flutter_service_worker.js`** is a self-unregistering stub — any browser that registered the old Flutter SW (which served stale wasm and caused grey-screen crashes) wipes its caches and unregisters itself on the next visit.
- **`scripts/build-player.ps1`** re-applies the bootstrap patch and re-drops the SW stub on every rebuild so they survive the destructive copy.

### 8. SEO

Foundation laid in code; ranking remains a function of backlinks + time:

- **Root metadata** (`app/layout.tsx`): full `metadataBase`, title template, keywords, authors, OG, Twitter, robots directives (`max-image-preview: large`), Google Search Console verification token, manifest link, theme color, locale.
- **Per-share metadata** (`/u/[username]/[year]/page.tsx`): canonical URL, OG `type: profile`, explicit `robots: index, follow`, dynamic title/description with the archetype emoji.
- **JSON-LD structured data**: `WebSite` + `SoftwareApplication` (DeveloperApplication, free) on root. `ProfilePage` with Person + CreativeWork on each share page.
- **OG cards**: dynamic edge-rendered for both root and share pages.
- **Sitemap** (`app/sitemap.ts`): auto-pulls every `is_public` wrapped + static pages, revalidates hourly.
- **Robots** (`app/robots.ts`): allow share pages; disallow `/api`, `/generate`, `/me`, `/auth`.
- **PWA manifest** (`app/manifest.ts`): installable on Android/iOS/Chrome desktop.
- **Favicon set**: ICO + 192×192 PNG + SVG + 180×180 Apple touch icon. PWA-spec 192px + 512px PNGs in `public/icons/`.

Submitted to Google Search Console + Bing Webmaster Tools (Bing covers DuckDuckGo + ChatGPT search).

---

## Deployment

The canonical deployment is **<https://yearincode.com>**. If you want to run your own private instance for personal or learning use, the codebase ships as a standard Next.js + Supabase app and deploys to any Node-compatible host. Bring your own Supabase project, your own GitHub OAuth app, and your own credentials — full configuration is in the [Local setup](#local-setup) section above. Refer to your host's documentation for environment variables and build commands.

The Flutter player assets in `apps/web/public/player/` are committed to the repo, so they're served as static files. After any Flutter change, rebuild locally (`scripts/build-player.ps1`) and commit the regenerated directory.

---

## Common gotchas

| Symptom | Fix |
|---|---|
| `missing_github_token` from `/api/generate` | Your row in `user_github_tokens` is missing. Use the "Sign out & sign in →" button on the error screen. The `/auth/callback` handler captures and persists the token on a fresh sign-in. If it still fails: verify migration `0004` was applied. |
| Vercel build warns "Vulnerable version of Next.js" | Bump: `pnpm --filter web add next@latest`, rebuild, redeploy. |
| OG image 500 on local dev (Windows) | Known Next.js bundled-font path bug. Both OG routes use `export const runtime = "edge"` to sidestep it. |
| Iframe says "Module not found" or shows blank | The Flutter build wasn't copied — re-run `scripts/build-player.ps1`. |
| Iframe shows OLD content after rebuild | Browser cached the previous wasm. Hard-refresh once; the SW stub unregisters any stale Flutter SW and `Cache-Control: no-store` on `/player/*` prevents repeat caching. |
| Grey / blank player slide | Used to be `ImageFilter.blur` crashing the wasm renderer + stale SW. Both are fixed. If you see new occurrences, check whether you've added a new `BackdropFilter` / `ImageFilter.blur`. |
| Audio doesn't play on first load | Browser blocked autoplay before any user gesture. Click the 🔇 button — it doubles as the unmute trigger. |
| Supabase migration "policy already exists" | The migrations use `drop policy if exists` first, so re-runs are safe. |
| Migration `0005` "cannot change return type" | Run `DROP FUNCTION IF EXISTS public_wrapped_stats();` first, then the migration. |
| Sign-in fails silently after deploy + auth-callback logs "column `github_created_at` does not exist" | Migration `0006` not applied. Run it in the Supabase SQL editor. |
| Year picker still showing only the past 5 years for a long-tenured user | Either (a) `0006` not applied, or (b) the user signed in before this code shipped — solution: hit `/generate` once, which lazily fetches + persists the join year. Picker will show the full range from the next visit. |
| Stale "Invalid refresh token" 500 on `/me` after long inactivity | `getUserSafe` / `getSessionSafe` already catch this. Hard-refresh; the broken cookie clears and the page returns to "signed out" state. |
| Hero number overlapping its label on a Pattern B slide | Boldonse needs `height: 1.15` (not 0.9) and `SizedBox(height: 18)` after the hero block. The tall caps overflow tighter line boxes. |
| Languages slide looks empty for someone with few langs | The slide pads to 5 rows with ghosted "open slot" placeholders. If you see no placeholders, you're on an older build — rebuild. |
| New year picker shows "Not generated yet" forever | Did you apply migration `0002`? View count + row existence both come from the same `wrapped_reports` table; the picker checks `user_id` ownership. |
| Landing strip stays on "just launched" even after wrappeds exist | Migration `0005` not applied. The RPC needs the new `total_devs` column shape. |
| Generic globe icon in Google search results instead of our logo | Google's favicon crawler runs 3–14 days behind page indexing. Make sure `app/favicon.ico` and `app/icon.png` exist (they do), then wait. Cannot be forced. |
| Twemoji icon (⚔️, 🌍, etc.) shows as a monochrome glyph in the player | Old wasm cached. Hard-refresh. The Flutter player loads emojis as Twemoji PNGs via jsDelivr, never the system emoji font. |

---

## Contributing

PRs welcome — bug fixes, slide polish, new archetypes, SEO improvements. Full guide in [CONTRIBUTING.md](CONTRIBUTING.md). The TL;DR:

- Conventional Commits, scoped (`feat(player):`, `fix(auth):`).
- Open a PR from a branch — `main` is protected, direct pushes are blocked. See [docs/BRANCH_PROTECTION.md](docs/BRANCH_PROTECTION.md) for the rules.
- Don't add new dependencies in a feature PR without discussion.
- Don't edit shipped SQL migrations — add a new one.
- Don't refactor unrelated code in a feature PR — open a separate refactor PR.

**Maintainer:** all PRs route to [@Hitesh-Meghwal](https://github.com/Hitesh-Meghwal) via [`CODEOWNERS`](.github/CODEOWNERS).

**Bug?** Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) — please include the deployed URL of your wrapped + your GitHub username so we can reproduce.

**Idea?** Open a [GitHub Discussion](https://github.com/Hitesh-Meghwal/yearincode/discussions) before filing a feature request — saves churn on "is this a fit" questions.

---

## Security

Found a vulnerability? **Do not open a public issue.** Email `hiteshm.devlog@gmail.com` (or open a private security advisory on GitHub). Full disclosure policy in [SECURITY.md](SECURITY.md) — TL;DR: we follow a 90-day responsible-disclosure embargo, the supported version is the latest commit on `main`, and we'll credit you on the fix commit unless you'd rather stay anonymous.

The two highest-value security surfaces to scrutinize are:

- **`apps/web/app/api/generate/route.ts`** + **`apps/web/lib/github/`** — the only code that holds a user's GitHub access token. Token is RLS-locked to service-role-only access in the `user_github_tokens` table, never exposed to the browser.
- **`apps/web/lib/supabase/serviceRole.ts`** + every callsite — the service-role client. Currently scoped to two flows (token read + view-count increment); over-use here is the most likely future foot-gun.

---

## Acknowledgements

Built on the shoulders of:

- [Next.js](https://nextjs.org) + [Vercel](https://vercel.com) (hosting + edge OG)
- [Flutter](https://flutter.dev) (Web wasm renderer for the slide player)
- [Supabase](https://supabase.com) (Postgres + Auth + RLS)
- [Devicon](https://devicon.dev) — open-source language logos (the Languages slide tiles)
- [VS Code Codicons](https://microsoft.github.io/vscode-codicons) — the decorative codicon layer
- [Twemoji](https://github.com/jdecked/twemoji) — cross-platform color emoji parity
- [Boldonse](https://fonts.google.com/specimen/Boldonse) (Google Fonts) — the giant display numbers
- [Departure Mono](https://departuremono.com) — the retro-CRT mono used on every kicker + wordmark
- [Pixabay](https://pixabay.com/music/) — synthwave loop on the player

---

## License

Released under the [MIT License](LICENSE). You're welcome to use, fork, study, and build on this code in your own projects. If it helps you, a link back to the repo or a mention is always appreciated — but never a requirement.

---

<div align="center">

If yearincode made you smile, [share your wrap](https://yearincode.com) — it's the only marketing we have.

</div>
