// Event listeners
$(document).ready(function() {
    $("#arm-switch").change(armHandler);
    $("#motor-switch").change(motorHandler);
    $("#gripper-switch").change(gripperHandler);
    disableSwitch("#motor-switch");
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
    // TODO: send AJAX command to API, on success, enable switches on page
    enableSwitch("#motor-switch");  // this should be called on AJAX success
}
function disarm() {
    console.log("Disarming.");
    // TODO: send AJAX command to API, on success, disable switches on page
    motorsOff(true);
    disableSwitch("#motor-switch");  // called on AJAX success
}

// Motor switch
function motorHandler() {
    var checked = $("#motor-switch").prop("checked");
    if (checked) {
        motorsOn();
    } else {
        motorsOff();
    }
}
function motorsOn(remote) {
    console.log("Motors spinning up.");
    // TODO: AJAX
    if (remote) {
        $('#motor-switch').prop("checked",true).change();
    }
}
function motorsOff(remote) {
    console.log("Motors spinning down.");
    // TODO: AJAX
    if (remote) {
        $('#motor-switch').prop("checked",false).change();
    }
}

// Gripper switch
function gripperHandler() {
    var checked = $("#gripper-switch").prop("checked");
    if (checked) {
        gripperOpen();
    } else {
        gripperClose();
    }
}
function gripperOpen(remote) {
    console.log("Gripper opening.");
    // TODO: AJAX
    if (remote) {
        $('#gripper-switch').prop("checked",true).change();
    }
}
function gripperClose(remote) {
    console.log("Gripper closing.");
    // TODO: AJAX
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