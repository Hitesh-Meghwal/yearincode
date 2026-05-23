# yearincode launch kit

Ready-to-paste copy for sharing yearincode across WhatsApp, X, LinkedIn, Discord, and bio fields. **Pick one per channel, send, iterate.**

- **Live**: <https://yearincode.com>
- **Strategy**: start in WhatsApp with 5–10 close friends. Read what they say. Then ramp public.

---

## WhatsApp

Five variants — match the one to who you're messaging.

### Variant A — close friends / group chat (default)

```
yo, just shipped a lil thing 🧑‍💻

yearincode = spotify wrapped but for your github commits
sign in, pick any year, get a 50-sec animated recap + your dev archetype (i got "the polyglot" 🌍)

curious what it'll call you →
https://yearincode.com
```

### Variant B — one specific dev friend, more personal

```
hey, made something this weekend you might actually like

it's like spotify wrapped but for your github history. you sign in, pick any year, and it gives you a 50-sec animated recap of how you coded that year + assigns you one of 15 dev archetypes.

genuinely curious what archetype you get → https://yearincode.com

would love feedback if you try it
```

### Variant C — using YOUR result as the hook (works in groups)

```
ok so i built this thing — yearincode

ran it on my 2026: 336 commits, dart + typescript + python + js roughly balanced, peak coding hour 4pm. it called me "The Polyglot 🌍"

want to see yours? https://yearincode.com

drop your archetype in the chat 👀
```

### Variant D — pure one-liner (status / story drop)

```
made spotify wrapped for github 🧵 what's your dev archetype? https://yearincode.com
```

### Variant E — broadcast / story / bio

```
🟢 just launched: yearincode
spotify wrapped for your github → https://yearincode.com
what archetype are you?
```

---

## Twitter / X

```
I built Spotify Wrapped for your GitHub history.

Sign in, pick any year, get an animated recap of how you coded that year — commits, languages, peak hours, and one of 15 personality archetypes.

I got "The Polyglot 🌍". What are you?

→ https://yearincode.com
```

**Attach**: 30-second screen recording of the player playing through, ending on the archetype reveal.

### Optional thread (4 tweets)

**Tweet 1/4** — same as above.

**Tweet 2/4 — how it works**
```
2/ Stack:
- Next.js 16 + Supabase for auth & storage
- Flutter Web (wasm) for the animated player, embedded in an iframe with postMessage handoff
- next/og for the 1200×630 social card
- ~50s of animated slides per wrapped, no music (licensing)
```

**Tweet 3/4 — the killer feature**
```
3/ The "vibe check": 15 archetypes from common to legendary.

Night Owl Refactorer 🦉 · Weekend Warrior ⚔️ · Metronome ⏱️ · Refactorer 🔥 · Polyglot 🌍 · Monolith 🗿 · Dawn Patrol 🌅 · Lunch Hour Hero 🥪 · Marathoner 🏃 · Sprinter 💨 · Consistent One 📈 · Social Coder 🤝 · Lone Wolf 🐺 · Globe Trotter ✈️ (legendary) · The Builder 🔨

Rules engine, first match wins.
```

**Tweet 4/4 — CTA + ask for feedback**
```
4/ Try yours — pick any year you've been on GitHub:

https://yearincode.com

What archetype did it call you? Drop a screenshot, I want to see the spread.
```

---

## LinkedIn

```
I built yearincode — Spotify Wrapped for your GitHub history.

Sign in with GitHub. Pick any year you've been coding. Get a 50-second animated recap: total commits, top languages, peak coding hours, longest streak, top repos, plus the "developer archetype" your patterns earned you (15 of them: Night Owl Refactorer, Weekend Warrior, Polyglot, Globe Trotter, and more).

Why I built it:
1. The data is already there in everyone's commit history; nobody was visualizing it.
2. Developer accomplishments are weirdly hard to share. "84,231 lines this year" is awkward on LinkedIn; a 30-second card is not.
3. I wanted to learn Flutter Web on a real project.

Stack: Next.js 16 + Supabase + Flutter (compiled to wasm). Open to feedback.

Try yours: https://yearincode.com

#IndieDev #BuildInPublic #SideProject
```

---

## Discord (indie-hackers / build-in-public / dev servers)

```
Hey, just shipped a side project — yearincode 🧑‍💻

It's "Spotify Wrapped for your GitHub history": sign in, pick any year, get a 50-second animated recap with your stats + one of 15 dev archetypes (Night Owl Refactorer, Polyglot, Weekend Warrior, etc.).

Live: https://yearincode.com

Stack: Next.js 16 + Supabase + Flutter Web (wasm) for the animated player. Would love honest feedback — especially on the archetype detection. What did it call you?
```

---

## Reddit (r/programming, r/webdev, r/SideProject, r/IndieHackers)

**Title**: `I built Spotify Wrapped for your GitHub history`

**Body**:
```
Hey r/[subreddit],

Just shipped yearincode. Sign in with GitHub, pick any year you've been coding, get an animated 50-second recap: commits, languages, peak hours, longest streak, top repos, plus one of 15 personality archetypes (Night Owl Refactorer, Polyglot, Globe Trotter — there's a legendary one if your commits look like multiple timezones).

Live: https://yearincode.com

Stack: Next.js 16 + Supabase + Flutter Web (compiled to wasm) for the animated player. No music (licensing). Free.

Open to feedback. What archetype did it call you?
```

---

## Universal one-liner — bios, email signatures, footers

```
yearincode → spotify wrapped for your github · https://yearincode.com
```

---

## Sharing strategy (do this in order)

| Day | What |
|---|---|
| **Today** | WhatsApp Variant A to 5–10 close dev friends. Don't post anywhere public yet. |
| **Day 1–2** | Read what friends say. Note which archetype each got. Fix anything they flag. |
| **Day 3** | Group chats / Discord (Variant C). Tweet with screen recording. |
| **Day 4–5** | LinkedIn post. Dev blog post. |
| **Week 2+** | Watch wrappeds tick up in the DB. Once you cross ~20, the landing strip flips to "X devs have wrapped their year" — that's when you go wider. |
| **Late November** | **Then** Product Hunt. Wait for the seasonal hook. |

---

## Pre-flight checklist before any of this

- [ ] Migration `0004_user_github_tokens.sql` applied in Supabase (else sign-in works but generation fails).
- [ ] Migration `0005_public_wrapped_stats_add_devs.sql` applied (else landing strip stays stuck on "just launched").
- [ ] Vercel env vars set for production (esp. `NEXT_PUBLIC_SITE_URL`).
- [ ] Tested sign-in + generate + share flow on prod from your phone in **incognito**.
- [ ] Captured a 30-second screen recording of the player for X / LinkedIn / blog.
- [ ] Got OG card PNG: visit `https://yearincode.com/u/Hitesh-Meghwal/2026/opengraph-image` → save image.

---

## Pacing rules

- **Don't blast everything in one day.** WhatsApp first, then a sleep, then Twitter, then LinkedIn. Each channel deserves its own moment.
- **Don't say "please upvote"** on PH or Reddit. Say "I'd love your honest feedback."
- **Reply to every comment within an hour** for the first 6 hours of any public post. Engagement begets engagement.
- **Save the Product Hunt launch.** It's a one-shot. November–December is "Spotify Wrapped season" — that's when this product is timely.
