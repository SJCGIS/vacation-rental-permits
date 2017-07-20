var DEBUG = false

module.exports = {
  staticFileGlobs: [
    'index.html',
    'bundle.js',
    'img/**.*'
  ],
  runtimeCaching: [{
    urlPattern: new RegExp('^https://sjcgis\.org/arcgis/rest/services/Basemaps/General_Basemap_WM/MapServer/tile/10/', 'i'),
    handler: 'fastest',
    options: {
      debug: DEBUG,
      cache: {
        name: 'basemap-10-cache'
      }
    }
  }, {
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
