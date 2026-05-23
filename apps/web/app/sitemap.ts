import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://yearincode.com"
  );
}

export const revalidate = 3600; // regen at most once an hour

// Auto-generates from public wrappeds plus the static marketing pages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wrapped_reports")
      .select("github_username, year, updated_at")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(5000);

    if (error) {
      console.warn("[sitemap] query failed:", error.message);
      return staticPages;
    }

    const wrappedPages: MetadataRoute.Sitemap = (data ?? []).map((row) => ({
      url: `${base}/u/${encodeURIComponent(row.github_username)}/${row.year}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...wrappedPages];
  } catch (err) {
    console.warn("[sitemap] threw:", err instanceof Error ? err.message : err);
    return staticPages;
  }
}
