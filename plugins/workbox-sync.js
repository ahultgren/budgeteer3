const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin(
  "formQueue",
  {
    maxRetentionTime: 24 * 60 * 7,
  }
);

workbox.routing.registerRoute(
  /https:\/\/localhost:3000/,
  new workbox.strategies.NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  "GET"
);
