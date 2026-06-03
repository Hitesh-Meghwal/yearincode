// "Ghosts & Mutuals" follow-back diff — server-side data layer.
//
// Unlike the wrap pipeline (which reads commit history with an authenticated
// token), this only needs PUBLIC follower/following lists. We still route it
// through the server using GITHUB_APP_TOKEN so we get the 5,000 req/hr budget
// instead of the 60/hr anonymous ceiling — one lookup is a profile call plus
// two paginated list reads, which would burn the anonymous budget fast.
//
// The data contract (GithubUser / FollowDiff) and the typed error codes match
// the integration spec exactly so the client UI can map codes to copy.

const REST_ROOT = "https://api.github.com";
const USER_AGENT = "yearincode/0.1 (+https://yearincode.com)";

export interface GithubUser {
  login: string; // username
  avatar_url: string; // avatar image URL
  html_url: string; // link to the GitHub profile
}

export interface FollowDiff {
  username: string; // canonical username the diff was computed for
  ghosts: GithubUser[]; // following − followers  (you follow, they don't)
  fans: GithubUser[]; // followers − following  (they follow, you don't)
  mutuals: GithubUser[]; // following ∩ followers
  followerCount: number; // from the profile object
  followingCount: number; // from the profile object
  truncated: boolean; // true if maxPages capped a mega-account's lists
}

export type GhostsErrorCode =
  | "not-found" // username doesn't exist (HTTP 404)
  | "rate-limit" // hourly budget spent (403/429 + x-ratelimit-remaining: 0)
  | "network" // fetch threw (offline, DNS, etc.)
  | "config" // server has no GITHUB_APP_TOKEN configured
  | "unknown"; // any other non-OK response

export class GhostsError extends Error {
  code: GhostsErrorCode;

  constructor(message: string, code: GhostsErrorCode) {
    super(message);
    this.name = "GhostsError";
    this.code = code;
  }
}

// GitHub usernames: 1–39 chars, alphanumeric or single internal hyphens, no
// leading/trailing hyphen. Mirrors the generate route's validation.
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

// GitHub paginates list endpoints via the RFC-5988 `Link` header.
function nextLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(",")) {
    const m = part.match(/<([^>]+)>;\s*rel="next"/);
    if (m) return m[1];
  }
  return null;
}

function authHeaders(token: string): HeadersInit {
  return {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": USER_AGENT,
  };
}

async function getJson(
  url: string,
  token: string,
): Promise<{ body: unknown; res: Response }> {
  let res: Response;
  try {
    res = await fetch(url, { headers: authHeaders(token) });
  } catch {
    throw new GhostsError(
      "Couldn't reach GitHub. Check the connection.",
      "network",
    );
  }
  if (res.status === 404) {
    throw new GhostsError(
      "That username doesn't exist on GitHub.",
      "not-found",
    );
  }
  if (
    (res.status === 403 || res.status === 429) &&
    res.headers.get("x-ratelimit-remaining") === "0"
  ) {
    throw new GhostsError(
      "GitHub's rate limit is used up. Try again later.",
      "rate-limit",
    );
  }
  if (!res.ok) {
    throw new GhostsError(`GitHub returned an error (${res.status}).`, "unknown");
  }
  return { body: await res.json(), res };
}

// Walk every page of /users/:login/followers or /following.
// `maxPages` caps mega-accounts so one lookup can't burn the whole budget.
// Returns the users plus whether we hit the cap (more pages remained).
async function fetchAllUsers(
  username: string,
  kind: "followers" | "following",
  token: string,
  maxPages: number,
): Promise<{ users: GithubUser[]; truncated: boolean }> {
  const users: GithubUser[] = [];
  let url: string | null = `${REST_ROOT}/users/${encodeURIComponent(
    username,
  )}/${kind}?per_page=100`;
  let page = 0;
  while (url && page < maxPages) {
    const { body, res } = await getJson(url, token);
    if (Array.isArray(body)) {
      for (const u of body as GithubUser[]) {
        users.push({
          login: u.login,
          avatar_url: u.avatar_url,
          html_url: u.html_url,
        });
      }
    }
    url = nextLink(res.headers.get("link"));
    page++;
  }
  // If we stopped because we hit the page cap (not because the list ended),
  // the results are truncated.
  return { users, truncated: url !== null };
}

/**
 * Compute the follow-back diff for a public GitHub account.
 *
 * @param rawUsername  raw input (a leading `@` and surrounding space are stripped)
 * @param token        GITHUB_APP_TOKEN — read-public-only, supplied by the route
 * @param maxPages     per-list page cap; at per_page=100 the default reads up to
 *                     ~2000 followers and ~2000 following.
 */
export async function getFollowDiff(
  rawUsername: string,
  token: string,
  maxPages = 20,
): Promise<FollowDiff> {
  if (!token) {
    throw new GhostsError(
      "The follow-back checker isn't configured on the server.",
      "config",
    );
  }

  const username = rawUsername.trim().replace(/^@/, "");
  if (!username) {
    throw new GhostsError("Enter a GitHub username first.", "unknown");
  }
  if (!GITHUB_USERNAME_RE.test(username)) {
    throw new GhostsError(
      "That doesn't look like a GitHub username.",
      "not-found",
    );
  }

  // Profile first: canonical casing + total counts, fails fast on 404.
  const { body } = await getJson(
    `${REST_ROOT}/users/${encodeURIComponent(username)}`,
    token,
  );
  const profile = body as {
    login: string;
    followers: number;
    following: number;
  };

  const [followersResult, followingResult] = await Promise.all([
    fetchAllUsers(profile.login, "followers", token, maxPages),
    fetchAllUsers(profile.login, "following", token, maxPages),
  ]);
  const followers = followersResult.users;
  const following = followingResult.users;

  // Case-insensitive matching: GitHub logins aren't case-sensitive but casing
  // in responses can vary.
  const followerSet = new Set(followers.map((u) => u.login.toLowerCase()));
  const followingSet = new Set(following.map((u) => u.login.toLowerCase()));

  return {
    username: profile.login,
    ghosts: following.filter((u) => !followerSet.has(u.login.toLowerCase())),
    fans: followers.filter((u) => !followingSet.has(u.login.toLowerCase())),
    mutuals: following.filter((u) => followerSet.has(u.login.toLowerCase())),
    followerCount: profile.followers,
    followingCount: profile.following,
    truncated: followersResult.truncated || followingResult.truncated,
  };
}
