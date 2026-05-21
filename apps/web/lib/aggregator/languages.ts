import type { LanguageStat, RawCommit, RepoLanguageBreakdown } from "../types";

// Approximate "commits in a language" by attributing all of a repo's commits
// to that repo's primary language. (We don't have per-file language data
// without per-commit diffs, which are too expensive at MVP scale.)
export function computeTopLanguages(
  commits: RawCommit[],
  repoLanguages: RepoLanguageBreakdown[],
  limit = 5,
): LanguageStat[] {
  const byRepo: Record<string, string | null> = {};
  for (const repo of repoLanguages) {
    byRepo[repo.repo] = repo.primaryLanguage;
  }

  const counts: Record<string, number> = {};
  let attributed = 0;
  for (const commit of commits) {
    const lang = byRepo[commit.repo];
    if (!lang) continue;
    counts[lang] = (counts[lang] ?? 0) + 1;
    attributed += 1;
  }

  if (attributed === 0) return [];

  return Object.entries(counts)
    .map(([name, c]) => ({
      name,
      commits: c,
      percentage: Math.round((c / attributed) * 1000) / 10,
    }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, limit);
}
