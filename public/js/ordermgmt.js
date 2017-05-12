var delayPeriod = 5000;  // in milliseconds
var order_uids = [];

// Document load configuration
$(document).ready(function() {
    // get a list of order UIDs
    $.get("/get_order_uids")
        .done(function(result) {
            result = $.parseJSON(result);
            order_uids = result.order_uids;
            refreshOrderConsole();  // update active fields on page
            setInterval(refreshOrderConsole, delayPeriod);  // set recurring refreshes
        });
});

// Database interfacing
function refreshOrderConsole() {
    for (var i = 0; i < order_uids.length; i++) {
        var order_uid = order_uids[i];
        $.get("/api?order_uid=" + order_uid)
            .done(function(result) {
                $("#"+order_uid+"-arrivaltime-header").text(result.arrivaltime);
                $("#"+order_uid+"-contains").text(result.contains);
                $("#"+order_uid+"-destination").text(result.destination);
                $("#"+order_uid+"-arrivaltime").text(result.arrivaltime);
                $("#"+order_uid+"-departuretime").text(result.departuretime);
            });
    }
}