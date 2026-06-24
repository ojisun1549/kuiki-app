// オフライン対応のためのシンプルなservice worker。
// 薬剤データはコード内に静的に保持されており外部APIへの依存がないため、
// 一度オンラインでアプリ本体（HTML/JS/CSS/フォント）をキャッシュしてしまえば、
// 以降はオフラインでも判定ロジック・UIがそのまま動作する。

const RUNTIME_CACHE = "kuiki-app-runtime-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== RUNTIME_CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont =
    url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

  if (!isSameOrigin && !isGoogleFont) return;

  const isNavigation = request.mode === "navigate";

  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      if (isNavigation) {
        // HTMLページは常に最新を優先（network-first）。
        // 古いHTMLが古いJS/CSSの参照を持ち続け、デプロイ後に新旧が混在する事故を防ぐ。
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.status === 200) cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response(
            "オフラインのため読み込めません。一度オンラインで開いてからご利用ください。",
            { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
          );
        }
      }

      // 静的アセット（ハッシュ付きJS/CSS・フォント等）はキャッシュ優先＋裏で更新
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(networkFetch);
        return cached;
      }

      const networkResponse = await networkFetch;
      if (networkResponse) return networkResponse;

      return new Response("", { status: 504 });
    })
  );
});
