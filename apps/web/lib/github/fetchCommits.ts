import { GitHubClient } from "./client";
import {
  CONTRIBUTIONS_QUERY,
  ContributionsResponse,
  REPO_COMMITS_QUERY,
  RepoCommitsResponse,
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
): Promise<FetchResult> {
  const client = new GitHubClient(token);

  // 1. Viewer identity.
  const viewer = (await client.graphql<ViewerResponse>(VIEWER_QUERY)).viewer;
  // GraphQL `author: { id: ID }` expects a global node ID, but commit-history's
  // `author` filter also accepts the user's database ID encoded as a string.
  // We use the GraphQL node ID via a separate query for safety.
  // Workaround: GraphQL's CommitAuthor filter accepts `id` as a User node ID.
  // We resolve it via a small follow-up query.
  const authorIdResp = await client.graphql<{ user: { id: string } | null }>(
    /* GraphQL */ `
      query GetUserId($login: String!) {
        user(login: $login) {
          id
        }
      }
    `,
    { login: viewer.login },
  );
  const authorId = authorIdResp.user?.id ?? null;

  // 2. Contributions metadata — gives us repo list, language sizes,
  //    private/public flag, and a commit count per repo.
  const contribs = await client.graphql<ContributionsResponse>(
    CONTRIBUTIONS_QUERY,
    { from: from.toISOString(), to: to.toISOString() },
  );

  const repoSummaries: RepoSummary[] = contribs.viewer.contributionsCollection.commitContributionsByRepository
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
          author: node.author?.user?.login ?? viewer.login,
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
        const login = node.author?.user?.login;
        if (!login || login === viewer.login) continue;
        coContributorCommitsByLogin[login] =
          (coContributorCommitsByLogin[login] ?? 0) + 1;
      }
    }
  }

  const repoLanguages: RepoLanguageBreakdown[] = repoSummaries.map((r) => ({
    repo: r.nameWithOwner,
    primaryLanguage: r.primaryLanguage,
    languageBytes: r.languageBytes,
  }));

  return {
    username: viewer.login,
    avatarUrl: viewer.avatarUrl,
    userCommits,
    coContributorCommitsByLogin,
    repoLanguages,
  };
}
