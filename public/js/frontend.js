// Get page information
var username = $("#username").val();

//////////////////////////////////////////////////

// Define feature markers (TODO: put this in a separate text file?!)
info = {
    // "hub": {
    //     "name": "Central Hub",
    //     "description": "Loading hub for the drones",
    //     "latitude": 41.826904,
    //     "longitude": -71.401563,
    //     "marker-color": "#17452d",
    //     "marker-size": "small"
    // },
    "ruthsimmons": {
        "name": "Ruth Simmons",
        "destination": "ruthsimmons",
        "description": "Ruth Simmon's delivery",
        "latitude": 41.826316,
        "longitude": -71.401063,
        "marker-color": "#990000",
        "marker-size": "small"
    },
    "quietgreen": {
        "name": "Quiet Green",
        "destination": "quietgreen",
        "description": "Quiet Green delivery",
        "latitude": 41.826168,
        "longitude": -71.404168,
        "marker-color": "#990000",
        "marker-size": "small"
    },
    "maingreen": {
        "name": "Main Green",
        "destination": "maingreen",
        "description": "Main Green delivery",
        "latitude": 41.826028,
        "longitude": -71.403429,
        "marker-color": "#990000",
        "marker-size": "small"
    }
}

// Define geoJSON information for map
geoJson = {
    type: 'FeatureCollection',
    features: [
        generateFeature(info["ruthsimmons"]),
        generateFeature(info["maingreen"]),
        generateFeature(info["quietgreen"])
        // generateFeature(info["hub"])
    ]
}

// Define map
L.mapbox.accessToken = 'pk.eyJ1IjoiaXp6eWJyYW5kIiwiYSI6ImNpeTdzdHh3ZDAwNncycXN4eTYyY2k3dTAifQ.WzrAcd4xaQ0dd7ur3u0fSQ';
var map = L.mapbox.map("map","mapbox.streets").setView([41.826192,-71.402693],16);

// Define map layer
var myLayer = L.mapbox.featureLayer().addTo(map);
myLayer.setGeoJSON(geoJson);
myLayer.eachLayer(function(layer) {
    var content = formatContent(layer.feature.properties);
    layer.bindPopup(content);
});


//////////////////////////////////////////////////

// HELPER FUNCTIONS //
function generateFeature(info) {
    return {
        type: "Feature",
        properties: {
            "name": info["name"],
            "destination": info["destination"],
            "description": info["description"],
            "marker-color": info["marker-color"],
            "marker-size": info["marker-size"]
        },
        geometry: {
            type: "Point",
            coordinates: [info["longitude"],info["latitude"]]
        }
    }
}

function formatContent(properties) {
    if (username) {
        return ' \
            <h3 class="popup-title">' + properties.name + '<\/h3> \
            <input type="hidden" id="destination" value="' + properties.destination + '" \
            <div> \
                <label class="control-label" for="selectbasic">Choose Donut Type:<\/label> \
                <select id="flavor" class="form-control"> \
                  <option value="chocolate">Chocolate<\/option> \
                  <option value="glazed">Glazed<\/option> \
                  <option value="jelly">Jelly<\/option> \
                <\/select> \
            <\/div> \
            <div> \
                <label class="col-md-6 control-label" for="addjob"><\/label> \
                <button class="btn btn-primary deliver-button" id="deliverbtn">Deliver!<\/button> \
            <\/div>';
    } else {
        return '<h3>' + properties.name + '<\/h3> \
            <p>To order, please <a href="auth">sign in<\/a><\/p>';
    }


}

// Push alert to notify user. TODO: make this less intrusive!
function notifyUser(message) {
    $("#message").text(message).show("fast");
}

// Add AJAX functionality to deliver button
setInterval(activateButtons,500);  // TODO: fix this. THIS IS A HACK
// TODO: fix this interface: it submits 3x because there are duplicate id's on the page.
// more ideally: there is one interface that populates when user clicks a destination zone
// this pops up on the side of the web page or something
// they then select a donut flavor and press Go.
// If they've already ordered a donut, the site knows and prevents them from clicking on the locations
// also, if they have a pending order, the site shows a moving icon with a drone and a time estimate (maybe attached to the drone)
function activateButtons() {
    $("#deliverbtn").click(function(event) {
        $.ajax({type: "POST",
            url: "addjob",
            data: {
                flavor: $("#flavor").val(),
                destination: $("#destination").val()
            },
            success: function(result) {
                message = $.parseJSON(result);
                notifyUser(message["message"]);
            }
        });
    });
}