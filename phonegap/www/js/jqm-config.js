// Configure jQuery Mobile when it is ready
;(function($) {

	$(document).on('mobileinit', function(){
        // Setup some jquery mobile defaults
        $.mobile.allowCrossDomains = true;
        $.mobile.pushStateEnabled = false;
        $.mobile.defaultPageTransition = 'none';
        $.mobile.buttonMarkup.hoverDelay = 0;

        // Do some tricksy things so that jQuery mobile and Backbone
        // play nicely (ie: jQM lets Backbone do the routing)
        $.mobile.hashListeningEnabled = false;

        // Remove page from DOM when it's being replaced, and unbind any events
        // TODO - There is probably a nicer way to do this now with
        // http://backbonejs.org/#Events-listenTo and http://backbonejs.org/#Events-stopListening
        $(document).on('pagehide', 'div[data-role="page"]', function (event, ui) {
            $(event.currentTarget).remove();
            $(event.currentTarget).unbind();
        });
    });
    
})($);