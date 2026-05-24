import type { MetadataRoute } from "next";

// PWA manifest. Not strictly an SEO requirement, but Lighthouse counts it,
// "Add to Home Screen" on iOS/Android works without extra plumbing, and
// Google's mobile-first ranking gives a small boost to installable sites.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "yearincode",
    short_name: "yearincode",
    description:
      "Turn a year of your GitHub activity into an animated Spotify-Wrapped-style recap.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
