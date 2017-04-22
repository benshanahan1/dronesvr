var droneUID = "luna";  // Luna UID
var remote = false;  // remote control switch



// Event listeners
$(document).ready(function() {
    $("#arm-switch").change(armHandler);
    $("#motor-switch").change(motorHandler);
    $("#gripper-switch").change(gripperHandler);
    disableSwitch("#motor-switch");
    updateCommand();
});



// Arm/disarm switch
function armHandler() {
    var checked = $("#arm-switch").prop("checked");
    if (checked) {
        arm();
    } else {
        disarm();
    }
}
function arm() {
    console.log("Arming.");
    post("arm");
    enableSwitch("#motor-switch");  // this should be called on AJAX success
}
function disarm() {
    console.log("Disarming.");
    post("disarm");
    var checked = $("#motor-switch").prop("checked");
    if (checked) {
        remote = true;
        motorsOff();
        remote = false;
    }
    disableSwitch("#motor-switch");  // called on AJAX success
}



// Motor switch
function motorHandler() {
    if (!remote) {
        var checked = $("#motor-switch").prop("checked");
        if (checked) {
            motorsOn();
        } else {
            motorsOff();
        }
    }
}
function motorsOn() {
    console.log("Motors spinning up.");
    post("motorsOn");
    if (remote) {
        $('#motor-switch').prop("checked",true).change();
    }
}
function motorsOff() {
    console.log("Motors spinning down.");
    post("motorsOff");
    if (remote) {
        $('#motor-switch').prop("checked",false).change();
    }
}



// Gripper switch
function gripperHandler() {
    var checked = $("#gripper-switch").prop("checked");
    if (checked) {
        gripperClose();
    } else {
        gripperOpen();
    }
}
function gripperOpen() {
    console.log("Gripper opening.");
    post("gripperOpen");
    if (remote) {
        $('#gripper-switch').prop("checked",true).change();
    }
}
function gripperClose() {
    console.log("Gripper closing.");
    post("gripperClose");
    if (remote) {
        $('#gripper-switch').prop("checked",false).change();
    }
}



// Toggle page switches
function enableSwitch(id) {
    $(id).prop("disabled",false);
}
function disableSwitch(id) {
    $(id).prop("disabled",true);
}



// Update current drone command from server
function updateCommand() {
    $.get("/api?uid=" + droneUID)
        .done(function(result) {
            $("#current-command").text(result.command);
        });
    // setInterval(updateCommand,5000);  // queue next update
}
function post(cmd) {
    $.post("/demo",{command: cmd})
        .done(function(result) {
            console.log("JSON response: " + result);
            updateCommand();  // update display
            return result;
        });
}