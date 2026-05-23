import { statSync } from "node:fs";
import { join } from "node:path";

// We tag the iframe URL with a `?v=<version>` cache-buster so the browser
// always loads the freshest player. Flutter's `.last_build_id` would be the
// obvious source but it's a hash of build *inputs* (SDK version, flags) — it
// doesn't change when only Dart source changes. So we use the mtime of
// main.dart.wasm instead, which is touched on every build.
let cached: string | null = null;

export function getPlayerVersion(): string {
  if (cached !== null) return cached;
  try {
    const stat = statSync(
      join(process.cwd(), "public", "player", "main.dart.wasm"),
    );
    cached = String(stat.mtimeMs | 0);
  } catch {
    cached = "0";
  }
  return cached;
}
