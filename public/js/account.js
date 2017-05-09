var uids = [];
var delayPeriod = 200;  // in milliseconds

$(document).ready(function() {
    // get a list of drone UIDs from the API
    $.get("/api")
        .done(function(result) {
            uids = result.uids;
            refresh();  // update active fields on page
            setInterval(refresh, delayPeriod);  // set recurring refreshes
        });
});

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
            });
    }
}

// TODO: enable buttons