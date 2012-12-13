(function () {
    var scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
	scriptElement.src = 'cordova-2.2.0-ios.js';
    } else if (navigator.userAgent.match(/Android/)) {
	scriptElement.src = 'cordova-2.2.0-android.js';
    } else {
        alert("Unknown platform - userAgent is: " + navigator.userAgent);
    }
    $('head').prepend(scriptElement);
})();