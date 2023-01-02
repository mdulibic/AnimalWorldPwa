importScripts('/idb.js');
importScripts('/utility.js');

const CACHE_STATIC_NAME = 'static';
const STATIC_FILES = [
    "./",
    "./manifest.json",
    "./index.html",
    "./encyclopedias.html",
    "./offline.html",
    "./404.html",
    "./src/main.css",
    "./src/images/logo.png",
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

/*
CACHE FIRST - caching strategy
This strategy will look for a response in the cache first.
If a previously cached response is found, it will return and serve the cache.
If not, it will fetch the response from the network, serve it, and cache it for next time.
*/
self.addEventListener('fetch', (event) => {
    console.log("Intercepting fetch request for:"+ event.request.url);

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

            const r = response.clone();
            caches.open(CACHE_STATIC_NAME)
                .then(function(cache){
                    cache.put(event.request, r);
                })

            return response;
        } catch(err) {
            console.log('Error:');
            console.log(err);
            return caches.match('/offline.html')
        }
    })());
});

self.addEventListener('sync', function(event) {
    console.log('[Service Worker] Background syncing', event);
    if (event.tag === 'sync-new-encyclopedias') {
        console.log('[Service Worker] Syncing new encyclopedias');
        event.waitUntil(
            readAllData('sync-encyclopedias')
                .then(function(data) {
                    for (const dt of data) {
                        console.log("from indexdb: " + dt.title)

                        fetch('/saveEncyclopedias', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: dt.id,
                                title: dt.title,
                                description: dt.description
                            })
                        })
                            .then(function(res) {
                                console.log('Sent data', res);
                                if (res.ok) {
                                    self.registration.showNotification(
                                        `Encyclopedia saved`
                                    )
                                    deleteItem('sync-encyclopedias', dt.id); // Isn't working correctly!
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

self.addEventListener('periodicsync', (syncEvent) => {
    if (syncEvent.tag === 'encyclopedias-daily-sync') {
        syncEvent.waitUntil(
            readAllData('sync-encyclopedias')
                .then(function(data) {
                    for (const dt of data) {
                        console.log("from indexdb: " + dt.title)

                        fetch('/saveEncyclopedias', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: dt.id,
                                title: dt.title,
                                description: dt.description
                            })
                        })
                            .then(function(res) {
                                console.log('Sent data', res);
                                if (res.ok) {
                                    self.registration.showNotification(
                                        `Encyclopedia saved`
                                    )
                                    deleteItem('sync-encyclopedias', dt.id); // Isn't working correctly!
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

self.addEventListener("notificationclick", function (event) {
    let notification = event.notification;
    console.log("notification", notification);
    event.waitUntil(
        clients.matchAll().then(function (clis) {
            clis.forEach((client) => {
                client.navigate(notification.data.redirectUrl);
                client.focus();
            });
            notification.close();
        })
    );
});

self.addEventListener("notificationclose", function (event) {
    console.log("notificationclose", event);
});

self.addEventListener("push", function (event) {
    console.log("push event", event);

    var data = { title: "title", body: "body", redirectUrl: "/" };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.body,
        icon: "assets/img/android/app_icon_x96.png",
        badge: "assets/img/android/app_icon_x96.png",
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: {
            redirectUrl: data.redirectUrl,
        },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});


