import { GitHubApiError, GitHubClient } from "./client";
import {
  CONTRIBUTIONS_BY_USER_QUERY,
  ContributionsByUserResponse,
  CONTRIBUTIONS_QUERY,
  ContributionsResponse,
  REPO_COMMITS_QUERY,
  RepoCommitsResponse,
  USER_QUERY,
  UserResponse,
  VIEWER_QUERY,
  ViewerResponse,
} from "./queries";
import type {
  FetchResult,
  RawCommit,
  RepoLanguageBreakdown,
} from "../types";

type CommitHistoryNode = {
  oid: string;
  messageHeadline: string;
  committedDate: string;
  additions: number;
  deletions: number;
  author: { user: { login: string } | null } | null;
};

const MAX_PARALLEL_REPOS = 5;
const MAX_PAGES_PER_REPO = 30; // 30 * 100 = 3000 commits per repo cap
const COLLABORATOR_REPO_LIMIT = 5; // fetch co-contributor commits for the top N repos

// GitHub launched April 2008; nothing older is meaningful, so clamp the
// all-time loop's start year to this floor regardless of a stale createdAt.
const GITHUB_FOUNDED_YEAR = 2008;

type RepoSummary = {
  nameWithOwner: string;
  isPrivate: boolean;
  userCommitCount: number;
  primaryLanguage: string | null;
  languageBytes: Record<string, number>;
};

function chunked<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function splitOwnerName(nameWithOwner: string): { owner: string; name: string } {
  const idx = nameWithOwner.indexOf("/");
  return {
    owner: nameWithOwner.slice(0, idx),
    name: nameWithOwner.slice(idx + 1),
  };
}

async function pageRepoCommits(
  client: GitHubClient,
  owner: string,
  name: string,
  since: string,
  authorId: string | null,
): Promise<CommitHistoryNode[]> {
  const all: CommitHistoryNode[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < MAX_PAGES_PER_REPO; page += 1) {
    const data: RepoCommitsResponse = await client.graphql<RepoCommitsResponse>(
      REPO_COMMITS_QUERY,
      { owner, name, since, authorId, cursor },
    );
    const history = data.repository?.defaultBranchRef?.target?.history;
    if (!history) break;
    all.push(...history.nodes);
    if (!history.pageInfo.hasNextPage) break;
    cursor = history.pageInfo.endCursor;
    if (!cursor) break;
  }
  return all;
}

export async function fetchWrappedData(
  token: string,
  from: Date,
  to: Date,
  // When provided, we fetch this user's PUBLIC data instead of the token
  // owner's. Used by username mode (the token is an app-level token, the
  // target is whoever typed their handle). When omitted, we fetch the token
  // owner's own data (authenticated / PAT mode), which can include private
  // contributions the token is scoped for.
  targetUsername?: string,
): Promise<FetchResult> {
  const client = new GitHubClient(token);

  // 1. Resolve identity (login, avatar, node id for the commit-author filter).
  let login: string;
  let avatarUrl: string;
  let authorId: string | null;

  if (targetUsername) {
    const resp = await client.graphql<UserResponse>(USER_QUERY, {
      login: targetUsername,
    });
    if (!resp.user) {
      throw new GitHubApiError(
        `GitHub user "${targetUsername}" not found`,
        404,
      );
    }
    login = resp.user.login;
    avatarUrl = resp.user.avatarUrl;
    authorId = resp.user.id;
  } else {
    const viewer = (await client.graphql<ViewerResponse>(VIEWER_QUERY)).viewer;
    login = viewer.login;
    avatarUrl = viewer.avatarUrl;
    authorId = viewer.id;
  }

  // 2. Contributions metadata — repo list, language sizes, private/public
  //    flag, and a commit count per repo. Source query depends on whether we
  //    target a specific user (by login) or the token owner (viewer).
  let contributionsByRepo: ContributionsResponse["viewer"]["contributionsCollection"]["commitContributionsByRepository"];
  if (targetUsername) {
    const contribs = await client.graphql<ContributionsByUserResponse>(
      CONTRIBUTIONS_BY_USER_QUERY,
      { login, from: from.toISOString(), to: to.toISOString() },
    );
    contributionsByRepo =
      contribs.user?.contributionsCollection.commitContributionsByRepository ??
      [];
  } else {
    const contribs = await client.graphql<ContributionsResponse>(
      CONTRIBUTIONS_QUERY,
      { from: from.toISOString(), to: to.toISOString() },
    );
    contributionsByRepo =
      contribs.viewer.contributionsCollection.commitContributionsByRepository;
  }

  const repoSummaries: RepoSummary[] = contributionsByRepo
    .map((entry) => ({
      nameWithOwner: entry.repository.nameWithOwner,
      isPrivate: entry.repository.isPrivate,
      userCommitCount: entry.contributions.totalCount,
      primaryLanguage: entry.repository.primaryLanguage?.name ?? null,
      languageBytes: Object.fromEntries(
        entry.repository.languages.edges.map((edge) => [edge.node.name, edge.size]),
      ),
    }))
    // Some repos can return 0 — skip them to save API calls.
    .filter((r) => r.userCommitCount > 0);

  // 3. For each repo, fetch user-authored commits (with additions/deletions).
  //    Parallelism is bounded at MAX_PARALLEL_REPOS.
  const sinceIso = from.toISOString();
  const userCommits: RawCommit[] = [];

  for (const batch of chunked(repoSummaries, MAX_PARALLEL_REPOS)) {
    const results = await Promise.all(
      batch.map(async (repo) => {
        const { owner, name } = splitOwnerName(repo.nameWithOwner);
        try {
          const nodes = await pageRepoCommits(client, owner, name, sinceIso, authorId);
          return { repo, nodes };
        } catch (err) {
          // Don't crash the whole run if one repo fails (e.g. archived/empty default branch).
          console.warn(
            `[github] failed to fetch commits for ${repo.nameWithOwner}:`,
            err instanceof Error ? err.message : err,
          );
          return { repo, nodes: [] };
        }
      }),
    );
    for (const { repo, nodes } of results) {
      for (const node of nodes) {
        userCommits.push({
          sha: node.oid,
          repo: repo.nameWithOwner,
          repoIsPrivate: repo.isPrivate,
          author: node.author?.user?.login ?? login,
          messageHeadline: node.messageHeadline,
          committedDate: node.committedDate,
          additions: node.additions,
          deletions: node.deletions,
        });
      }
    }
  }

  // 4. Collaborators — fetch ALL-author commits for the user's top repos,
  //    then count co-committers (excluding the user).
  const topReposForCollabs = [...repoSummaries]
    .sort((a, b) => b.userCommitCount - a.userCommitCount)
    .slice(0, COLLABORATOR_REPO_LIMIT);

  const coContributorCommitsByLogin: Record<string, number> = {};
  for (const batch of chunked(topReposForCollabs, MAX_PARALLEL_REPOS)) {
    const results = await Promise.all(
      batch.map(async (repo) => {
        const { owner, name } = splitOwnerName(repo.nameWithOwner);
        try {
          return await pageRepoCommits(client, owner, name, sinceIso, null);
        } catch (err) {
          console.warn(
            `[github] failed to fetch co-contributor commits for ${repo.nameWithOwner}:`,
            err instanceof Error ? err.message : err,
          );
          return [];
        }
      }),
    );
    for (const nodes of results) {
      for (const node of nodes) {
        const coLogin = node.author?.user?.login;
        if (!coLogin || coLogin === login) continue;
        coContributorCommitsByLogin[coLogin] =
          (coContributorCommitsByLogin[coLogin] ?? 0) + 1;
      }
    }
  }

  const repoLanguages: RepoLanguageBreakdown[] = repoSummaries.map((r) => ({
    repo: r.nameWithOwner,
    primaryLanguage: r.primaryLanguage,
    languageBytes: r.languageBytes,
  }));

  return {
    username: login,
    avatarUrl,
    userCommits,
    coContributorCommitsByLogin,
    repoLanguages,
  };
}

// Resolve the account's GitHub join year. Mirrors the identity branch in
// fetchWrappedData (viewer vs. by-login). Clamped to GITHUB_FOUNDED_YEAR so a
// bogus createdAt can't make the all-time loop run absurdly long.
async function resolveAccountCreatedYear(
  client: GitHubClient,
  targetUsername?: string,
): Promise<number> {
  let createdAt: string;
  if (targetUsername) {
    const resp = await client.graphql<UserResponse>(USER_QUERY, {
      login: targetUsername,
    });
    if (!resp.user) {
      throw new GitHubApiError(
        `GitHub user "${targetUsername}" not found`,
        404,
      );
    }
    createdAt = resp.user.createdAt;
  } else {
    createdAt = (await client.graphql<ViewerResponse>(VIEWER_QUERY)).viewer
      .createdAt;
  }
  return Math.max(new Date(createdAt).getUTCFullYear(), GITHUB_FOUNDED_YEAR);
}

// All-time ("Since Day One") fetch. GitHub's contributionsCollection caps each
// query at a 1-year span, so we can't ask for a whole career in one shot — we
// loop calendar year by year from the join year to now and merge the results
// into a single lifetime FetchResult.
export async function fetchWrappedDataAllTime(
  token: string,
  targetUsername?: string,
): Promise<{ result: FetchResult; accountCreatedYear: number }> {
  const client = new GitHubClient(token);
  const accountCreatedYear = await resolveAccountCreatedYear(
    client,
    targetUsername,
  );

  const now = new Date();
  const currentYear = now.getUTCFullYear();

  // Accumulators for the merged lifetime result.
  let username = targetUsername ?? "";
  let avatarUrl = "";
  const userCommits: RawCommit[] = [];
  const coContributorCommitsByLogin: Record<string, number> = {};
  // Keyed by repo "owner/name" so the same repo across years merges into one
  // breakdown (sum bytes per language, keep its primaryLanguage).
  const repoLanguageByRepo: Record<string, RepoLanguageBreakdown> = {};

  for (let year = accountCreatedYear; year <= currentYear; year += 1) {
    const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const to =
      year >= currentYear
        ? now
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    try {
      const yearResult = await fetchWrappedData(token, from, to, targetUsername);
      // Identity is identical every year; keep the first non-empty values.
      if (!username) username = yearResult.username;
      if (!avatarUrl) avatarUrl = yearResult.avatarUrl;

      userCommits.push(...yearResult.userCommits);

      for (const [login, count] of Object.entries(
        yearResult.coContributorCommitsByLogin,
      )) {
        coContributorCommitsByLogin[login] =
          (coContributorCommitsByLogin[login] ?? 0) + count;
      }

      for (const rl of yearResult.repoLanguages) {
        const existing = repoLanguageByRepo[rl.repo];
        if (!existing) {
          repoLanguageByRepo[rl.repo] = {
            repo: rl.repo,
            primaryLanguage: rl.primaryLanguage,
            languageBytes: { ...rl.languageBytes },
          };
          continue;
        }
        existing.primaryLanguage = existing.primaryLanguage ?? rl.primaryLanguage;
        for (const [lang, bytes] of Object.entries(rl.languageBytes)) {
          existing.languageBytes[lang] =
            (existing.languageBytes[lang] ?? 0) + bytes;
        }
      }
    } catch (err) {
      // Don't let one bad year kill the whole career — log and keep going.
      console.warn(
        `[github] all-time fetch failed for ${year}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return {
    result: {
      username,
      avatarUrl,
      userCommits,
      coContributorCommitsByLogin,
      repoLanguages: Object.values(repoLanguageByRepo),
    },
    accountCreatedYear,
  };
}
