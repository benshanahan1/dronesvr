// lunadrop Mapbox.js include

// Default colors
var unselectedColor = "#666666";
var selectedColor = "#39bafc";

// Define feature markers
// TODO: this information should be pulled from database
var destinationInfo = {
    "ruthsimmons": {
        "name": "Ruth Simmons",
        "destination": "ruthsimmons",
        "description": "Ruth Simmon's delivery",
        "latitude": 41.826316,
        "longitude": -71.401063,
        "marker-color": unselectedColor,
        "selected": false,
        "marker-size": "small"
    },
    "quietgreen": {
        "name": "Quiet Green",
        "destination": "quietgreen",
        "description": "Quiet Green delivery",
        "latitude": 41.826168,
        "longitude": -71.404168,
        "marker-color": unselectedColor,
        "selected": false,
        "marker-size": "small"
    },
    "maingreen": {
        "name": "Main Green",
        "destination": "maingreen",
        "description": "Main Green delivery",
        "latitude": 41.826028,
        "longitude": -71.403429,
        "marker-color": unselectedColor,
        "selected": false,
        "marker-size": "small"
    }
};

var droneInfo = {
    "luna": {
        "name": "luna",
        "latitude": 41.826192,  // default start location
        "longitude": -71.402693,
        "iconUrl": "/static/img/frontend/luna.png",
        "iconSize": [30,30],
        "iconAnchor": [15,15],
    }
};

// Define GeoJSON structures
var destinations = [
    generateDestination(destinationInfo["ruthsimmons"]),
    generateDestination(destinationInfo["maingreen"]),
    generateDestination(destinationInfo["quietgreen"])
];
var drones = [
    generateDrone(droneInfo["luna"])
];

// Define map
L.mapbox.accessToken = 'pk.eyJ1IjoiaXp6eWJyYW5kIiwiYSI6ImNpeTdzdHh3ZDAwNncycXN4eTYyY2k3dTAifQ.WzrAcd4xaQ0dd7ur3u0fSQ';
var map = L.mapbox.map("map","mapbox.light",{zoomControl: false}).setView([41.826192,-71.402693],16);

// Add map layers
var destinationLayer = L.mapbox.featureLayer().addTo(map);
var droneLayer = L.mapbox.featureLayer().addTo(map);
destinationLayer.setGeoJSON(destinations);
droneLayer.setGeoJSON(drones);

// TODO: overlay a generic flight path on the map

//////////////////////////////////////////////////

// HELPER FUNCTIONS //
// Generate geoJSON data for each destination feature
function generateDestination(info) {
    return {
        type: "Feature",
        properties: {
            "name": info["name"],
            "destination": info["destination"],
            "description": info["description"],
            "marker-color": info["marker-color"],
            "selected-color": info["selected-color"],
            "selected": info["selected"],
            "marker-size": info["marker-size"]
        },
        geometry: {
            type: "Point",
            coordinates: [info["longitude"],info["latitude"]]
        }
    }
}

function generateDrone(info) {
    return {
        type: "Feature",
        properties: {
            "name": info["name"],
            "marker-color": "#39bacf",
            "marker-size": "medium",
            "marker-symbol": "rocket",
            // TODO: get this working with custom icons
            // icon: {
            //     iconUrl: info["iconUrl"],
            //     iconSize: info["iconSize"],
            //     iconAnchor: info["iconAnchor"]
            // }
        },
        geometry: {
            type: "Point",
            coordinates: [info["longitude"],info["latitude"]]
        }
    }
}