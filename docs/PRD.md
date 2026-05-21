# yearincode — Product Requirements Document

> Version 1.0 · Spotify Wrapped for your code · Built for Claude Code execution

---

## 1. Overview

### 1.1 Product summary
**yearincode** is a web app that generates a beautiful, animated, shareable recap of a developer's coding life from their GitHub activity. Users sign in with GitHub, wait ~15 seconds, and receive a vertical-format animated wrapped video showing their stats — commits, languages, peak hours, top repos, longest streak, and a personality archetype based on their patterns.

### 1.2 One-line pitch
*"Spotify Wrapped for your git history."*

### 1.3 Why it works
- **Built-in virality** — every share is a free user. Wrapped-style content is the most-shared content on the internet.
- **Real pain** — developers constantly need "what did I do this year" content for portfolios, year-end reviews, LinkedIn, taxes.
- **Zero infra to start** — GitHub API + Supabase free tier + Vercel free tier = $0 to ship MVP.
- **Path to revenue** — free personal use, paid team/org tier, agency reports.

### 1.4 Target users (v1)
1. **Indie developers / freelancers** — want shareable content for marketing themselves
2. **Open-source maintainers** — want to celebrate their year publicly
3. **Engineering Twitter / r/programming users** — early adopters who'll share

### 1.5 Success metrics (first 30 days)
- 5,000+ generated wrappeds
- 25% share rate (users who click share button)
- 15% viral coefficient (each share generates 0.15 new users)
- Front page of Hacker News on launch day

---

## 2. Scope

### 2.1 In scope (v1 — weekend MVP)
- GitHub OAuth login
- Fetching commit data from public + private repos user has access to
- Aggregating stats across the last 12 months
- 10-slide animated wrapped via Flutter Web embedded in iframe
- Unique public share URL per user per year
- Open Graph image generation for social previews
- Share buttons for X, LinkedIn, Reddit, copy-link
- Landing page with sample wrapped
- "Generate yours" CTA on every share page (the viral loop)

### 2.2 Out of scope (v1)
- Mobile native apps (iOS/Android)
- Payments / subscriptions
- Team / organization features
- GitLab / Bitbucket support
- Music or sound effects (licensing complexity)
- Direct MP4 video downloads (v2 feature)
- Custom date ranges (v1 = rolling last 12 months only)
- Comparison with friends
- Year-over-year comparison
- Email digests / notifications
- API for third-party integrations

### 2.3 Explicit non-goals
- This is **not** a developer analytics dashboard (no time-series charts, no daily breakdowns)
- This is **not** a code quality tool (no analysis of code itself, only commit metadata)
- This is **not** a replacement for GitHub's own contribution graph

---

## 3. User stories

### 3.1 First-time user (Sarah, indie dev)
1. Sarah sees a tweet linking to `yearincode.com/u/someone-else/2026`
2. The wrapped autoplays in her browser. She watches all 10 slides (~30 seconds)
3. At the end, a big button: **"Generate yours →"**
4. She clicks. Lands on the landing page with the "Sign in with GitHub" button
5. Clicks. GitHub asks her to grant read access to her repos. She approves.
6. Lands on a loading screen. ~15 seconds later, her wrapped starts playing.
7. After watching, she clicks "Share to X"
8. A pre-filled tweet opens: *"My 2026 in code: 84,231 lines, 23-day streak, The Night Owl Refactorer 🦉 → yearincode.com/u/sarah/2026"*
9. She tweets it. Two of her friends click the link the next day.

### 3.2 Returning user
- User lands on `yearincode.com`, sees they're already signed in
- Header shows "Your wrapped → /u/their-username/2026"
- Can regenerate (forces fresh API call if older than 24 hours)
- Can delete their wrapped (removes from DB + invalidates share URL)

### 3.3 Privacy-conscious user
- Can opt out of private repo data with one toggle on the loading screen
- Can delete their wrapped + revoke GitHub access in account settings

---

## 4. Functional requirements

### 4.1 Authentication
- **Provider:** GitHub OAuth via Supabase Auth
- **Scopes requested:** `read:user`, `user:email`, `read:org`, `repo` (read-only)
  - `repo` is needed for private repo access; user can decline and we fall back to public only
- **Session storage:** Supabase managed; HTTP-only cookies
- **Token storage:** Encrypted in Supabase `auth.users` metadata
- **Logout:** Clears session, does not delete user data

### 4.2 Data fetching pipeline
1. After login, redirect to `/generate`
2. Show loading screen with rotating playful copy (see §6.3)
3. Trigger `POST /api/generate` with no body (uses session for auth)
4. Server-side: fetch commits via GitHub API
5. Server-side: aggregate stats
6. Server-side: save to Supabase `wrapped_reports` table
7. Redirect user to `/u/{username}/{year}`

### 4.3 GitHub API integration
- **Primary endpoint:** GraphQL API `https://api.github.com/graphql`
  - Use for: contribution counts, repos contributed to, languages
- **Secondary endpoints:** REST API
  - `GET /repos/{owner}/{repo}/commits` — list commits by author
  - `GET /repos/{owner}/{repo}/commits/{sha}` — per-commit stats (additions/deletions)
- **Rate limiting:** 5,000 requests/hour for authenticated users
  - Implement exponential backoff on 429
  - Cache raw commit data for 24h in Supabase to handle regeneration
- **Pagination:** GitHub paginates at 100/page; loop until `Link: rel="next"` is absent
- **Date range:** rolling last 365 days from `new Date()` at request time

### 4.4 Stats computed (the wrapped data)
The aggregator outputs a single JSON object with these fields:

```typescript
type WrappedStats = {
  // Identity
  username: string;
  avatarUrl: string;
  year: number;
  generatedAt: string; // ISO date
  dateRange: { from: string; to: string };

  // Totals
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  netLines: number; // additions - deletions
  totalRepos: number;
  totalActiveDays: number; // days with at least one commit

  // Time patterns
  peakHour: number; // 0-23, in user's local timezone
  peakHourCommits: number;
  peakDayOfWeek: number; // 0=Sunday, 6=Saturday
  weekendRatio: number; // 0-1, fraction of commits on Sat/Sun
  longestStreak: { days: number; from: string; to: string };
  
  // Language breakdown
  topLanguages: Array<{ name: string; commits: number; percentage: number }>; // top 5
  
  // Repository ranking
  topRepos: Array<{ name: string; commits: number; isPrivate: boolean }>; // top 5
  
  // Collaboration
  topCollaborators: Array<{ username: string; sharedCommits: number }>; // top 3
  
  // The vibe check (killer feature)
  archetype: {
    id: string; // e.g., "night-owl-refactorer"
    name: string; // e.g., "The Night Owl Refactorer"
    emoji: string; // e.g., "🦉"
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  };
  
  // Fun stats
  longestCommitMessage: { text: string; sha: string; repo: string };
  shortestCommitMessage: { text: string; sha: string; repo: string };
  totalCommitMessages: { exclamations: number; questions: number; allCaps: number };
};
```

### 4.5 Archetype detection (the "vibe check")
Implemented as a rules engine in `lib/archetypes.ts`. Returns the first matching archetype in priority order.

| ID | Name | Emoji | Trigger conditions | Rarity |
|----|------|-------|-------------------|--------|
| `night-owl-refactorer` | The Night Owl Refactorer | 🦉 | peak hour 0-5 AND weekend ratio < 0.3 | uncommon |
| `weekend-warrior` | The Weekend Warrior | ⚔️ | weekend ratio > 0.6 | uncommon |
| `metronome` | The Metronome | ⏱️ | longest streak > 90 days | rare |
| `refactorer` | The Refactorer | 🔥 | deletions > additions × 1.5 | rare |
| `polyglot` | The Polyglot | 🌍 | top language < 40% AND uses 5+ languages | uncommon |
| `monolith` | The Monolith | 🗿 | top repo > 70% of all commits | common |
| `dawn-patrol` | The Dawn Patrol | 🌅 | peak hour 5-8 | uncommon |
| `lunch-coder` | The Lunch Hour Hero | 🥪 | peak hour 12-13 | common |
| `marathoner` | The Marathoner | 🏃 | total commits > 2000 | rare |
| `sprinter` | The Sprinter | 💨 | most commits in single day > 50 | uncommon |
| `consistent` | The Consistent One | 📈 | active days > 250 (about 70% of year) | rare |
| `social-coder` | The Social Coder | 🤝 | top collaborator > 50 shared commits | common |
| `lone-wolf` | The Lone Wolf | 🐺 | zero collaborators | common |
| `globe-trotter` | The Globe Trotter | ✈️ | commits across 3+ timezones (peak hour varies wildly) | legendary |
| `default` | The Builder | 🔨 | (fallback) | common |

### 4.6 Database schema (Supabase)

```sql
-- Already created by Supabase Auth: auth.users

CREATE TABLE wrapped_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL,
  year INTEGER NOT NULL,
  stats_json JSONB NOT NULL,
  raw_commit_cache JSONB, -- expires after 24h, used for regeneration
  cache_expires_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(github_username, year)
);

CREATE INDEX idx_wrapped_username_year ON wrapped_reports(github_username, year);
CREATE INDEX idx_wrapped_user_id ON wrapped_reports(user_id);

-- Row Level Security
ALTER TABLE wrapped_reports ENABLE ROW LEVEL SECURITY;

-- Public can read all public wrappeds
CREATE POLICY "Public wrappeds are viewable by everyone"
  ON wrapped_reports FOR SELECT
  USING (is_public = TRUE);

-- Users can only insert/update/delete their own
CREATE POLICY "Users can manage their own wrappeds"
  ON wrapped_reports FOR ALL
  USING (auth.uid() = user_id);
```

### 4.7 Animated player (Flutter Web)
- **Build target:** Flutter Web (`flutter build web --release --wasm`)
- **Deployment:** Static assets served from `/public/player/` in the Next.js project
- **Embedding:** `<iframe src="/player/index.html?stats={base64}" />` on the share page
- **Communication:** `postMessage` from Flutter → parent on animation end (`{ type: 'wrapped:ended' }`)
- **Dimensions:** 1080×1920 (vertical), responsive via CSS to fit `max-width: 540px` on desktop, full width on mobile
- **Slide sequence:** see §6.4

### 4.8 Open Graph image generation
- **Library:** `@vercel/og` (built into Next.js)
- **Endpoint:** `app/u/[username]/[year]/opengraph-image.tsx`
- **Output:** 1200×630 PNG, cached at edge after first generation
- **Content:**
  - User's GitHub avatar (top-left)
  - "@username's 2026 in code"
  - Hero stat: e.g., "84,231 lines"
  - Archetype badge with emoji
  - yearincode.com watermark (bottom-right)

### 4.9 Share functionality
- **Web Share API** on mobile (`navigator.share()`)
- **Fallback links** on desktop:
  - X: `https://twitter.com/intent/tweet?text={text}&url={url}`
  - LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url={url}`
  - Reddit: `https://reddit.com/submit?url={url}&title={text}`
  - Copy link button with toast confirmation
- **Pre-filled text:** `"My {year} in code: {totalCommits} commits, {longestStreak}-day streak, {archetype} {emoji}"`

---

## 5. Non-functional requirements

### 5.1 Performance
- Landing page: First Contentful Paint < 1s, LCP < 2s
- Share page: FCP < 1.5s (the iframe player loads after)
- Wrapped generation: < 20s for users with < 1000 commits, < 60s for power users
- GitHub API parallelization: fetch multiple repos concurrently (max 5 in parallel)

### 5.2 Reliability
- Graceful degradation if GitHub API rate-limits: show friendly error with retry timer
- Idempotent generation: regenerating within 24h uses cached commit data
- Database backup: Supabase daily backups (automatic on paid tier; rely on RLS for now)

### 5.3 Privacy & security
- Encrypt GitHub access tokens at rest in Supabase
- Never store actual commit message content beyond what's needed for stats
- Make wrapped public by default, but provide `is_public` toggle
- Honor "delete my account" — cascade deletes via `ON DELETE CASCADE`
- Privacy policy + terms of service pages (template OK for v1)

### 5.4 SEO
- Each public wrapped page has unique meta tags
- Sitemap.xml auto-generated from public wrappeds
- robots.txt allows indexing of share pages, blocks `/api/*` and `/generate`

### 5.5 Accessibility
- Keyboard navigation on landing + share pages
- Screen reader summary of wrapped stats (visually-hidden `<h2>` + structured list)
- Animation respects `prefers-reduced-motion` — falls back to static stat cards
- Color contrast: WCAG AA minimum on all text

### 5.6 Browser support
- Chrome, Safari, Firefox, Edge — last 2 major versions
- Mobile Safari iOS 15+
- Chrome Android last 2 versions

---

## 6. Design specification

### 6.1 Design language
**Direction:** Spotify Wrapped energy (loud, colorful, playful) — not Linear-minimalist.

- **Vibe:** celebratory, personal, share-worthy
- **Type:** Geist Sans (Vercel's free font) or Inter
- **Mono:** Geist Mono or JetBrains Mono for code/numbers
- **Animation:** punchy, with overshoot easing (`Curves.easeOutBack`)
- **Sound:** none in v1 (avoid licensing)

### 6.2 Color palette
Each archetype has its own color theme that propagates through the wrapped:

| Archetype | Primary | Secondary | Background |
|-----------|---------|-----------|------------|
| Night Owl | `#7C3AED` (purple) | `#FBBF24` (amber) | `#0F0524` |
| Weekend Warrior | `#EF4444` (red) | `#FBBF24` (amber) | `#1A0A0A` |
| Metronome | `#06B6D4` (cyan) | `#FFFFFF` | `#000814` |
| Refactorer | `#F97316` (orange) | `#000000` | `#1A0E05` |
| Polyglot | `#10B981` (emerald) | `#EC4899` (pink) | `#02180F` |
| Default Builder | `#3B82F6` (blue) | `#F59E0B` (amber) | `#0A0F1F` |

(Fallback: deep blue/purple gradient for unmatched archetypes)

### 6.3 Loading screen copy (rotating)
Plays in sequence during the ~15s wait:
1. "Counting your commits..."
2. "Judging your 3 AM merges..."
3. "Measuring your snake_case habits..."
4. "Calculating your refactor:feature ratio..."
5. "Quietly noticing how many TODOs you've ignored..."
6. "Ranking your branches by chaos..."
7. "Almost there — preparing the verdict..."

### 6.4 Wrapped slide sequence

Each slide is 3s, total ~30s.

**Slide 1 — Intro (3s)**
- "Hey @username 👋"
- "Here's your year in code"
- Animation: text fades in, slight scale-up, particle confetti

**Slide 2 — Total commits (3s)**
- Number counts up from 0 → final value with elastic easing
- "You committed **{N}** times this year"
- Bottom comparison: "That's more than 84% of developers" (use percentile cohorts)

**Slide 3 — Lines (3s)**
- Two bars race horizontally: green (additions), red (deletions)
- "You wrote **{additions}** lines and deleted **{deletions}**"
- Net: "+{netLines}" badge

**Slide 4 — Languages (3s)**
- Pie chart spins in, top 5 segments labeled
- "Your top language was **{topLanguage}** ({percentage}%)"

**Slide 5 — Peak hour (3s)**
- Clock face, hand sweeps to peak hour
- "You commit most at **{peakHour}:00**"
- Snarky comment based on hour: 2 AM → "👀 we see you", 9 AM → "model citizen", noon → "lunch break legend"

**Slide 6 — Top repo (3s)**
- Repo card flies in
- "Your main character was **{topRepo}**"
- "**{commits}** commits to this one repo"

**Slide 7 — Streak (3s)**
- Calendar grid animates green cells filling in
- "Your longest streak: **{days}** days"
- "From {fromDate} to {toDate}"

**Slide 8 — Top collaborator (3s)**
- Two avatars circle each other
- "You and **@{collaborator}** shipped **{sharedCommits}** PRs together"
- (Skip slide if no collaborator)

**Slide 9 — Archetype (4s — emphasis)**
- Dramatic reveal with the archetype emoji enlarged
- "You are..."
- "**The Night Owl Refactorer 🦉**"
- "{archetype.description}"
- Rarity badge: "rare ✨" if applicable

**Slide 10 — Outro (4s — viral)**
- Recap: username + key stats summarized as a "card" design
- "Share your wrapped"
- Share buttons fade in: X, LinkedIn, Reddit, copy
- Bottom: "Generate yours → yearincode.com"

---

## 7. Technical architecture

### 7.1 Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend framework | Next.js 15 (App Router) | SEO, OG cards, fast routing, Vercel native |
| Styling | Tailwind CSS v4 | Speed, no design system overhead |
| Auth | Supabase Auth | GitHub OAuth out of the box |
| Database | Supabase Postgres | Free tier sufficient, RLS built-in |
| Animated player | Flutter Web | Best-in-class animations, single codebase for future mobile |
| Storage (OG cache) | Cloudflare R2 | Cheap egress, fast |
| Hosting | Vercel | Free tier, edge functions, OG image native |
| Domain | `yearincode.com` | Buy via Porkbun (~$12/yr) |
| Analytics | Vercel Analytics (free tier) + Plausible (optional) | Privacy-friendly |
| Error tracking | Sentry (free tier) | Catch prod issues early |

### 7.2 Project structure

```
yearincode/
├── apps/
│   ├── web/                          # Next.js app
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── generate/
│   │   │   │   └── page.tsx          # Loading screen → triggers API
│   │   │   ├── u/
│   │   │   │   └── [username]/
│   │   │   │       └── [year]/
│   │   │   │           ├── page.tsx  # Share page (embeds player)
│   │   │   │           └── opengraph-image.tsx
│   │   │   ├── auth/
│   │   │   │   └── callback/route.ts # OAuth callback
│   │   │   ├── api/
│   │   │   │   ├── generate/route.ts
│   │   │   │   └── wrapped/[id]/route.ts
│   │   │   └── settings/page.tsx     # Delete wrapped, sign out
│   │   ├── components/
│   │   │   ├── LandingHero.tsx
│   │   │   ├── ShareButtons.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── WrappedEmbed.tsx      # The iframe wrapper
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   └── server.ts
│   │   │   ├── github/
│   │   │   │   ├── client.ts         # GraphQL + REST client
│   │   │   │   ├── fetchCommits.ts
│   │   │   │   └── queries.ts        # GraphQL queries
│   │   │   ├── aggregator/
│   │   │   │   ├── index.ts          # Main aggregator
│   │   │   │   ├── timePatterns.ts
│   │   │   │   ├── languages.ts
│   │   │   │   ├── streaks.ts
│   │   │   │   └── collaborators.ts
│   │   │   ├── archetypes.ts         # Vibe check logic
│   │   │   └── types.ts              # Shared TypeScript types
│   │   ├── public/
│   │   │   └── player/               # Built Flutter Web assets
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── .env.local
│   │
│   └── player/                       # Flutter Web project
│       ├── lib/
│       │   ├── main.dart
│       │   ├── models/
│       │   │   └── wrapped_stats.dart
│       │   ├── slides/
│       │   │   ├── intro_slide.dart
│       │   │   ├── commits_slide.dart
│       │   │   ├── lines_slide.dart
│       │   │   ├── languages_slide.dart
│       │   │   ├── peak_hour_slide.dart
│       │   │   ├── top_repo_slide.dart
│       │   │   ├── streak_slide.dart
│       │   │   ├── collaborator_slide.dart
│       │   │   ├── archetype_slide.dart
│       │   │   └── outro_slide.dart
│       │   ├── widgets/
│       │   │   ├── slide_controller.dart
│       │   │   ├── count_up_text.dart
│       │   │   ├── pie_chart.dart
│       │   │   └── calendar_grid.dart
│       │   └── themes/
│       │       └── archetype_themes.dart
│       ├── pubspec.yaml
│       └── web/
│           └── index.html
│
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
├── .gitignore
├── README.md
└── package.json                       # Monorepo root (pnpm workspaces)
```

### 7.3 Environment variables

```bash
# Next.js — apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production additions
SENTRY_DSN=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

### 7.4 API contracts

**`POST /api/generate`**
- Auth: requires session
- Body: none
- Response: `{ wrappedId: string, redirectUrl: string }` or `{ error: string, retryAfter?: number }`
- Side effects: hits GitHub API, writes to `wrapped_reports`

**`GET /api/wrapped/[id]`**
- Auth: public (for public wrappeds)
- Response: `WrappedStats` JSON
- Side effects: increments `view_count`

**`DELETE /api/wrapped/[id]`**
- Auth: requires session, must own the wrapped
- Response: `{ success: true }`

---

## 8. Build plan (checkpoint-driven)

Build is divided into 7 checkpoints. Each checkpoint is a working, testable thing — not a time block. Hit one, verify it works, move to the next. No premature polish, no out-of-order work.

**Rule:** finish one checkpoint completely before starting the next. If a checkpoint feels too big, split it — never compress two into one.

---

### Checkpoint 1 — Auth works

**Goal:** sign in with GitHub, see your username, sign out.

- [ ] Initialize Next.js 15 project with TypeScript + Tailwind v4
- [ ] Set up monorepo structure per §7.2 (pnpm workspaces, `apps/web/`)
- [ ] Configure GitHub OAuth app at github.com/settings/developers
  - Callback: `http://localhost:3000/auth/callback`
- [ ] Create Supabase project, enable GitHub OAuth provider
- [ ] Build `app/auth/callback/route.ts` — handle OAuth return
- [ ] Build minimal landing page with "Sign in with GitHub" button
- [ ] Build a temporary `/me` page that displays the logged-in user's GitHub username

**Done when:** clicking "Sign in" → GitHub prompts for permission → redirects back → `/me` shows your username. Sign-out clears the session.

---

### Checkpoint 2 — Data pipeline works (raw JSON)

**Goal:** pull real commits from your GitHub, compute stats, see the output as JSON.

- [ ] Build `lib/types.ts` — all TypeScript types from §4.4
- [ ] Build `lib/github/client.ts` — GraphQL + REST clients with retry / rate-limit handling
- [ ] Build `lib/github/fetchCommits.ts` — pull commits from last 365 days across all accessible repos
- [ ] Build `lib/aggregator/*` — compute every stat in `WrappedStats`
- [ ] Build `lib/archetypes.ts` — the vibe check rules from §4.5
- [ ] Build `app/api/generate/route.ts` — orchestrate fetch → aggregate → return JSON
- [ ] Test by visiting `/api/generate` while logged in

**Done when:** hitting `/api/generate` returns valid JSON matching `WrappedStats` with your real stats. Check archetype assignment makes sense.

---

### Checkpoint 3 — Storage works (plain HTML share page)

**Goal:** persist a generated wrapped and view it at a permanent URL — no animation yet.

- [ ] Run Supabase migration `0001_initial_schema.sql` from §4.6
- [ ] Update `/api/generate` to `INSERT` results into `wrapped_reports`
- [ ] Build `app/u/[username]/[year]/page.tsx` — fetches the row by username+year, renders stats as plain HTML (a simple list, no design)
- [ ] Update post-generation redirect to send user to `/u/{username}/{year}`

**Done when:** generating a wrapped saves it to Supabase, and visiting `/u/your-username/2026` shows your stats as plain text. Closing the browser and revisiting works.

---

### Checkpoint 4 — Player works (standalone)

**Goal:** Flutter Web app plays a wrapped end-to-end as a standalone app.

- [ ] Initialize Flutter project in `apps/player/` (Flutter 3.27+)
- [ ] Build `models/wrapped_stats.dart` matching the TypeScript type
- [ ] Build slide controller + all 10 slides from §6.4 (start with all slides as static placeholders, then animate)
- [ ] Build `themes/archetype_themes.dart` with per-archetype color schemes
- [ ] Wire URL param parsing — read `?stats={base64}` and decode into `WrappedStats`
- [ ] Run `flutter run -d chrome` and verify the wrapped plays start to finish

**Done when:** `flutter run -d chrome` opens a browser tab and your wrapped plays all 10 slides in sequence with animations. Don't worry about polish — just that every slide works.

---

### Checkpoint 5 — Integrated

**Goal:** the Flutter player is embedded in the Next.js share page.

- [ ] `flutter build web --release --wasm`
- [ ] Copy build output to `apps/web/public/player/`
- [ ] Update share page `/u/[username]/[year]` to render `<iframe src="/player/index.html?stats={base64}">`
- [ ] Build `components/WrappedEmbed.tsx` wrapping the iframe with correct sizing
- [ ] Wire `postMessage` listener for `{ type: 'wrapped:ended' }` to show share buttons after animation

**Done when:** visiting `/u/your-username/2026` plays the animated wrapped in an iframe, with share buttons appearing at the end.

---

### Checkpoint 6 — Shareable

**Goal:** the share page looks great when posted anywhere on the internet.

- [ ] Build `app/u/[username]/[year]/opengraph-image.tsx` using `@vercel/og` (1200×630)
- [ ] Build `components/ShareButtons.tsx` — X, LinkedIn, Reddit, copy link
- [ ] Pre-fill share text per §4.9
- [ ] Build proper landing page at `/` per §6.1 design language
- [ ] Add a sample wrapped video on the landing page (record yours, drop as MP4 for now)

**Done when:** pasting your share URL into X / LinkedIn / Slack shows a properly styled preview card with your avatar, top stat, and archetype.

---

### Checkpoint 7 — Live

**Goal:** anyone on the internet can use it.

- [ ] Push to GitHub (private repo is fine)
- [ ] Deploy to Vercel — connect repo, set env vars
- [ ] Default URL: `yearincode.vercel.app` (free)
- [ ] Add production callback URL to GitHub OAuth app: `https://yearincode.vercel.app/auth/callback`
- [ ] Add production redirect URL to Supabase Auth settings
- [ ] Test full flow end-to-end on production from your phone
- [ ] Ask 3-5 friends to try it on their devices

**Done when:** a friend can generate their wrapped from their own phone with no help from you.

---

### Checkpoint 8 (optional, post-validation) — Custom domain + launch

Only do this **after** friends say "yeah I'd share this."

- [ ] Buy `yearincode.com` on Porkbun (~$12/yr)
- [ ] Add custom domain in Vercel
- [ ] Update GitHub OAuth callback to `https://yearincode.com/auth/callback`
- [ ] Update Supabase redirect URLs
- [ ] Verify SSL works
- [ ] Post launch tweet thread
- [ ] Submit to Hacker News (Show HN)
- [ ] Post in r/programming, r/webdev, dev.to

**Done when:** the product is live on `yearincode.com` and at least one external person has shared their wrapped publicly.

---

## 9. Risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| GitHub rate-limits at scale | Generation fails | Cache commits 24h, parallel limit 5, queue heavy users |
| Power users have 10K+ commits | Generation > 60s | Sample if commits > 5000 (top 5000 by recency) |
| Flutter Web bundle > 2MB | Slow share page load | Lazy-load player after first paint of share page |
| OAuth scope `repo` scares users | Lower conversion | Make private repo access opt-in via separate "include private" toggle |
| Trolls generate fake "viral" wrappeds | PR damage | Don't show usernames in landing page samples; use opt-in showcase |
| Launch flops on Twitter | No traction | Have backup: post to r/programming, r/webdev, Show HN, dev.to |
| Vercel free tier limits hit | Service degrades | Move to Pro ($20/mo) if MAU > 1K |

---

## 10. Future roadmap (post-MVP)

### v1.1 (week 2)
- MP4 video download for sharing on Instagram/TikTok
- "All-time" wrapped (not just last 365 days)
- Improved archetype set (add 10 more)

### v1.2 (month 2)
- Comparison mode: "Sarah vs Alex"
- Team wrapped (organization-level)
- Custom date ranges

### v2 (month 3+)
- GitLab + Bitbucket support
- Paid tier: $5/mo for unlimited regenerations, custom branding, MP4 exports
- Agency tier: $50/mo for client reports
- Slack integration: "Post wrapped to channel"

---

## 11. Instructions for Claude Code

When executing this PRD:

1. **Start with §8 Checkpoint 1.** Do not skip ahead. Finish each checkpoint completely — including the "Done when" criteria — before moving to the next.
2. **Use the exact file structure in §7.2** — do not invent a different layout.
3. **Implement TypeScript types from §4.4 first** in `lib/types.ts` so everything else types correctly.
4. **For Flutter, use Flutter 3.27+** with Material 3 and the Impeller renderer.
5. **All code must include error handling** — no silent failures, log to Sentry-compatible format.
6. **Write commits in conventional-commit style** (`feat:`, `fix:`, `chore:`).
7. **Do not skip the loading screen rotating copy in §6.3** — it's part of the brand voice.
8. **The OG image in §4.8 must be pixel-perfect 1200×630** — Twitter/LinkedIn reject other sizes.
9. **Ask before adding dependencies** beyond what's listed in §7.1 — keep the install lean.
10. **No premature polish.** Each checkpoint exists to validate that something works. Don't refactor, don't add tests yet, don't beautify. Polish happens after Checkpoint 7.
11. **Stop after each checkpoint** and let the human test it before proceeding. Do not chain multiple checkpoints in one go.
12. **At the end (after Checkpoint 7), generate a README.md** with setup instructions, deployment steps, and contributing guide.

---

## 12. Acceptance criteria (v1 done = all true)

- [ ] User can sign in with GitHub from landing page
- [ ] Generation completes for a user with ~500 commits in under 30 seconds
- [ ] Share page renders Flutter Web player correctly on mobile + desktop
- [ ] Share button opens pre-filled tweet with correct URL + text
- [ ] OG image renders correctly when URL is pasted into X / LinkedIn / Slack
- [ ] User can delete their wrapped from settings
- [ ] All 15 archetypes have been triggered at least once in testing
- [ ] Site loads in < 2s on 4G connection from India
- [ ] No console errors in production
- [ ] Deployed to custom domain with SSL
- [ ] Sample wrapped on landing page is real (uses a demo account)
- [ ] Privacy policy + terms of service pages exist
