// let cacheData = 'Hacker'
// this.addEventListener('install', async (event) => {
//   const cache = await caches.open(cacheData)
//   const cacheKeys = await cache.keys()
//   console.log('cache.keys()', cacheKeys)
//   return await event.waitUntil(
//     cache.addAll([
//       'static/js/bundle.js',
//       '/index.html',
//       '/',
//       '/manifest.json',
//       '/favicon.ico',
//       '/static/js/',
//       '/logo192.png',
//       'static/js/main.js',
//       'static/css/main.css',
//       'static/css/main.5b10659c.css',
//       '/img/escalion.png',
//       '/img/denjoker.png',
//       // './',
//     ])
//   )

//   // event.waitUntil(
//   //   const caches.open(cacheData).then((cache) => {
//   //     console.log('cache.keys()', await cache.keys())
//   //     return await cache.addAll([
//   //       'static/js/bundle.js',
//   //       '/index.html',
//   //       '/',
//   //       '/manifest.json',
//   //       '/favicon.ico',
//   //       '/static/js/',
//   //       '/logo192.png',
//   //       'static/js/main.js',
//   //       'static/css/main.css',
//   //       // './',
//   //     ])
//   //   })
//   // )
// })

// this.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((resp) => {
//       if (resp) return resp
//     })
//   )
// })

const MAIN_CACHE = 'Hacker'
const OFFLINE_PAGE = '/offline.html'

this.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event)
  event.waitUntil(
    caches.open(MAIN_CACHE).then(function (cache) {
      console.log('[Service Worker] Precaching App Shell')
      cache.add([OFFLINE_PAGE])
    })
  )
})

this.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ....', event)
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== MAIN_CACHE) {
            console.log('[Service Worker] Removing old cache.', key)
            return caches.delete(key)
          }
        })
      )
    })
  )
  return this.clients.claim()
})

this.addEventListener('fetch', function (event) {
  var url = event.request.url
  console.log('[Service Worker] Fetching something ....', url, '\n', event)

  event.respondWith(
    //network first
    fetch(event.request)
      .then(function (res) {
        console.log('Loaded from web: ' + url)
        if (
          event.request.method === 'GET' &&
          !url.startsWith('chrome-extension') &&
          !url.includes('extension') &&
          url.startsWith('http')
        ) {
          // Clone the response right after receiving it
          var clonedRes = res.clone()
          // Use the cloned response for caching
          caches.open(MAIN_CACHE).then(function (cache) {
            cache.put(url, clonedRes)
          })
        }
        return res
      })
      .catch(function (err) {
        console.error(err + ' while fetching: ' + url)
        //look for it in the cache
        return caches
          .match(url)
          .then(function (response) {
            if (response) {
              console.log('Loaded from cache: ' + url)
              return response
            } else if (event.request.mode === 'navigate') {
              //if the request is a navigation request that is not in the cache, return the offline page
              console.log('Redirecting to offline page from: ' + url)
              return caches.open(MAIN_CACHE).then(function (cache) {
                return cache.match(OFFLINE_PAGE)
              })
            }
          })
          .catch(function (err) {
            console.error('FAILED: ' + err + ' ' + url)
          })
      })
  )
})
