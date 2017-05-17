// lunadrop: Real-time Web Interface for Drone Management
// Benjamin Shanahan & Isaiah Brand, 2017.

///////////////////////////////////////////////////////////////////////////////
// DEFAULT VALUES                                                            //
///////////////////////////////////////////////////////////////////////////////

var uids = [];
var rtlPressed = false;

///////////////////////////////////////////////////////////////////////////////
// INTERACTIVITY                                                             //
///////////////////////////////////////////////////////////////////////////////

// Button click handlers
function onRTLClick(id,uid) {
    if (!rtlPressed) {
        // set(id,"Are you sure?");  // TODO: fix this, it isn't working
        rtlPressed = true;
    } else {
        set(id,"RTL");
        setCommand(uid,'rtl',refreshDroneConsole);
    }
}

// Enable / disable buttons on page
function updateDroneConsoleButtons(uid,sts) {
    // Define button IDs
    var advancemission = "#"+uid+"-button-advancemission"
    var start = "#"+uid+"-button-start";
    var takeoff = "#"+uid+"-button-takeoff";
    var rtl = "#"+uid+"-button-rtl";
    var confirmhublanding = "#"+uid+"-button-confirmhublanding";
    // Interpret command and status
    if (sts == "idle") {
        enable(advancemission);
        enable(start);
        disable(takeoff);
        disable(rtl);
        disable(confirmhublanding);
    } else if (sts == "rtl") {
        rtlPressed = true;
        setDangerMode(rtl);
        disable(advancemission);
        disable(start);
        disable(takeoff);
        disable(rtl);
        disable(confirmhublanding);
    } else if (sts == "wait_arm") {
        disable(advancemission);
        disable(start);
        enable(takeoff);
        enable(rtl);
        disable(confirmhublanding);
    } else if (sts == "flying" || sts == "pause") {
        disable(advancemission);
        disable(start);
        disable(takeoff);
        enable(rtl);
        disable(confirmhublanding);
    } else if (sts == "wait_land_hub") {
        disable(advancemission);
        disable(start);
        disable(takeoff);
        enable(rtl);
        enable(confirmhublanding);
    } else {  // includes landing, pause, wait_land, prearm, takeoff, missionstart
        disable(advancemission);
        disable(start);
        disable(takeoff);
        enable(rtl);
        disable(confirmhublanding);
    }
    // Change RTL button accordingly
    if (rtlPressed) {
        setDangerMode(rtl);
    } else {
        unsetDangerMode(rtl);
    }
}

///////////////////////////////////////////////////////////////////////////////
// DATABASE INTERACTION                                                      //
///////////////////////////////////////////////////////////////////////////////

// Document load configuration
$(document).ready(function() {
    // get a list of drone UIDs from the API
    $.get("/api")
        .done(function(result) {
            uids = result.uids;
            refreshDroneConsole();  // update active fields on page
            setInterval(refreshDroneConsole, 500);  // set recurring refreshes
        });
});

// Database interfacing
function refreshDroneConsole() {
    for (var i = 0; i < uids.length; i++) {
        var uid = uids[i];
        $.get("/api?drone_uid=" + uid + "&subset=state")
            .done(function(result) {
                $("#"+uid+"-command").text(result.command);
                $("#"+uid+"-status").text(result.status);
                $("#"+uid+"-contains").text(result.contains);
                $("#"+uid+"-activemission").text(result.activemission);
                $("#"+uid+"-error").text(result.error);
                updateDroneConsoleButtons(uid,result.status);
            });
    }
}