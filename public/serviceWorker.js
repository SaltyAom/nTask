var CACHE_NAME = 'Component';
var urlsToCache = [
  'css/nTask.css',
  'fontawesome/css/fontawesome-all.min.css',
  'fontawesome/webfonts/fa-brands-400.woff2',
  'fontawesome/webfonts/fa-regular-400.woff2',
  'fontawesome/webfonts/fa-solid-900.woff2',
  'fonts/sf/SFCompactDisplay-Regular.otf',
  'fonts/sf/SFCompactDisplay-SemiBold.otf',
  'libs/dexie.min.js',
  'jquery/jquery-3.3.1.min.js',
  'jquery/plugin/jquery.easing.min.js',
  'jquery/ui/jquery-ui.min.js',
  'js/control.js',
  'index.html'
];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
      .then(cache => {
        urlsToCache.map(offlineCache => {
          console.log(offlineCache);
          cache.add(offlineCache);
        })
      })
    )
  })

  self.addEventListener('fetch', (event) => {
    if (event.request.method === 'GET') {
      event.respondWith(
        caches.match(event.request)
        .then((cached) => {
          var networked = fetch(event.request)
            .then((response) => {
              let cacheCopy = response.clone()
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, cacheCopy))
              return response;
            })
            .catch(() => caches.match(offlinePage));
          return cached || networked;
        })
      )
    }
    return;
  });