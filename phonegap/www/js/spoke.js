/**
 * Spoke/SayIt javascript
 */
 ;( function ($, SPOKE) {

    // Use jQuery Deffered to track when both jquery mobile, phonegap, 
	// and the first page are ready
    var pgReady = $.Deferred(),
        jqmReady = $.Deferred(),
        firstPageReady = $.Deferred();

    /**
     * Functions 
     */

    function speechCaptureSuccess (mediaFiles) {
        console.log("Captured Audio:")
        console.log(mediaFiles[0]);
    }  

    function speechCaptureError (error) {
        console.log("Error capturing audio:");
        console.log(error);
    }
    
    function recordPage () {
    	console.log("Binding record page click handlers")
    	$("#record-button").on("tap", function(e) {
            e.preventDefault();

            console.log("Record Audio button clicked");

            recordAudio();
        });
    }
    
    function recordAudio () {
    	
    	console.log("Recording Audio");
        
        // Get a file to record to - iOS needs this, others don't care so much

        // fileCreated is a promise because the Phonegap filesystem apis are
        // asynchronous
    	creatingFile = createFile();

        creatingFile.done( function (file) {

            // We have a FileEntry to play with in file
            console.log("File created: " + file);

            // TODO - Start the recording

            // TODO - show a recording interface whilst this is happening
            // so people can start/stop the recording
        });

        creatingFile.fail(function(error) {

            // Something went wrong creating the file
            console.log("Something went wrong creating a file: " + error);

        });

    }
    
    // Create a new file to put our recording's into
    function createFile () {
    	
    	console.log("Creating a file");
    	
        // Chain a bunch of promises together to return one thing
        // which encapsulates all the async calls
        return getFileSystem()
            .pipe( function (filesystem) {
            	
            	console.log("Filesystem returned: " + filesystem);
            	
                return getDirectory(filesystem.root, SPOKE.audioDirectory, {create: true});
            })
            .pipe( function (directory) {
            	
            	console.log("Directory returned: " + directory);

            	// Create a new file
                filename = SPOKE.recordingsCounter + SPOKE.audioFilenameExtension;
                return getFile(directory, filename, {create: true, exclusive: true});
            });
    }

    // Wrap the async Phonegap way of getting a filesystem in a promise
    function getFileSystem () {
    	
    	console.log("Getting the file system");
    	
        var filesystem = $.Deferred();

        window.requestFileSystem(
            LocalFileSystem.PERSISTENT, 
            0,
            filesystem.resolve, 
            filesystem.reject
        );

        return filesystem.promise();
    }

    // Wrap the async Phonegap way of getting a directory in a promise
    function getDirectory (rootDirectory, path, options) {
    	
    	console.log("Getting a directory");
    	
        directory = $.Deferred();

        rootDirectory.getDirectory(path, options, directory.resolve, directory.reject);

        return directory.promise();
    }

    // Wrap the async Phonegap way of getting a file in a promise
    function getFile (directory, path, options) {
    	
    	console.log("Getting a file");
    	
        file = $.Deferred();

        directory.getFile(path, options, file.resolve, file.reject);

        return file.promise();
    }

    /**
     * Setup & Bindings
     */

    // Phonegap is ready
    document.addEventListener('deviceready', pgReady.resolve, false);

    // jQuery Mobile is ready
    $(document).on('mobileinit', jqmReady.resolve);
    
    // The first page ever loaded is ready
    $(document).one('pageinit', function(event) {
    	if(event.target.id === "record-page") {
    		firstPageReady.resolve();
    	}
    });

    $.when(jqmReady, pgReady, firstPageReady).then(function() {
        // Everything is ready now
    	console.log("Initialising the SayIt app");

        // Globals
        $.extend(SPOKE, {
            // Details for audio capture
            audioDirectory: "spoke",
            defaultAudioFilename: "recording",
            audioFilenameExtension: (device.platform === "iPhone") ? ".wav" : ".amr",
            recordingsCounter: 1
        });
    	
    	// Fire up the record page manually, because a pageinit will have already
    	// happened for it, but probably before everything else was ready
    	recordPage();
    	
    	// Bind further page initialisation events to do the right stuff for those pages
    	$(document).on('pageinit', function(event) {
	    	switch(event.target.id) {
	            case "record-page":
	                recordPage();
	                break;
	        }
        });
    });

})($, SPOKE);