const CACHE = 'aurelia-atelier-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './catalogo.html',
  './producto.html',
  './carrito.html',
  './contacto.html',
  './404.html',
  './manifest.json',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/pages.css',
  './data/productos.json',
  './js/main.js',
  './js/inicio.js',
  './js/catalogo.js',
  './js/producto.js',
  './js/carrito.js',
  './js/contacto.js',
  './img/p1.svg',
  './img/p2.svg',
  './img/p3.svg',
  './img/p4.svg',
  './img/p5.svg',
  './img/p6.svg',
  './img/p7.svg',
  './img/p8.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalación: guarda los archivos en caché
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

// Activación: borra cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Peticiones: responde desde caché y, si no hay, desde la red
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((res) => res || fetch(e.request))
  );
});