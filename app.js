/* global L */
require('leaflet')
var Esri = require('esri-leaflet')
require('esri-leaflet-renderers')
require('leaflet-sidebar-v2')
var bel = require('bel')
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

var vacationRentals = Esri.featureLayer({
  url: 'https://sjcgis.org/arcgis/rest/services/LandUse/Vacation_Rental_Permits/MapServer/0',
  fields: ['OBJECTID', 'Permit_No', 'Customer_LName', 'Permit_Status', 'Decision_Date']
}).addTo(map)

var sidebar = L.control.sidebar('sidebar').addTo(map)

//Create panes in order of display. e.g. home, legend, etc
vacationRentals.metadata(function (err, data) {
  if (err) console.error(err)
  else {
    createHomePanel(data)
    createLegendPanel(data)
    createPopups(data)
  }
})

function createHomePanel (data) {
  var el = bel`<div class="sidebar-pane">
    <h1 class="sidebar-header f5">Vacation Rental Permits
      ${sidebarClose()}</h1>
    ${data.description.split(/\r?\n/g).map(function (line) {
      return bel`<p class="f5 measure lh-copy">${line}</p>`
    })}
  </div>`
  sidebar.addPanel({
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
  })
  sidebar.open('home')
}

function createLegendPanel (data) {
  var el = createLegend(data)
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
}

function createPopups (data) {
  var fieldInfo = data.fields.reduce(function (acc, cur, i) {
    acc[cur['name']] = cur
    return acc
  }, {})
  vacationRentals.bindPopup(function (layer) {
    var props = layer.feature.properties
    var el = bel`<ul class="list pl0">${Object.keys(props)
    .map(function (key) {
      return bel`<li class="flex items-center lh-copy measure pa1 ph0-l bb b--black-10">
      <div class="db f7 f6-ns black-80">
      <b>${fieldInfo[key]['alias']}:</b>
      <span class="pl1">${format(key, props[key])}</span>
      </div>
      </li>`
    })
  }</ul>`
    return el
  })

  function format (k, v) {
    switch (fieldInfo[k]['type']) {
      case 'esriFieldTypeSmallInteger':
      case 'esriFieldTypeInteger':
      case 'esriFieldTypeSingle':
      case 'esriFieldTypeDouble':
      case 'esriFieldTypeString':
      case 'esriFieldTypeOID':
      case 'esriFieldTypeGUID':
      case 'esriFieldTypeGlobalID':
      case 'esriFieldTypeXML':
        return v
      case 'esriFieldTypeDate':
        return new Date(v).toLocaleDateString()
      case 'esriFieldTypeGeometry':
      case 'esriFieldTypeBlob':
      case 'esriFieldTypeRaster':
        return null
    }
  }
}



function createLegend (data) {
  var el = bel`<div class="sidebar-pane">
    <h1 class="sidebar-header f5">Legend
    ${sidebarClose()}</h1>
    ${createLayerLegend(data)}
  </div>`
  return el
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
    <h2 class="f5 lh-copy">${layer.name}</h2>
    <ul class="list p10 mt0 measure center">
      ${layer.drawingInfo.renderer.uniqueValueInfos.map(createLegendItem)}
    </ul>
  </div>`
}

function createLegendItem (item) {
  return bel`<li class="flex items-center lh-copy pa3 ph0-l bb b--black-10">
    <img class="pr2" src="data:${item.symbol.contentType};base64,${item.symbol.imageData}" />
    <span class="f6 db black-80">${item.label}</span>
  </li>`
}
