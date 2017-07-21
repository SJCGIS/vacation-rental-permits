var DEBUG = false

module.exports = {
  /**
    Cache the app shell assets (HTML, JS, Images). CSS is inlined into the HTML
    so we don't need to add any CSS files.
  */
  staticFileGlobs: [
    'index.html',
    'bundle.js',
    'img/**.*'
  ],
  /**
    All runtime caching settings below use the `fastest` option which
    simultaneously requests the data from both the cache and the network.
    If it exists, the cache will almost always return the data faster, and the
    results from the network (if successful) will replace the data in the cache
    so the data cache is kept up to date.

    Another option would be to use `networkFirst` which falls back to the cache
    if the network is not available. However, this is not efficient for slower
    network connections because it will always try to download the network data
    first which can take a long time on a 2G connection. It will only fall
    back to the cache if the network request fails.

    The drawback to using `fastest` over `networkFirst` is that the user may
    not receive data updates immediately. On a request, the cached data is
    shown on the map until the network request finishes and updates the cache.
    The webpage would have to be reloaded again to show the updated data in the
    cache.

    See https://googlechrome.github.io/sw-toolbox/api.html#handlers
  */
  runtimeCaching: [{
    /**
      Cache all basemap tiles from level 10 which is the zoom level the map
      opens at. This way the entire app can be loaded even while offline.
    */
    urlPattern: new RegExp('^https://sjcgis\.org/arcgis/rest/services/Basemaps/General_Basemap_WM/MapServer/tile/10/', 'i'),
    handler: 'fastest',
    options: {
      debug: DEBUG,
      cache: {
        name: 'basemap-10-cache'
      }
    }
  }, {
    /**
      As the user zooms in and pans around, cache up to 100 basemap tiles in
      zoom levels 11-19 for offline use. After 100 tiles are cached, the least
      recently used (lru) tile is dropped from the cache. This is done to avoid
      unnecessarily filling up the user disk space with extraneous tile caches.
    */
    urlPattern: new RegExp('^https://sjcgis\.org/arcgis/rest/services/Basemaps/General_Basemap_WM/MapServer/tile/1[1-9]/', 'i'),
    handler: 'fastest',
    options: {
      debug: DEBUG,
      cache: {
        name: 'basemap-cache',
        maxEntries: 100
      }
    }
  }, {
    /**
      Store all overlay features in the cache.
    */
    urlPattern: new RegExp('^https://sjcgis\.org/arcgis/rest/services/LandUse/Vacation_Rental_Permits/MapServer/0/'),
    handler: 'fastest',
    options: {
      debug: DEBUG,
      cache: {
        name: 'overlay-cache'
      }
    }
  }]
}
