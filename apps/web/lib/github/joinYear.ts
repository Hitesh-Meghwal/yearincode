import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { GitHubClient } from "./client";

const VIEWER_CREATED_AT_QUERY = /* GraphQL */ `
  query ViewerCreatedAt {
    viewer {
      createdAt
    }
  }
`;

type ViewerCreatedAtResponse = {
  viewer: {
    createdAt: string;
  };
};

/**
 * Returns the calendar year the user created their GitHub account, used to
 * size the year picker. Reads from `user_github_tokens.github_created_at`
 * first; if absent (older row from before migration 0006, or a user who
 * signed in before we started capturing it in /auth/callback), fetches it
 * lazily from GitHub and persists it.
 *
 * Returns null when the user has no token row at all, or when the fetch
 * fails — in which case the caller falls back to a past-5-years window.
 */
export async function getOrFetchGithubJoinYear(
  userId: string,
): Promise<number | null> {
  const svc = createServiceRoleClient();

  const { data, error } = await svc
    .from("user_github_tokens")
    .select("access_token, github_created_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (data.github_created_at) {
    return new Date(data.github_created_at as string).getUTCFullYear();
  }

  if (!data.access_token) {
    return null;
  }

  try {
    const client = new GitHubClient(data.access_token as string);
    const resp = await client.graphql<ViewerCreatedAtResponse>(
      VIEWER_CREATED_AT_QUERY,
    );
    const createdAt = resp.viewer.createdAt;
    if (!createdAt) return null;

    // Fire-and-forget persist — failure here just means we'll try again on
    // the next /generate visit.
    void svc
      .from("user_github_tokens")
      .update({ github_created_at: createdAt })
      .eq("user_id", userId)
      .then(({ error: updateError }) => {
        if (updateError) {
          console.warn(
            "[joinYear] failed to persist github_created_at:",
            updateError.message,
          );
        }
      });

    return new Date(createdAt).getUTCFullYear();
  } catch (err) {
    console.warn(
      "[joinYear] GitHub fetch failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
