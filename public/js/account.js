var uids = [];
var delayPeriod = 200;  // in milliseconds
var rtlPressed = false;



// Document load configuration
$(document).ready(function() {
    // get a list of drone UIDs from the API
    $.get("/api")
        .done(function(result) {
            uids = result.uids;
            refresh();  // update active fields on page
            setInterval(refresh, delayPeriod);  // set recurring refreshes
        });
});



// Button click handlers
function onButtonClick(uid,cmd) {
    // Define button IDs
    var arm = "#"+uid+"-button-arm";
    var takeoff = "#"+uid+"-button-takeoff";
    var rtl = "#"+uid+"-button-rtl";
    // Interpret command
    if (cmd == "arm") {
        disable(arm);
        post(uid,cmd);
    } else if (cmd == "takeoff") {
        disable(takeoff);
        post(uid,cmd);
    } else if (cmd == "rtl") {
        if (!rtlPressed) {
            rtlPressed = true;
            setDangerMode(rtl);
            set(rtl,"Are you sure?");
        } else {
            disable(rtl);
            set(rtl,"RTL");
            post(uid,cmd);
        }
    }
}



// Helper classes to manage on-screen text and button manipulation
// Set text / html given element ID
function set(id,text,html=false) {
    if (html) {
        $(id).html(text);
    } else {
        $(id).text(text);
    }
}
// Enable / disable element matching ID
function enable(id) {
    $(id).attr("disabled",false);
    // console.log("Enable: "+id);
}
function disable(id) {
    $(id).attr("disabled",true);
    // console.log("Disable: "+id);
}
function setDangerMode(id) {
    $(id).addClass("danger danger-background");
    // console.log("Set Danger Mode: "+id);
}
function unsetDangerMode(id) {
    $(id).removeClass("danger danger-background");
    // console.log("Unset Danger Mode: "+id);
}
function setButtonsFromCommandStatus(uid,cmd,sts) {
    // Define button IDs
    var arm = "#"+uid+"-button-arm";
    var takeoff = "#"+uid+"-button-takeoff";
    var rtl = "#"+uid+"-button-rtl";
    // Interpret command and status
    // TODO: modify these to match commands / statuses from 
    //       dronemgr and droneberry
    if (cmd == "rtl") {
        rtlPressed = false;  // reset it for later
        setDangerMode(rtl);
        disable(arm);
        disable(takeoff);
        disable(rtl);
    }
    if (cmd == "wait_arm") {
        unsetDangerMode(rtl);
        enable(arm);
        disable(takeoff);
        disable(rtl);
    }
    if (cmd == "wait_takeoff") {
        unsetDangerMode(rtl);
        disable(arm);
        enable(takeoff);
        disable(rtl);
    }
    if (cmd == "flying") {
        if (!rtlPressed) {
            unsetDangerMode(rtl);
        }
        disable(arm);
        disable(takeoff);
        enable(rtl);
    }
}



// Database interfacing
function refresh() {
    for (var i = 0; i < uids.length; i++) {
        var uid = uids[i];
        $.get("/api?drone_uid=" + uid + "&subset=state")
            .done(function(result) {
                $("#"+uid+"-command").text(result.command);
                $("#"+uid+"-status").text(result.status);
                $("#"+uid+"-contains").text(result.contains);
                $("#"+uid+"-activemission").text(result.activemission);
                $("#"+uid+"-error").text(result.error);
                setButtonsFromCommandStatus(uid,result.command,result.status);
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
