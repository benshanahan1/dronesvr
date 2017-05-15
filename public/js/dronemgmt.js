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
        rtlPressed = true;
        setDangerMode(id);
        set(id,"Are you sure?");
    } else {
        // disable(id);  // TODO: reenable
        set(id,"RTL");
        set_command(uid,'rtl',refreshDroneConsole);
        rtlPressed = false;  // TODO: remove
        unsetDangerMode(id);  // TODO: remove
    }
}

// Enable / disable buttons on page
function updateDroneConsoleButtons(uid,sts) {
    // Define button IDs
    var advancemission = "#"+uid+"-button-advancemission"
    var start = "#"+uid+"-button-start";
    var takeoff = "#"+uid+"-button-takeoff";
    var rtl = "#"+uid+"-button-rtl";
    // Interpret command and status
    if (sts == "idle") {
        rtlPressed = false;
        unsetDangerMode(rtl);
        enable(advancemission);
        enable(start);
        disable(takeoff);
        disable(rtl);
    }
    if (sts == "rtl") {
        rtlPressed = false;  // reset it for later
        setDangerMode(rtl);
        disable(advancemission);
        disable(start);
        disable(takeoff);
        disable(rtl);
    }
    if (sts == "wait_arm") {
        unsetDangerMode(rtl);
        disable(advancemission);
        disable(start);
        enable(takeoff);
        enable(rtl);
    }
    if (sts == "flying" || sts == "pause") {
        if (!rtlPressed) {
            unsetDangerMode(rtl);
        }
        disable(advancemission);
        disable(start);
        disable(takeoff);
        enable(rtl);
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
                // TODO: enable
                // updateDroneConsoleButtons(uid,result.status);
            });
    }
}