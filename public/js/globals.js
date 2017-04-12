// Global variable and function definitions

var api = "http://localhost/api";

function ToggleDiv(id) {
    $("#"+id).toggle('fast');
}

// Capitalize first letter of a string
function UpperFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}