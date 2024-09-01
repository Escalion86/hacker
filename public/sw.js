let cacheData = 'Hacker'
this.addEventListener('install', async (event) => {
  const cache = await caches.open(cacheData)
  const cacheKeys = await cache.keys()
  console.log('cache.keys()', cacheKeys)
  return await event.waitUntil(
    cache.addAll([
      'static/js/bundle.js',
      '/index.html',
      '/',
      '/manifest.json',
      '/favicon.ico',
      '/static/js/',
      '/logo192.png',
      'static/js/main.js',
      'static/css/main.css',
      'static/css/main.5b10659c.css',
      'escalion/png',
      // './',
    ])
  )

  // event.waitUntil(
  //   const caches.open(cacheData).then((cache) => {
  //     console.log('cache.keys()', await cache.keys())
  //     return await cache.addAll([
  //       'static/js/bundle.js',
  //       '/index.html',
  //       '/',
  //       '/manifest.json',
  //       '/favicon.ico',
  //       '/static/js/',
  //       '/logo192.png',
  //       'static/js/main.js',
  //       'static/css/main.css',
  //       // './',
  //     ])
  //   })
  // )
})

this.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      if (resp) return resp
    })
  )
})
