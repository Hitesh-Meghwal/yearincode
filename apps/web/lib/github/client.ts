const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const REST_ROOT = "https://api.github.com";
const USER_AGENT = "yearincode/0.1 (+https://yearincode.com)";

export class GitHubApiError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

type RequestOptions = {
  retries?: number;
  baseDelayMs?: number;
};

const DEFAULT_RETRIES = 4;
const DEFAULT_BASE_DELAY_MS = 1_000;

function isRateLimited(response: Response): boolean {
  if (response.status === 429) return true;
  if (response.status !== 403) return false;
  const remaining = response.headers.get("x-ratelimit-remaining");
  return remaining === "0";
}

function getRetryAfterSeconds(response: Response): number | undefined {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) {
    const parsed = Number(retryAfter);
    if (Number.isFinite(parsed)) return parsed;
  }
  const reset = response.headers.get("x-ratelimit-reset");
  if (reset) {
    const resetSec = Number(reset);
    if (Number.isFinite(resetSec)) {
      const nowSec = Math.floor(Date.now() / 1000);
      return Math.max(0, resetSec - nowSec);
    }
  }
  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithRetry(
  url: string,
  init: RequestInit,
  opts: RequestOptions,
): Promise<Response> {
  const retries = opts.retries ?? DEFAULT_RETRIES;
  const baseDelay = opts.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;

  let attempt = 0;
  // first attempt + `retries` retries
  while (true) {
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (networkErr) {
      if (attempt >= retries) throw networkErr;
      const delay = baseDelay * 2 ** attempt;
      console.warn(
        `[github] network error, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`,
        networkErr,
      );
      await sleep(delay);
      attempt += 1;
      continue;
    }

    if (response.ok) return response;

    const rateLimited = isRateLimited(response);
    const serverError = response.status >= 500 && response.status < 600;

    if ((rateLimited || serverError) && attempt < retries) {
      const retryAfter = getRetryAfterSeconds(response);
      const delay = rateLimited && retryAfter !== undefined
        ? Math.min(retryAfter * 1000, 60_000)
        : baseDelay * 2 ** attempt;
      console.warn(
        `[github] ${response.status} ${response.statusText}, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`,
      );
      await sleep(delay);
      attempt += 1;
      continue;
    }

    const retryAfter = rateLimited ? getRetryAfterSeconds(response) : undefined;
    const body = await response.text().catch(() => "");
    throw new GitHubApiError(
      `GitHub ${response.status} ${response.statusText} for ${url}: ${body.slice(0, 200)}`,
      response.status,
      retryAfter,
    );
  }
}

export class GitHubClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async graphql<T>(
    query: string,
    variables: Record<string, unknown> = {},
    opts: RequestOptions = {},
  ): Promise<T> {
    const response = await executeWithRetry(
      GRAPHQL_ENDPOINT,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.token}`,
          "content-type": "application/json",
          accept: "application/vnd.github+json",
          "user-agent": USER_AGENT,
        },
        body: JSON.stringify({ query, variables }),
      },
      opts,
    );

    const json = (await response.json()) as {
      data?: T;
      errors?: Array<{ message: string; type?: string }>;
    };

    if (json.errors && json.errors.length > 0) {
      const summary = json.errors
        .map((e) => `${e.type ?? "Error"}: ${e.message}`)
        .join("; ");
      throw new GitHubApiError(`GraphQL errors: ${summary}`, 200);
    }

    if (!json.data) {
      throw new GitHubApiError("GraphQL response missing data", 200);
    }
    return json.data;
  }

  async rest<T>(
    path: string,
    init: RequestInit = {},
    opts: RequestOptions = {},
  ): Promise<T> {
    const url = path.startsWith("http") ? path : `${REST_ROOT}${path}`;
    const response = await executeWithRetry(
      url,
      {
        ...init,
        headers: {
          authorization: `Bearer ${this.token}`,
          accept: "application/vnd.github+json",
          "x-github-api-version": "2022-11-28",
          "user-agent": USER_AGENT,
          ...(init.headers ?? {}),
        },
      },
      opts,
    );
    return (await response.json()) as T;
  }
}
