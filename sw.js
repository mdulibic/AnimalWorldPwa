const CACHE_STATIC_NAME = 'static';
const STATIC_FILES = [
    "./manifest.json",
    "./index.html",
    "./offline.html",
    "./404.html",
    "./src/main.css",
    "./src/images/aquarium.jpg",
    "./src/images/aquarium_plants.jpg",
    "./src/images/cat.jpg",
    "./src/images/dog.jpg",
    "./src/images/logo.jpg",
    "./src/images/parrot.jpg",
    "./src/images/tropical_fish.jpg"
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker... ', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function(cache){
                console.log('[Service Worker] Precaching App Shell');
                const stack = [];
                STATIC_FILES.forEach(file => stack.push(
                    cache.add(file).catch(_=>console.error(`can't load ${file} to cache`))
                ));
                return Promise.all(stack);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating Service Worker... ', event);
    event.waitUntil(
        caches.keys()
            .then(function(keyList) {
                return Promise.all(keyList.map(function(key) {
                    if(key !== CACHE_STATIC_NAME){
                        console.log('Removing old cache', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
});

self.addEventListener('fetch', (event) => {
    console.log("Intercepting fetch request for: ${e.request.url}");

    event.respondWith((async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        try {
            const response = await fetch(event.request);
            if (response.status === 404) {
                return caches.match('/404.html')
            }
            return response;
        } catch(err) {
            console.log('Error:');
            console.log(err);
            return caches.match('/offline.html')
        }
    })());
});

/*
self.addEventListener('sync', function(event) {
    console.log('[Service Worker] Background syncing', event);
    if (event.tag === 'sync-new-posts') {
        console.log('[Service Worker] Syncing new Posts');
        event.waitUntil(
            readAllData('sync-posts')
                .then(function(data) {
                    for (const dt of data) {
                        console.log("from indexdb: " + dt.name)

                        fetch('/saveCars', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: dt.id,
                                name: dt.name,
                                speed: dt.speed
                            })
                        })
                            .then(function(res) {
                                console.log('Sent data', res);
                                if (res.ok) {
                                    deleteItem('sync-posts', dt.id); // Isn't working correctly!
                                }
                            })
                            .catch(function(err) {
                                console.log('Error while sending data', err);
                            });
                    }

                })
        );
    }
});

 */

