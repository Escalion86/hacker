let cacheData = 'Hacker'
this.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheData).then((cache) => {
      cache.addAll([
        'static/js/bundle.js',
        '/index.html',
        '/',
        '/manifest.json',
        '/favicon.ico',
        '/static/js/',
        // './',
      ])
    })
  )
})

this.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      if (resp) return resp
    })
  )
})
