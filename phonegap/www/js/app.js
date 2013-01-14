/**
 * Spoke javascript main setup
 */
;(function (SPOKE, Backbone, _, $) {

    var pgReady = $.Deferred(),
        jqmReady = $.Deferred(),
        firstPageReady = $.Deferred();

    // Phonegap is ready
    document.addEventListener('deviceready', pgReady.resolve, false);

    // For testing basics in a browser
    // if(!window.Device) {
    //     pgReady.resolve();
    // }

    // jQuery Mobile is ready
    $(document).on('mobileinit', jqmReady.resolve);

    // The first page ever loaded is ready
    $(document).one('pageinit', function(event) {
        firstPageReady.resolve();
    });

    $.when(jqmReady, pgReady, firstPageReady).then(function() {

        // Everything is ready now
    	console.log('Initialising the SPOKE app');
        
        // Initialise the app object
        _.extend(SPOKE, {
            router: new SPOKE.AppRouter(),
            recordings: new SPOKE.RecordingsCollection(),
        });
        
        // Bind events for the whole app
        
        // App resume events
        $(document).on('resume', function() {
            SPOKE.recordings.fetch();
        });

        // Reset events on the recordings collection
        SPOKE.recordings.on('reset', function(models, options) {

            console.log("Recordings collection has been reset");

            // Get a list of the current files
            var gettingFiles = SPOKE.files.getDirectoryEntries(SPOKE.config.filesDirectory);

            gettingFiles.done(function (files) {

                // Go over the models and find the real file, deleting the model
                // if it's not there, ie: it's been deleted outside the app
                SPOKE.recordings.each(function (recording) {
                    var fileExists = false;

                    _.each(files, function(file) {
                        if(file.name === recording.name) {
                            fileExists = true;
                        }
                    });

                    if(!fileExists) {
                        recording.destroy();
                    }
                });

            });

        });

        // Fetch initial data
        SPOKE.recordings.fetch();
        
        // Start routing
        Backbone.history.start();
        
    });

})(SPOKE, Backbone, _, $);