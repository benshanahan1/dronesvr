// lunadrop: Global Variables and Function Definitions
// Benjamin Shanahan & Isaiah Brand, 2017.

///////////////////////////////////////////////////////////////////////////////
// GENERAL                                                                   //
///////////////////////////////////////////////////////////////////////////////

function toggleDiv(id) {
    $("#"+id).toggle('fast');
}

// Capitalize first letter of a string
function upperFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Set text / html given element ID
function set(id,text) {    
    $(id).text(text);
}

// Enable / disable element matching ID
function enable(id) {
    $(id).attr("disabled",false);
    $(id).removeClass("disabled");
    // console.log("Enable: "+id);
}

function disable(id) {
    $(id).attr("disabled",true);
    $(id).addClass("disabled");
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

///////////////////////////////////////////////////////////////////////////////
// GOOGLE OAUTH                                                              //
///////////////////////////////////////////////////////////////////////////////

function onLoad() {
    gapi.load('auth2', function() {
        var auth2 = gapi.auth2.init();
    });
}

function onSignIn(googleUser) {
    // get user's ID token
    var id_token = googleUser.getAuthResponse().id_token;
    // send ID token to server for verification
    var xhr = new XMLHttpRequest();
    xhr.open('POST','login');
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.onload = function() {
        console.log('Signed in as: ' + xhr.responseText);
        window.location.replace("/");  // redirect user to web app
    };
    xhr.send('token=' + id_token);
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        window.location.replace("logout");  // server-side log-out
    });
}

///////////////////////////////////////////////////////////////////////////////
// FRONT-END DATABASE INTERACTION                                            //
///////////////////////////////////////////////////////////////////////////////

// Set drone command
function setCommand(uid,cmd,callback) {
    $.post("/set_command",{drone_uid: uid, command: cmd})
        .done(callback);
}

// Click handler
// id: button ID, uid: database UID, cmd: command for drone, 
// callback: refresh function name, disableOnClick: disable button after click
function setCommandOnClick(id,uid,cmd,callback,disableOnClick=true) {
    setCommand(uid,cmd,callback);
    if (disableOnClick) {
        disable(id);
    }
}