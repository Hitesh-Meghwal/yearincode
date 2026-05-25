# Contributing

Thanks for taking the time. This file is short on purpose — read it once and you're set.

## Before you start

- For anything bigger than a typo, **open an issue first**. Saves both of us from a closed PR.
- Read the [README](README.md) end-to-end. It covers what this product is, what data it touches, and how the pieces fit together.
- If you're adding a feature: the bar is "does this make the wrapped more share-worthy?" Not "is this technically possible?"

## Running locally

Setup is in the [README — Local setup](README.md#local-setup) section. Don't duplicate it here, just follow it. If something in those steps is wrong or stale, that's a doc bug — open an issue or a PR against the README.

## Commit style

Conventional Commits. Scoped where it helps:

```
feat: add discipline-score progress bar
feat(player): globe-trotter world-map backdrop
feat(seo): json-ld on share pages
fix: cache-bust wasm on iframe url
chore: bump next to 16.0.3
docs: clarify migration 0004 step
```

Prefixes in use: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `style`. If you reach for a different one, you're probably doing too much in one commit.

## Branching

- `main` is protected. Direct pushes are blocked even for the maintainer.
- Open a PR from a branch. Name it whatever — `feat/discipline-score`, `fix/wasm-cache`, `your-handle/whatever`. Names don't matter, commit history does.
- One PR per logical change. If you find yourself writing "and also..." in the summary, it's two PRs.

## Code style

- **TypeScript**: strict mode is on. No `any` unless you've genuinely got no choice and can defend it. Prefer narrow types over wide ones.
- **Dart (player)**: the default Flutter lints (`flutter_lints`). No custom analyzer rules — keep it boring.
- **Prefer editing existing files** over creating new ones. The repo has a layout; learn it before you grow it.
- **No emojis in code** unless they're part of user-facing copy (archetype glyphs, etc.). Source files stay clean.
- **No comments that restate the code.** Comment the *why*, not the *what*.

## What NOT to PR

A non-exhaustive list of things that will get a PR closed without merging:

- **New dependencies without a prior issue.** Every dep is a future maintenance bill. Justify it first.
- **Drive-by refactors mixed into feature PRs.** If you spot something to clean up, separate PR.
- **Editing a shipped SQL migration in `supabase/migrations/`.** Migrations are immutable once they're in `main` — production has already run them. Add a *new* migration file with a higher number.
- **Style-only churn** — re-ordering imports, swapping single quotes for double, renaming variables for taste. Not interesting.
- **AI-generated walls of code with no clear author intent.** Use the tools, sure, but you own the diff. If you can't explain why a line is there, delete it.
- **Anything that breaks `pnpm dev` or `scripts/build-player.ps1` on a clean clone.** Test the clean-clone path before opening the PR.

## Reviews

Solo maintainer, best-effort turnaround. If a PR sits idle for more than a week, ping it — it's not personal, it's a Tuesday.

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE), same as the rest of the project.
