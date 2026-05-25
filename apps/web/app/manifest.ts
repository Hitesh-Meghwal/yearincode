import type { MetadataRoute } from "next";

// Web manifest. We keep it for SEO / Lighthouse, but use `display: "browser"`
// instead of `"standalone"` so Chrome / Edge do NOT show the "Install
// yearincode" install-prompt banner on share pages. The product is a
// 60-second viral wrap, not an app — installability would only confuse
// people. The manifest still wires the favicon, theme color, and name for
// engines and crawlers that read it.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "yearincode",
    short_name: "yearincode",
    description:
      "Turn a year of your GitHub activity into an animated Spotify-Wrapped-style recap.",
    start_url: "/",
    display: "browser",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
