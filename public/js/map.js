// lunadrop Mapbox.js include

// Default colors
var unselectedColor = "#666666";
var selectedColor = "#39bafc";

// Define feature markers (TODO: put this in a separate text file?!)
var info = {
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
}

// Define full geoJson structure
var geoJson = {
    type: "FeatureCollection",
    features: [
        generateFeature(info["ruthsimmons"]),
        generateFeature(info["maingreen"]),
        generateFeature(info["quietgreen"])
    ]
}

// Define map
L.mapbox.accessToken = 'pk.eyJ1IjoiaXp6eWJyYW5kIiwiYSI6ImNpeTdzdHh3ZDAwNncycXN4eTYyY2k3dTAifQ.WzrAcd4xaQ0dd7ur3u0fSQ';
var map = L.mapbox.map("map","mapbox.light",{zoomControl: false}).setView([41.826192,-71.402693],16);

// Define map layer
var myLayer = L.mapbox.featureLayer().addTo(map);
myLayer.setGeoJSON(geoJson);

// Define event listeners for interactivity
myLayer.on("click",function(e) {
    if (!e.layer.feature.properties["selected"]) {
        resetColors();
        e.layer.feature.properties["marker-color"] = selectedColor;
        e.layer.feature.properties["selected"] = true;
        var fullName = e.layer.feature.properties["name"];
        selectedDestination = e.layer.feature.properties["destination"];
        var msg = "Delivery at <span class='bold'>" + fullName + "</span>.";
        secondNotify(msg);
        showPlaceOrderButton();
    }
    myLayer.setGeoJSON(geoJson);
});

//////////////////////////////////////////////////

// HELPER FUNCTIONS //
// Generate geoJSON data for each destination feature
function generateFeature(info) {
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

// Reset color of all markers in geoJson structure
function resetColors() {
    for (var i = 0; i < geoJson.features.length; i++) {
        geoJson.features[i].properties["marker-color"] = unselectedColor;
        geoJson.features[i].properties["selected"] = false;
    }
    myLayer.setGeoJSON(geoJson);
}