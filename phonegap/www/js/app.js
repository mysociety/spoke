/**
 * Spoke javascript main setup
 */
;(function (SPOKE, Backbone, _, $) {

    var pgReady = $.Deferred(),
        jqmReady = $.Deferred(),
        firstPageReady = $.Deferred();

    // Phonegap is ready
    document.addEventListener('deviceready', pgReady.resolve, false);

    // jQuery Mobile is ready
    $(document).on('mobileinit', jqmReady.resolve);

    // The first page ever loaded is ready
    $(document).one('pageinit', function(event) {
        firstPageReady.resolve();
    });

    $.when(jqmReady, pgReady, firstPageReady).then(function() {

        // Everything is ready now
    	console.log('Initialising the SPOKE app');

        console.log('Device platform is: ' + device.platform);

        _.extend(SPOKE, {
            app: new SPOKE.AppRouter()
        });

        Backbone.history.start();
        
    });

})(SPOKE, Backbone, _, $);