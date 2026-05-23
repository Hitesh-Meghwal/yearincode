import type { MetadataRoute } from "next";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://yearincode.com"
  );
}

// PRD §5.4 — share pages indexable; /api/* and /generate blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/generate", "/me", "/auth/"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
