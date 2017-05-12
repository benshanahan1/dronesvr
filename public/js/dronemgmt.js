var uids = [];
var delayPeriod = 400;  // in milliseconds
var rtlPressed = false;



// Document load configuration
$(document).ready(function() {
    // get a list of drone UIDs from the API
    $.get("/api")
        .done(function(result) {
            uids = result.uids;
            refreshDroneConsole();  // update active fields on page
            setInterval(refreshDroneConsole, delayPeriod);  // set recurring refreshes
        });
});



// Button click handlers
function onButtonClick(uid,cmd) {
    // Define button IDs
    var advancemission = "#"+uid+"-button-advancemission";
    var start = "#"+uid+"-button-start";
    var takeoff = "#"+uid+"-button-takeoff";
    var rtl = "#"+uid+"-button-rtl";
    // Interpret command
    if (cmd == "advancemission") {
        // disable(advancemission);  // TODO: reenable
        post(uid,cmd);
    } else if (cmd == "start") {
        // disable(start);  // TODO: reenable
        post(uid,cmd);
    } else if (cmd == "takeoff") {
        // disable(takeoff);  // TODO: reenable
        post(uid,cmd);
    } else if (cmd == "rtl") {
        if (!rtlPressed) {
            rtlPressed = true;
            setDangerMode(rtl);
            set(rtl,"Are you sure?");
        } else {
            // disable(rtl);  // TODO: reenable
            set(rtl,"RTL");
            post(uid,cmd);
            unsetDangerMode(rtl);  // TODO: remove
        }
    }
}
// function onDivClick(uid) {
//     // TODO: fix this; it doesn't work due to event bubbling
//     // use this to disable RTL button if user clicks out of focus
//     rtlPressed = false;
//     unsetDangerMode("#"+uid+"-button-rtl");
// }



function setButtonsFromCommandStatus(uid,cmd,sts) {
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
                // setButtonsFromCommandStatus(uid,result.command,result.status);
            });
    }
}
function post(uid,cmd) {
    $.post("/set_command",{drone_uid: uid, command: cmd})
        .done(function(result) {
            console.log("JSON response: " + result);
            refresh();  // update display
            return result;
        });
}
