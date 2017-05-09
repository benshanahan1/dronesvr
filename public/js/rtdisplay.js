// Real-time display table on Admin page of Server site
//
// 22 January 2017, Benjamin Shanahan.

// Trigger update and then setTimeout for repeated updates
var updateInterval = 5000;
var trimLen = 8;  // length to trim displayed string
var fields = ["name","latitude","longitude","altitude","voltage",
              "speed","rssi","destination","timestamp"];

// set next update
setTimeout(update, updateInterval); 

// Update display table
function update() {

    // check number of current UIDs and if it has changed, refresh page 
    $.get(api, function(data) {
        currentUIDs = data.uids;
        if (currentUIDs.length != nUIDs) {
            location.reload();
        }
    }, "json");

    // loop through all UIDs (in uids array) in table and update entries with GET values
    for (var i=0; i < nUIDs; i++) {
        // GET, pass UID as payload
        $.get(api, {uid:uids[i]}).done(function(data) {
            nKeys = Object.keys(data).length;
            for (var j=0; j < nKeys; j++) {
                f = fields[j];
                d = data[f];
                if (d != null) {
                    id = "#" + data.uid + "-" + f;
                    if (f == "destination") {
                        d = d["uid"];
                    } else {
                        if (f == "timestamp") {  // trim timestamp differently
                            d = d.substring(11,22);
                        } else {
                            d = d.substring(0,trimLen);
                        }
                    }
                    $(id).text(d);
                }
                
            }
        });
    }
}