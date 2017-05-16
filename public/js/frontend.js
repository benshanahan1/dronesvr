// lunadrop: JavaScript frontend
// Must be loaded after map.js
// Benjamin Shanahan & Isaiah Brand, 2017.

///////////////////////////////////////////////////////////////////////////////
// DEFAULT VALUES                                                            //
///////////////////////////////////////////////////////////////////////////////

// Get page information
var username = $("#username").val();
var selectedDestination = "";
var selectedFlavor = "";

///////////////////////////////////////////////////////////////////////////////
// INTERACTIVITY                                                             //
///////////////////////////////////////////////////////////////////////////////

// Define event listeners for interactivity
destinationLayer.on("click",function(e) {
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
    destinationLayer.setGeoJSON(destinations);
});

///////////////////////////////////////////////////////////////////////////////
// ERROR CHECKING                                                            //
///////////////////////////////////////////////////////////////////////////////

// Check that selectedFlavor and selectedDestination are valid
function verifySelections() {
    // Check that inputs are non-empty
    var non_empty = (selectedFlavor && selectedDestination);
    return non_empty;
}

// Check that user has selected a flavor (and that form is not still set to empty)
function checkFlavorChoice() {
    var type = $("#flavor-select").val();
    if (type != "default") {
        selectedFlavor = type;
        showLocationSelectionScreen();
        var msg = "You've selected a <span class='bold'><a href='#' onclick='showFlavorSelectionScreen()'>" + type + "</a></span> donut.";
        firstNotify(msg);
    }
}

///////////////////////////////////////////////////////////////////////////////
// ON-SCREEN UPDATES AND NOTIFICATIONS                                       //
///////////////////////////////////////////////////////////////////////////////

// Push alert to notify user. TODO: refine this
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
    $("#place-order").show("fast");
}

// Reset color of all markers in Mapbox.js GeoJSON structure
function resetColors() {
    for (var i = 0; i < destinations.length; i++) {
        destinations[i].properties["marker-color"] = unselectedColor;
        destinations[i].properties["selected"] = false;
    }
    destinationLayer.setGeoJSON(destinations);
}

///////////////////////////////////////////////////////////////////////////////
// DATABASE INTERACTION                                                      //
///////////////////////////////////////////////////////////////////////////////

// AJAX functionality to asynchronously add an order
function addOrder() {
    if (verifySelections()) {
        $.post("/addorder", {contains: selectedFlavor, destination: selectedDestination})
            .done(function(result) {
                var parsed = $.parseJSON(result);
                if (parsed.success) {
                    window.location = "/account";
                } else {
                    alert(parsed.message);
                }
            });
    }
}