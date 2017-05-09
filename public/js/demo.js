var droneUID = "luna";  // Luna UID
var remote = false;  // remote control switch



// Event listeners
$(document).ready(function() {
    disableSwitch("#motor-switch");
    refresh();
    delayPeriod = 200;
    setInterval(refresh,delayPeriod);
});
function armListener() {
    var armSwitch = $("#arm-switch").prop("checked");
    if (!armSwitch) {
        arm();
    } else {
        disarm();
    }
}
function motorListener() {
    var motorSwitch = $("#motor-switch").prop("checked");
    if (!motorSwitch) {
        motorsOn();
    } else {
        motorsOff();
    }
}
function gripperListener() {
    var gripperSwitch = $("#gripper-switch").prop("checked");
    if (gripperSwitch) {
        gripperClose();
    } else {
        gripperOpen();
    }
}



// Arm/disarm switch
function arm() {
    console.log("Arming.");
    post("arm");
    enableSwitch("#motor-switch");  // this should be called on AJAX success
}
function disarm() {
    console.log("Disarming.");
    post("disarm");
    remote = true;  // disable motorHandler
    switchOff("#motor-switch");
    disableSwitch("#motor-switch");
    remote = false;
}



// Motor switch
function motorsOn() {
    console.log("Motors spinning up.");
    post("motorsOn");
    if (remote) {
        switchOn("#motor-switch");
    }
}
function motorsOff() {
    console.log("Motors spinning down.");
    post("motorsOff");
    if (remote) {
        switchOff("#motor-switch");
    }
}



// Gripper switch
function gripperOpen() {
    console.log("Gripper opening.");
    post("gripperOpen");
    if (remote) {
        switchOn("#gripper-switch");
    }
}
function gripperClose() {
    console.log("Gripper closing.");
    post("gripperClose");
    if (remote) {
        switchOff("#gripper-switch");
    }
}



// Enable/disable page switches
function enableSwitch(id) {
    $(id).prop("disabled",false);
}
function disableSwitch(id) {
    $(id).prop("disabled",true);
}
// Toggle page switches on/off
function switchOn(id) {
    $(id).prop("checked",true).change();
}
function switchOff(id) {
    $(id).prop("checked",false).change();
}



// Pull from database and refresh switches and command
function refresh() {
    $.get("/api?drone_uid=" + droneUID + "&subset=state")
        .done(function(result) {
            // Available: result.command, result.voltage, result.status, result.error
            $("#current-command").text(result.command);
            var status = result.status;
            if (status == "disarmed") {
                switchOff("#arm-switch");
                switchOff("#motor-switch");
            } else if (status == "armed") {
                switchOn("#arm-switch");
                switchOff("#motor-switch");
            } else if (status == "throttled") {
                switchOn("#arm-switch");
                enableSwitch("#motor-switch");
                switchOn("#motor-switch");
            }
        });
}
function post(cmd) {
    $.post("/set_command",{drone_uid: "luna", command: cmd})
        .done(function(result) {
            console.log("JSON response: " + result);
            refresh();  // update display
            return result;
        });
}