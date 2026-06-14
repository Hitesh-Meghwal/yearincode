import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Allow LAN devices (phones, other laptops) to hit the dev server for
  // mobile testing. Only applies to `next dev`; production is unaffected.
  // Add specific LAN IPs you actually test from — leaving it open to "*"
  // would weaken Next 16's cross-origin protection on dev.
  allowedDevOrigins: ["192.168.0.108", "192.168.0.104"],

  // The Flutter player bundle is overwritten in place on every rebuild
  // (apps/web/public/player/main.dart.wasm and friends). If the browser
  // caches the old wasm, code/asset changes silently fail to take effect.
  // Force no-store on the whole /player/* path so the iframe always loads
  // the freshest bytes — bundle is small, latency cost is acceptable.
  async headers() {
    return [
      {
        source: "/player/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
