// Configure jQuery Mobile when it is ready
;(function($) {

	$(document).on('mobileinit', function(){
        // Setup some jquery mobile defaults
        $.mobile.allowCrossDomains = true;
        $.mobile.pushStateEnabled = false;
        $.mobile.defaultPageTransition = "none";
        $.mobile.buttonMarkup.hoverDelay = 0;
    });
    
})($);