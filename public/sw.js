// オフライン対応のためのシンプルなservice worker。
// 薬剤データはコード内に静的に保持されており外部APIへの依存がないため、
// 一度オンラインでアプリ本体（HTML/JS/CSS/フォント）をキャッシュしてしまえば、
// 以降はオフラインでも判定ロジック・UIがそのまま動作する。

const RUNTIME_CACHE = "kuiki-app-runtime-v1";

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

  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
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
        // stale-while-revalidate: 表示はキャッシュ優先、裏で更新を取得
        event.waitUntil(networkFetch);
        return cached;
      }

      const networkResponse = await networkFetch;
      if (networkResponse) return networkResponse;

      if (request.mode === "navigate") {
        const fallback = await cache.match("/");
        if (fallback) return fallback;
      }

      return new Response(
        "オフラインのため読み込めません。一度オンラインで開いてからご利用ください。",
        { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    })
  );
});
