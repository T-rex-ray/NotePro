import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope & { location: Window['location'] };

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

const navHandler = createHandlerBoundToURL('/NotePro/index.html');
const navigation = new NavigationRoute(navHandler, {
  denylist: [/sw\.js$/, /manifest\.webmanifest$/],
});
registerRoute(navigation);

registerRoute(
  ({ url }) => url.origin === self.location.origin,
  new StaleWhileRevalidate({
    cacheName: 'local-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 60 })],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com' || url.origin === 'https://fonts.googleapis.com',
  new CacheFirst({ cacheName: 'google-fonts' })
);
