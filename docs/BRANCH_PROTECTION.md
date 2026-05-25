# Branch protection setup

GitHub branch protection rules can't be checked into the repo — they live in the UI and have to be applied by hand. This document is the checklist.

Apply this **once**, on `main`, before announcing the project publicly.

---

## Where to click

`https://github.com/Hitesh-Meghwal/yearincode/settings/branches` → **Add branch protection rule** (or **Add classic branch protection rule** if GitHub has moved you to rulesets — same idea, different UI).

**Branch name pattern**: `main`

Then tick the boxes below.

---

## The rules

- [ ] **Require a pull request before merging**
- [ ] **Require approvals**: `1`
- [ ] **Dismiss stale pull request approvals when new commits are pushed**
- [ ] **Require status checks to pass before merging**
  - [ ] Require branches to be up to date before merging
  - [ ] Select status checks: **Vercel** (the preview deploy). Add more as CI is added.
- [ ] **Require linear history** (blocks merge commits — every merge is a squash or rebase)
- [ ] **Do not allow bypassing the above settings**
- [ ] **Restrict who can push to matching branches** — leave empty (nobody pushes directly, including the maintainer)
- [ ] **Allow force pushes**: OFF
- [ ] **Allow deletions**: OFF
- [ ] **Include administrators** ← *the important one. Without this, none of the above protects against the maintainer's own mistakes.*

Save the rule. You're done.

---

## Why each one matters (plain English)

| Rule | What it actually prevents |
|---|---|
| Require a PR before merging | No more "I'll just push this hotfix straight to main." Every change gets a diff page, a description, and a record. |
| Require 1 approval | On a solo project this means *you approve your own PR*. Sounds silly. It isn't. The 30 seconds between "open PR" and "click approve" is when you re-read the diff and notice the typo, the leftover `console.log`, the migration you forgot to add. It's a deliberate speed bump. |
| Dismiss stale approvals on new commits | Stops the "approved last week, then I pushed three more commits, now it's a different PR" footgun. |
| Require status checks | If the Vercel preview build is red, the PR can't merge. Catches build breaks before they hit production. |
| Require branches up to date | Forces you to rebase onto the latest `main` before merging. Prevents "passed CI on stale base, broken on actual main" merges. |
| Require linear history | No merge commits. The `main` log reads top-to-bottom as a clean sequence of squashes. Easier to `git bisect`, easier to read, easier to revert. |
| Block force pushes | History on `main` is append-only. Nobody (including you) can rewrite it. |
| Block deletions | Nobody can delete `main` by accident or otherwise. |
| Include administrators | **The whole reason this works.** Without it, GitHub treats branch protection as advisory for repo admins — meaning the maintainer can bypass every rule above with a normal `git push`. Turning this on means the rules apply to you too. That's the point. |

---

## How forks work with this setup

External contributors never get push access to this repo. The flow is:

1. Contributor forks `Hitesh-Meghwal/yearincode` to their own account.
2. They commit on a branch in their fork.
3. They open a PR from `their-fork:branch` → `Hitesh-Meghwal/yearincode:main`.
4. The Vercel preview deploy spins up for the PR. Status checks run.
5. Hitesh reviews, requests changes if needed, and merges if the checks pass and the diff is good.

Forks never get write access. They can't bypass `CODEOWNERS`, they can't push to `main`, they can't disable checks. The only path from a fork into production is through a reviewed-and-merged PR. That's the whole security model.
