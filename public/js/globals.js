// Global variable and function definitions

// var api = "http://localhost/api";

function ToggleDiv(id) {
    $("#"+id).toggle('fast');
}

// Capitalize first letter of a string
function UpperFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Google API OAuth
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