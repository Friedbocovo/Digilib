// registerServiceWorker.ts
// À placer dans src/utils/ ou src/

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker enregistré avec succès:', registration.scope);

          // Vérifier les mises à jour toutes les heures
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Gérer les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouvelle version disponible
                  if (confirm('Une nouvelle version est disponible ! Voulez-vous actualiser ?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
        });
    });
  }
}
const CACHE_NAME = 'digilib-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache ouvert')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Stratégie de cache : Network First, puis Cache
self.addEventListener('fetch', (event) => {
  // IMPORTANT: Ignorer les requêtes non-HTTP
  const url = event.request.url
  
  // Ignorer les extensions et protocoles non-HTTP
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return  // Chrome extensions, file://, etc.
  }

  // Ignorer browser-sync en dev
  if (url.includes('browser-sync') || url.includes('hot-update')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Ne cacher que les réponses valides
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone()
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Try-catch pour éviter les erreurs
              try {
                cache.put(event.request, responseClone)
              } catch (err) {
                // Erreur silencieuse (extensions Chrome, etc.)
              }
            })
            .catch(() => {
              // Erreur silencieuse
            })
        }
        return response
      })
      .catch(() => {
        // Si le réseau échoue, utiliser le cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Page offline par défaut
            if (event.request.destination === 'document') {
              return caches.match('/')
            }
          })
      })
  )
})
// Fonction pour désinstaller le Service Worker (utile pour le développement)
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('Service Worker désenregistré');
      })
      .catch((error) => {
        console.error('Erreur lors du désenregistrement:', error);
      });
  }
}

// Vérifier si l'app est installée
export function isAppInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Demander l'autorisation pour les notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}const CACHE_NAME = 'digilib-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache ouvert')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Stratégie de cache : Network First, puis Cache
self.addEventListener('fetch', (event) => {
  // IMPORTANT: Ignorer les requêtes non-HTTP
  const url = event.request.url
  
  // Ignorer les extensions et protocoles non-HTTP
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return  // Chrome extensions, file://, etc.
  }

  // Ignorer browser-sync en dev
  if (url.includes('browser-sync') || url.includes('hot-update')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Ne cacher que les réponses valides
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone()
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Try-catch pour éviter les erreurs
              try {
                cache.put(event.request, responseClone)
              } catch (err) {
                // Erreur silencieuse (extensions Chrome, etc.)
              }
            })
            .catch(() => {
              // Erreur silencieuse
            })
        }
        return response
      })
      .catch(() => {
        // Si le réseau échoue, utiliser le cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Page offline par défaut
            if (event.request.destination === 'document') {
              return caches.match('/')
            }
          })
      })
  )
})