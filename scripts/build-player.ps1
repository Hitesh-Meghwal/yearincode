# Build the Flutter player and stage it into apps/web/public/player.
#
# The Flutter SDK regenerates flutter_bootstrap.js and flutter_service_worker.js
# on every build, so we have to patch them again each time:
#   1. flutter_bootstrap.js — we pass --pwa-strategy=none, but the bootstrap
#      still calls _flutter.loader.load({...}) with a serviceWorker key in
#      some flutter versions. Strip that arg so registration is impossible.
#   2. flutter_service_worker.js — Flutter would normally not emit this with
#      --pwa-strategy=none, but in case a previous build leaked a SW into
#      a user's browser, we keep a small self-unregistering stub at the
#      same path so old clients can heal themselves.
#
# Run from the repo root: pwsh ./scripts/build-player.ps1

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
$playerSrc = Join-Path $repo "apps\player"
$webPublic = Join-Path $repo "apps\web\public\player"

Push-Location $playerSrc
try {
    flutter build web --release --wasm --base-href "/player/" --pwa-strategy=none --suppress-analytics
    if ($LASTEXITCODE -ne 0) { throw "flutter build failed" }
} finally {
    Pop-Location
}

if (Test-Path $webPublic) { Remove-Item $webPublic -Recurse -Force }
New-Item -ItemType Directory -Path $webPublic -Force | Out-Null
Copy-Item -Path (Join-Path $playerSrc "build\web\*") -Destination $webPublic -Recurse -Force

# Strip serviceWorker registration from the bootstrap if Flutter emitted one.
$bootPath = Join-Path $webPublic "flutter_bootstrap.js"
$boot = Get-Content $bootPath -Raw
$patched = $boot -replace '_flutter\.loader\.load\(\{[^}]*serviceWorker[^}]*\}[^)]*\)\s*;?', '_flutter.loader.load({});'
Set-Content -Path $bootPath -Value $patched -NoNewline

# Drop in the self-unregistering SW stub at the path the old SW lived at.
# This file is the source of truth; the build copy is regenerated each time.
$swStub = @'
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: "window" });
    for (const client of clients) { client.navigate(client.url); }
  })());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
'@
Set-Content -Path (Join-Path $webPublic "flutter_service_worker.js") -Value $swStub -NoNewline

Write-Output "Player built and staged to $webPublic"
