import type { CollaboratorStat } from "../types";

export function computeTopCollaborators(
  coContributorCommitsByLogin: Record<string, number>,
  limit = 3,
): CollaboratorStat[] {
  return Object.entries(coContributorCommitsByLogin)
    .map(([username, sharedCommits]) => ({ username, sharedCommits }))
    .sort((a, b) => b.sharedCommits - a.sharedCommits)
    .slice(0, limit);
}
