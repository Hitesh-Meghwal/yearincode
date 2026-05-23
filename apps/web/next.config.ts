import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

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
