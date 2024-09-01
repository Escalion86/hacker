let cacheData = 'Hacker'
this.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheData).then(async (cache) => {
      console.log('cache.keys()', await cache.keys())
      return await cache.addAll([
        'static/js/bundle.js',
        '/index.html',
        '/',
        '/manifest.json',
        '/favicon.ico',
        '/static/js/',
        '/logo192.png',
        'static/js/main.js',
        'static/css/main.css',
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
