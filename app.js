/* global L */
require('leaflet')
var Esri = require('esri-leaflet')
require('leaflet-sidebar-v2')
var bel = require('bel')
var series = require('run-series')
var octicons = require('octicons')

var map = L.map('map', {
  center: [48.5, -123.0],
  zoom: 10,
  zoomControl: false
})

var zoomControl = L.control.zoom({
  position: 'topright'
})
zoomControl.addTo(map)

var basemap = Esri.tiledMapLayer({
  url: 'https://sjcgis.org/arcgis/rest/services/Basemaps/General_Basemap_WM/MapServer'
}).addTo(map)

var vacationRentals = Esri.dynamicMapLayer({
  url: 'https://sjcgis.org/arcgis/rest/services/LandUse/Vacation_Rental_Permits/MapServer',
  layers: [0]
}).addTo(map)

vacationRentals.bindPopup(function (err, fc) {
  if (err || fc.features.length === 0) {
    return false
  } else {
    var props = fc.features[0].properties
    return bel`<ul class="list pl0">${Object.keys(props)
      .filter(function (key) {
        return ['Permit Number', 'Last Name', 'Status', 'Decision Date'].indexOf(key) > -1
      })
      .map(function (key) {
        return bel`<li class="flex items-center lh-copy pa3 ph0-l bb b--black-10">
      <div class="db f6 black-80">
      <b>${key}:</b>
      <span>${props[key]}</span>
      </li>`
      })
    }</ul>`
  }
})

var sidebar = L.control.sidebar('sidebar').addTo(map)

// Create panes in order of display. e.g. home, legend, etc
series([
  function (cb) {
    vacationRentals.metadata(function (err, data) {
      if (err) cb(err)
      else {
        var el = bel`<div class="sidebar-pane">
     <h1 class="sidebar-header f5">${data.documentInfo.Title}
     ${sidebarClose()}</h1>
     ${data.serviceDescription.split(/\r?\n/g).map(function (line) {
       return bel`<p class="f5 measure lh-copy">${line}</p>`
     })}
   </div>`

        var panelContent = {
          id: 'home',
          tab: octicons['home'].toSVG({
            'aria-label': 'Toggle Home pane',
            'width': '20',
            'height': '20',
            'fill': 'currentcolor',
            'viewBox': '0 0 20 20',
            'class': 'v-mid'
          }),
          pane: el
        }
        sidebar.addPanel(panelContent)
        sidebar.open('home')
        cb(null)
      }
    })
  },
  function (cb) {
    createLegend(vacationRentals.service.options.url, function (err, el) {
      if (err) cb(err)
      else {
        sidebar.addPanel({
          id: 'legend',
          tab: octicons['list-unordered'].toSVG({
            'aria-label': 'Toggle Legend pane',
            'width': '20',
            'height': '20',
            'fill': 'currentcolor',
            'viewBox': '0 0 20 20',
            'class': 'v-mid'
          }),
          pane: el
        })
        cb(null)
      }
    })
  }
], function (err) {
  if (err) console.error(err)
})

function createLegend (serviceUrl, cb) {
  var legendUrl = serviceUrl + '/legend'
  Esri.get(legendUrl, {
    f: 'json'
  }, function (err, data) {
    if (err) cb(err)
    var el = bel`<div class="sidebar-pane">
      <h1 class="sidebar-header f5">Legend
      ${sidebarClose()}</h1>
      ${data.layers.map(createLayerLegend)}
    </div>`
    cb(null, el)
  })
}

function sidebarClose () {
  var el = bel`<span class="sidebar-close"></span>`
  el.innerHTML = octicons['x'].toSVG({
    'aria-label': 'Close sidebar',
    'width': '20',
    'height': '20',
    'fill': 'currentcolor',
    'viewBox': '0 0 20 20',
    'class': 'v-mid'
  })
  return el
}

function createLayerLegend (layer) {
  return bel`<div>
    <h2 class="f5 lh-copy">${layer.layerName}</h2>
    <ul class="list p10 mt0 measure center">${layer.legend.map(createLegendItem)}</ul>
  </div>`
}

function createLegendItem (item) {
  return bel`<li class="flex items-center lh-copy pa3 ph0-l bb b--black-10">
    <img class="pr2" src="data:${item.contentType};base64,${item.imageData}" />
    <span class="f6 db black-80">${item.label}</span>
  </li>`
}
