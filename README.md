# yearincode

Spotify Wrapped for your git history. Sign in with GitHub, wait ~15 seconds, get a vertical animated recap of your year — commits, languages, peak hours, top repos, longest streak, and the archetype your patterns earned you.

Live: <https://yearincode-nine.vercel.app>

The full product spec lives in [`docs/PRD.md`](docs/PRD.md). The README below is just the operating manual.

---

## Repo layout

```
yearincode/
├── apps/
│   ├── web/        Next.js 16 app (App Router, Tailwind v4, Supabase, OG card)
│   └── player/     Flutter Web (wasm) animated player — 10 slides, postMessage handoff
├── supabase/
│   └── migrations/ SQL migrations for the wrapped_reports table + RLS
└── docs/
    └── PRD.md      Source of truth for product + technical decisions
```

Two workspaces (`apps/web` and `apps/player`), one `pnpm` workspace root. The Flutter build output gets copied into `apps/web/public/player/` so Next.js serves it as static assets.

---

## Prerequisites

- **Node** ≥ 20 (developed against 23.7.0)
- **pnpm** ≥ 10 (developed against 10.18.3)
- **Flutter SDK** ≥ 3.27 (developed against 3.29.2). Chrome installed for `flutter run -d chrome`.
- **Supabase project** (free tier) with GitHub OAuth provider enabled
- **GitHub OAuth app** (github.com/settings/developers)

---

## Local setup

### 1. Install dependencies

```bash
pnpm install
flutter pub get --directory=apps/player
```

### 2. Create the Supabase project

1. New project at <https://supabase.com>.
2. SQL Editor → paste [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql) → Run.
3. Authentication → Providers → GitHub → enable. Copy the **callback URL** Supabase shows you (e.g. `https://<project-ref>.supabase.co/auth/v1/callback`).
4. Authentication → URL Configuration:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: add `http://localhost:3000/auth/callback`

### 3. Create the GitHub OAuth app

github.com/settings/developers → New OAuth App:

- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: the Supabase callback URL from step 2.4 (not your app's URL — GitHub talks to Supabase first).

Copy the Client ID + Client Secret. Paste them into Supabase → Authentication → Providers → GitHub.

### 4. Wire env vars

```bash
cp apps/web/.env.example apps/web/.env.local
```

Then fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=        # Supabase → Project Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase → Project Settings → API → anon key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase → Project Settings → API → service_role key
GITHUB_CLIENT_ID=                # From the GitHub OAuth app
GITHUB_CLIENT_SECRET=            # From the GitHub OAuth app
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Build the Flutter player (one-time setup)

The Next.js share page embeds `apps/web/public/player/index.html` in an iframe. To produce those static assets:

```bash
cd apps/player
flutter build web --release --wasm --base-href "/player/"
```

Then copy the build to `apps/web/public/player/` (PowerShell):

```powershell
$dest = "..\web\public\player"
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest -Force | Out-Null
Copy-Item -Path "build\web\*" -Destination $dest -Recurse -Force
```

POSIX equivalent:

```bash
rm -rf ../web/public/player
mkdir -p ../web/public/player
cp -R build/web/. ../web/public/player/
```

Repeat this step after any change to Flutter code in `apps/player/`. The Next.js dev server doesn't watch Flutter sources.

### 6. Run

```bash
pnpm dev
```

Opens at <http://localhost:3000>. Sign in → wait → wrapped plays.

---

## Architecture in 90 seconds

1. **Auth.** `SignInButton` → Supabase OAuth → GitHub → Supabase callback → our `/auth/callback?next=/generate` exchanges code for session → redirects to `/generate`.
2. **Generate.** `/generate` (server) short-circuits to `/u/{username}/{year}` if a wrapped exists; else renders `GenerateClient` which POSTs `/api/generate`.
3. **Fetch + aggregate.** `/api/generate` reads `provider_token` from the Supabase session, runs `lib/github/fetchCommits` (GraphQL for contribution metadata + paged commit history, capped at 5 parallel repos), aggregates into `WrappedStats` (`lib/aggregator/*`), assigns an archetype (`lib/archetypes.ts`), upserts into `wrapped_reports`.
4. **Share page.** `/u/[username]/[year]` server-fetches the row, renders the Flutter player in an iframe with `?stats={base64}`, listens for `postMessage({ type: 'wrapped:ended' })`, then reveals share buttons.
5. **OG card.** `/u/[username]/[year]/opengraph-image` (edge runtime) renders a 1200×630 PNG via `next/og` using the same archetype theme as the player.

The 15 archetype rules are evaluated in priority order; first match wins. See PRD §4.5.

---

## Deploying

### Vercel

1. Connect the repo. **Root Directory** = `apps/web`.
2. Add all 6 env vars from §4 above to **Production** scope. For prod, swap `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://yearincode-nine.vercel.app`).
3. After the first build deploys, add the prod URL to:
   - GitHub OAuth app — no change if the callback already points to Supabase's URL (correct setup).
   - Supabase → Authentication → URL Configuration → add `<prod-url>/auth/callback` to Redirect URLs; update Site URL to `<prod-url>`.
4. Trigger a redeploy (env vars added after build aren't baked in automatically).

The Flutter player assets in `apps/web/public/player/` are committed to the repo, so Vercel deploys them as static files — no Flutter toolchain needed on the build server. After any Flutter change, rebuild locally (§5) and commit the regenerated `apps/web/public/player/` directory.

### Custom domain (optional)

Per PRD Checkpoint 8: only do this **after** real users say "yeah, I'd share this." Then buy a domain, point DNS at Vercel, and update the callback/redirect URLs in GitHub OAuth + Supabase to the new origin.

---

## Common gotchas

- **`missing_github_token` from /api/generate.** Supabase isn't persisting the GitHub access token. Fix: Supabase → Authentication → Providers → GitHub → enable "Save provider tokens". Then sign out + back in.
- **Build warns about vulnerable Next.js on Vercel.** Bump: `pnpm --filter web add next@latest`, rebuild, redeploy.
- **OG image 500 on Windows dev.** Known Next 15.1.x bug with the bundled Noto Sans font path. We use `export const runtime = "edge"` on the OG route to sidestep it.
- **Iframe says "Module not found" or shows blank.** The Flutter build wasn't copied — re-run §5.
- **Supabase migration "policy already exists".** The migration uses `drop policy if exists` first, so re-runs are safe.

---

## Contributing

This is a weekend MVP. Conventions:

- **Commit style:** Conventional Commits (`feat:`, `fix:`, `chore:`).
- **No new dependencies** without thinking twice — the stack in PRD §7.1 is intentional.
- **Tests:** none yet. Real tests come after the v1 launch milestone (PRD §11.10).
- **Editor:** VS Code or any LSP-aware editor with TypeScript + Dart support. There's no required `.editorconfig`.

If you find a bug, open an issue with the Vercel deployment URL + your username so it's reproducible.

---

## License

Not yet specified. Personal project; ping the owner before reuse.
