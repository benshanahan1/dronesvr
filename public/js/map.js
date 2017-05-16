// lunadrop: Mapbox.js wrapper
// Benjamin Shanahan & Isaiah Brand, 2017.

///////////////////////////////////////////////////////////////////////////////
// DEFAULT VALUES                                                            //
///////////////////////////////////////////////////////////////////////////////

// Map default values
var unselectedColor = "#666666";
var selectedColor = "#39bafc";
var markerSize = "small";
var droneIconSize = [30,30];
var droneIconAnchor = [15,15];

// Define feature markers
// TODO: this information should be pulled from database
var destinationInfo = {
    "ruthsimmons": {
        "name": "Ruth Simmons",
        "destination": "ruthsimmons",
        "description": "Ruth Simmon's delivery",
        "latitude": 41.826316,
        "longitude": -71.401063
    },
    "quietgreen": {
        "name": "Quiet Green",
        "destination": "quietgreen",
        "description": "Quiet Green delivery",
        "latitude": 41.826168,
        "longitude": -71.404168
    },
    "maingreen": {
        "name": "Main Green",
        "destination": "maingreen",
        "description": "Main Green delivery",
        "latitude": 41.826028,
        "longitude": -71.403429
    }
};

var droneInfo = {
    "luna": {
        "name": "luna",
        "uid": "luna",
        "iconUrl": "/static/img/frontend/luna.png"
    }
};

///////////////////////////////////////////////////////////////////////////////
// CONFIGURE MAPBOX.JS MAP                                                   //
///////////////////////////////////////////////////////////////////////////////

// Define GeoJSON structures
var destinations = [
    generateDestination(destinationInfo["ruthsimmons"]),
    generateDestination(destinationInfo["maingreen"]),
    generateDestination(destinationInfo["quietgreen"])
];
var drones = [
    generateDrone(droneInfo["luna"])
];

// Authenticate with Mapbox.js API and instantiate map
L.mapbox.accessToken = 'pk.eyJ1IjoiaXp6eWJyYW5kIiwiYSI6ImNpeTdzdHh3ZDAwNncycXN4eTYyY2k3dTAifQ.WzrAcd4xaQ0dd7ur3u0fSQ';
var map = L.mapbox.map("map","mapbox.light",{zoomControl: false}).setView([41.826192,-71.402693],17);

// Add drone and destination layers to map
var destinationLayer = L.mapbox.featureLayer().addTo(map);
var droneLayer = L.mapbox.featureLayer().addTo(map);
var flightPathLayer = L.mapbox.featureLayer().addTo(map);
destinationLayer.setGeoJSON(destinations);
droneLayer.setGeoJSON(drones);

// TODO: Add flight paths to flightPathLayer

///////////////////////////////////////////////////////////////////////////////
// CONTROL REALTIME DRONE MARKER MOVEMENT                                    //
///////////////////////////////////////////////////////////////////////////////
// Start movement, set update interval
updateDronePosition();
setInterval(updateDronePosition, 1000);  // drone position update frequency

// Retrieve drone position data from backend
function updateDronePosition() {
    for (d = 0; d < drones.length; d++) {
        var uid = drones[d].properties.uid;
        var idx = d;
        $.get("/api?drone_uid=" + uid + "&subset=position")
            .done(function(result){
                drones[idx].geometry.coordinates = [result.longitude, result.latitude],
                drones[idx].geometry.altitude = result.altitude,
                drones[idx].geometry.speed = result.speed,
                droneLayer.setGeoJSON(drones)  // update drone markers
            });
    }
}

///////////////////////////////////////////////////////////////////////////////
// GENERATE GEOJSON DATA FOR FEATURES                                        //
///////////////////////////////////////////////////////////////////////////////
function generateDestination(info) {
    return {
        type: "Feature",
        properties: {
            "name": info["name"],
            "destination": info["destination"],
            "description": info["description"],
            "marker-color": unselectedColor,
            "selected-color": selectedColor,
            "selected": false,
            "marker-size": markerSize
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
            "uid": info["uid"],
            "marker-color": "#990000",
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
            coordinates: [0,0],
            altitude: 0,
            speed: 0
        }
    }
}