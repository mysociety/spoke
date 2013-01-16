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

    // Add an init action to spoke
    _.extend(SPOKE, {
        initialise: function () {
            // Everything is ready now
            console.log('Initialising the SPOKE app');

            // Initialise the app object
            _.extend(SPOKE, {
                router: new SPOKE.AppRouter(),
                recordings: new SPOKE.RecordingsCollection(),
                speakers: new SPOKE.SpeakersCollection()
            });

            // Extend SPOKE with Backbone event handling, so we can register
            // app-wide events
            _.extend(SPOKE, Backbone.Events);

            // Work out while filename extension to use
            SPOKE.config.audioFilenameExtension = (device.platform.match(/(iPhone|iPod|iPad)/)) ? '.wav' : '.3gp';

            // Bind events for the whole app

            // App resume events
            $(document).on('resume', function() {
                SPOKE.speakers.fetch();
                SPOKE.recordings.fetch();
            });

            // Fetch initial data
            SPOKE.speakers.fetch();
            SPOKE.recordings.fetch();

            // Start routing
            Backbone.history.start();
        },

        destroy: function() {
            // Undo all the stuff we did in initialise
            // Only useful in unit testing
            console.log('Destroying the SPOKE app');

            delete SPOKE.router;
            delete SPOKE.recordings;
            delete SPOKE.speakers;
            delete SPOKE.config.audioFilenameExtension;

            // Stop the history
            Backbone.history.stop();
        }
    });

    $.when(jqmReady, pgReady, firstPageReady).then(function () {
        console.log("All three init events have happened");
        SPOKE.initialise();
    });

})(SPOKE, Backbone, _, $);