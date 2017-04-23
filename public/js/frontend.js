// Get page information
var username = $("#username").val();
var selectedDestination = "";
var selectedFlavor = "";

// Default colors
var unselectedColor = "#990000";
var selectedColor = "#0066ff";

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
var map = L.mapbox.map("map","mapbox.dark",{zoomControl: false}).setView([41.826192,-71.402693],16);

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

// Check that selectedFlavor and selectedDestination are valid
function verifySelections() {
    // Check that inputs are non-empty
    var non_empty = (selectedFlavor && selectedDestination);
    return non_empty;
}

// Push alert to notify user. TODO: make this less intrusive!
function firstNotify(msg) {
    $("#first-notification").html(msg).show("fast");
}
function secondNotify(msg) {
    $("#second-notification").html(msg).show("fast");
}
function hideNotification(num) {
    if (num == 1) {
        $("#first-notification").hide("fast");    
    } else if (num == 2) {
        $("#second-notification").hide("fast");
    }
}

// AJAX functionality to asynchronously add an order
function addOrder() {
    if (verifySelections()) {
        // alert("Your order has been placed!");
        $.post("/addorder", {flavor: selectedFlavor, destination: selectedDestination})
            .done(function(result) {
                var parsed = $.parseJSON(result);
                alert(parsed.message);
            });
    }
}

// Check that user has selected a flavor (and that form is not still set to empty)
function checkFlavorChoice() {
    var type = $("#flavor-select").val();
    if (type != "default") {
        selectedFlavor = type;
        showLocationSelectionScreen();
        var msg = "You've selected a <span class='bold'>" + type + "</span> donut. <a href='#' onclick='showFlavorSelectionScreen()'>Change</a>.";
        firstNotify(msg);
    }
}

// Show / hide location and flavor selection screens
function showLocationSelectionScreen() {
    $("#landing-page-overlay").hide("fast");
}
function showFlavorSelectionScreen() {
    $("#landing-page-overlay").show("fast");
    $("#first-notification").hide("fast");
}

// Display order button on screen
function showPlaceOrderButton() {
    $("#place-order-button").show("fast");
}