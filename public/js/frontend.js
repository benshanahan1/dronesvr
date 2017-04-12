L.mapbox.accessToken = 'pk.eyJ1IjoiaXp6eWJyYW5kIiwiYSI6ImNpeTdzdHh3ZDAwNncycXN4eTYyY2k3dTAifQ.WzrAcd4xaQ0dd7ur3u0fSQ';

var map = L.mapbox.map('map', 'mapbox.streets', {
    keyboard: false
}).setView([41.8258611,-71.4034908],17);

var zoneLayer = L.mapbox.featureLayer().addTo(map); // layer to hold the zone icons

// generates a zone feature geoJson which can we badded to a feature collection
function generateZoneFeature(name, lat, lon) {
    return {
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": [lon, lat]
      },
      "properties": {
          "title": name, // name of point to show when clicked
          "icon": {
              "iconUrl": "/static/img/zone.png",
              "iconSize": [40, 40], // size of the icon
              "iconAnchor": [20, 20], // point of the icon which will correspond to marker's location
              "popupAnchor": [0, -20], // point from which the popup should open relative to the iconAnchor
              "className": "dot"
          }
      }
  }
}

var testCoord = 41.826317

var zoneGeoJson = {
  type: 'FeatureCollection',
  features: [
  generateZoneFeature('Ruth Simmon\'s East', 41.826317, -71.401175),
  generateZoneFeature('Wriston West', 41.825031, -71.402029),
  generateZoneFeature('Main Green Center', 41.826063, -71.403322),
  generateZoneFeature('Pembroke Field Center', 41.829639, -71.399062),
  generateZoneFeature('The Walk North', 41.827663, -71.401896)
  ]
};

// Set a custom icon on each marker based on feature properties.
zoneLayer.on('layeradd', function(e) {
    var marker = e.layer, feature = marker.feature;
    marker.setIcon(L.icon(feature.properties.icon));
});

// Add features to the map.
zoneLayer.setGeoJSON(zoneGeoJson);


//droneLayer.setGeoJSON(droneGeoJson);

setInterval(function move(){
    testCoord += 0.01
    // console.log(testCoord)
    zoneLayer.setGeoJSON(zoneGeoJson);
    }, 1000)
