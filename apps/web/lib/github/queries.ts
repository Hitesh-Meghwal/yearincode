// GraphQL queries used by the yearincode aggregator.
// Each query is small and pageable; the client at lib/github/client.ts handles
// retries and rate limiting.

export const VIEWER_QUERY = /* GraphQL */ `
  query Viewer {
    viewer {
      login
      avatarUrl
      databaseId
      id
      createdAt
    }
  }
`;

export type ViewerResponse = {
  viewer: {
    login: string;
    avatarUrl: string;
    databaseId: number;
    id: string;
    createdAt: string;
  };
};

// Resolve a public profile by username. Used by username mode (no auth): we
// look up the target user with an app-level token, then query their PUBLIC
// contributions. Returns null-ish if the login doesn't exist.
export const USER_QUERY = /* GraphQL */ `
  query UserByLogin($login: String!) {
    user(login: $login) {
      login
      avatarUrl
      databaseId
      id
      createdAt
    }
  }
`;

export type UserResponse = {
  user: {
    login: string;
    avatarUrl: string;
    databaseId: number;
    id: string;
    createdAt: string;
  } | null;
};

// Contribution summary for a SPECIFIC user (by login), as opposed to the
// token's own viewer. Same shape as CONTRIBUTIONS_QUERY. With an app-level
// token this only ever returns the user's PUBLIC repositories + public
// contribution data.
export const CONTRIBUTIONS_BY_USER_QUERY = /* GraphQL */ `
  query ContributionsByUser($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        commitContributionsByRepository(maxRepositories: 100) {
          contributions(first: 1) {
            totalCount
          }
          repository {
            nameWithOwner
            isPrivate
            primaryLanguage {
              name
            }
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export type ContributionsByUserResponse = {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      commitContributionsByRepository: Array<{
        contributions: { totalCount: number };
        repository: {
          nameWithOwner: string;
          isPrivate: boolean;
          primaryLanguage: { name: string } | null;
          languages: {
            edges: Array<{
              size: number;
              node: { name: string };
            }>;
          };
        };
      }>;
    };
  } | null;
};

// Fetch the user's contribution summary across the given window. The
// `commitContributionsByRepository` connection returns the top 100 repos by
// commit contributions in the window — enough for v1.
export const CONTRIBUTIONS_QUERY = /* GraphQL */ `
  query Contributions($from: DateTime!, $to: DateTime!) {
    viewer {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        commitContributionsByRepository(maxRepositories: 100) {
          contributions(first: 1) {
            totalCount
          }
          repository {
            nameWithOwner
            isPrivate
            primaryLanguage {
              name
            }
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export type ContributionsResponse = {
  viewer: {
    contributionsCollection: {
      totalCommitContributions: number;
      commitContributionsByRepository: Array<{
        contributions: { totalCount: number };
        repository: {
          nameWithOwner: string;
          isPrivate: boolean;
          primaryLanguage: { name: string } | null;
          languages: {
            edges: Array<{
              size: number;
              node: { name: string };
            }>;
          };
        };
      }>;
    };
  };
};

// Paginated commit history for a single repository, optionally filtered by
// author. Returns commit metadata + additions/deletions in one shot.
export const REPO_COMMITS_QUERY = /* GraphQL */ `
  query RepoCommits(
    $owner: String!
    $name: String!
    $since: GitTimestamp!
    $authorId: ID
    $cursor: String
  ) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(
              first: 100
              since: $since
              author: { id: $authorId }
              after: $cursor
            ) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                oid
                messageHeadline
                committedDate
                additions
                deletions
                author {
                  user {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export type RepoCommitsResponse = {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: Array<{
            oid: string;
            messageHeadline: string;
            committedDate: string;
            additions: number;
            deletions: number;
            author: {
              user: { login: string } | null;
            } | null;
          }>;
        };
      } | null;
    } | null;
  } | null;
};
