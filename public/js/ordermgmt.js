// lunadrop: Real-time Web Interface for Order Management 
// Benjamin Shanahan & Isaiah Brand, 2017.

///////////////////////////////////////////////////////////////////////////////
// DEFAULT VALUES                                                            //
///////////////////////////////////////////////////////////////////////////////

var order_uids = [];
var drone_uid = [];

///////////////////////////////////////////////////////////////////////////////
// INTERACTIVITY                                                             //
///////////////////////////////////////////////////////////////////////////////

// Handle confirm landing button click
function onConfirmLandingClick(id,order_uid) {
    setCommand(drone_uid,"land");
}

function updateOrderConsoleButtons(order_uid,cmd,sts) {
    // Define button IDs
    var confirmlanding = "#"+order_uid+"-button-confirmlanding"
    // Interpret command and status
    if (sts == "wait_land" && cmd != "land") {
        enable(confirmlanding);
    } else {
        disable(confirmlanding);
    }
}

///////////////////////////////////////////////////////////////////////////////
// DATABASE INTERACTION                                                      //
///////////////////////////////////////////////////////////////////////////////

// Document load configuration
$(document).ready(function() {
    // get a list of order UIDs
    $.get("/get_order_uids")
        .done(function(result) {
            result = $.parseJSON(result);
            order_uids = result.order_uids;
            refreshOrderConsole();  // update active fields on page
            setInterval(refreshOrderConsole, 500);  // set recurring refreshes in ms
        });
});

// Refresh user orders from database
function refreshOrderConsole() {
    for (var i = 0; i < order_uids.length; i++) {
        var order_uid = order_uids[i];
        $.get("/api?order_uid=" + order_uid)
            .done(function(result) {
                $("#"+order_uid+"-arrivaltime-header").text(result.arrivaltime);
                $("#"+order_uid+"-contains").text(result.contains);
                $("#"+order_uid+"-destination").text(result.destination);
                $("#"+order_uid+"-arrivaltime").text(result.arrivaltime);
                $("#"+order_uid+"-departuretime").text(result.departuretime);
                drone_uid = result.drone_uid;  // save drone_uid
                updateOrderConsoleButtons(order_uid,result.command,result.status);
            });
    }
}