const CACHE_NAME = "lecture-portal-green-v2";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", function (event) {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(STATIC_FILES);
      })
  );

  self.skipWaiting();

});


self.addEventListener("activate", function (event) {

  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {

        return Promise.all(
          cacheNames.map(function (cacheName) {

            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }

          })
        );

      })
  );

  self.clients.claim();

});


self.addEventListener("fetch", function (event) {

  if (event.request.method !== "GET") {
    return;
  }


  if (event.request.mode === "navigate") {

    event.respondWith(

      fetch(event.request)

        .then(function (response) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(function (cache) {
              cache.put(event.request, copy);
            });

          return response;

        })

        .catch(function () {
          return caches.match("/index.html");
        })

    );

    return;
  }


  event.respondWith(

    caches.match(event.request)

      .then(function (cachedResponse) {

        if (cachedResponse) {
          return cachedResponse;
        }


        return fetch(event.request)

          .then(function (response) {

            if (
              !response ||
              response.status !== 200 ||
              response.type === "opaque"
            ) {
              return response;
            }


            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(function (cache) {
                cache.put(event.request, copy);
              });

            return response;

          });

      })

  );

});
