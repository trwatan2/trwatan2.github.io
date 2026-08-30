const CACHE_NAME = "lecture-portal-green-v4";

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];


/* ==========================================
   INSTALL
========================================== */

self.addEventListener(
  "install",
  function (event) {

    event.waitUntil(

      caches
        .open(CACHE_NAME)

        .then(function (cache) {

          return cache.addAll(
            APP_FILES
          );

        })

    );

    self.skipWaiting();

  }
);


/* ==========================================
   ACTIVATE
========================================== */

self.addEventListener(
  "activate",
  function (event) {

    event.waitUntil(

      caches
        .keys()

        .then(function (cacheNames) {

          return Promise.all(

            cacheNames.map(
              function (cacheName) {

                if (
                  cacheName !== CACHE_NAME
                ) {

                  return caches.delete(
                    cacheName
                  );

                }

              }
            )

          );

        })

    );

    self.clients.claim();

  }
);


/* ==========================================
   FETCH
========================================== */

self.addEventListener(
  "fetch",
  function (event) {

    const request = event.request;

    if (request.method !== "GET") {
      return;
    }


    const url =
      new URL(request.url);


    /* ======================================
       PDFは絶対にキャッシュしない
       常にGitHub Pages上の最新版を取得
    ====================================== */

    if (
      url.pathname
        .toLowerCase()
        .endsWith(".pdf")
    ) {

      event.respondWith(
        fetch(request)
      );

      return;

    }


    /* ======================================
       HTMLはネット上の最新版を優先
    ====================================== */

    if (
      request.mode === "navigate"
    ) {

      event.respondWith(

        fetch(request)

          .then(function (response) {

            const copy =
              response.clone();

            caches
              .open(CACHE_NAME)

              .then(function (cache) {

                cache.put(
                  request,
                  copy
                );

              });

            return response;

          })

          .catch(function () {

            return caches.match(
              "/index.html"
            );

          })

      );

      return;

    }


    /* ======================================
       アイコンなどはキャッシュ利用
    ====================================== */

    event.respondWith(

      caches
        .match(request)

        .then(function (cachedResponse) {

          if (cachedResponse) {

            return cachedResponse;

          }


          return fetch(request)

            .then(function (response) {

              if (
                !response ||
                response.status !== 200 ||
                response.type === "opaque"
              ) {

                return response;

              }


              const copy =
                response.clone();


              caches
                .open(CACHE_NAME)

                .then(function (cache) {

                  cache.put(
                    request,
                    copy
                  );

                });


              return response;

            });

        })

    );

  }
);
