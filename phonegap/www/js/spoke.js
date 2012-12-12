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
    
    function recordPage () {

    	console.log("Binding record page things")
    	
        $("#record-button").on("tap", function(e) {
            e.preventDefault();

            console.log("Record Audio button clicked");

            // We only want to record if we're not already, this
            // could happen with dodgy click/tap/vlick handling or
            // slow phones and angry users
            if(typeof SPOKE.currentRecording === "undefined") {
                // startRecordingAudio wraps the phonegap media creation api in
                // a promise and returns it
                var recordingAudio = startRecordingAudio();

                // Success - save the filename of the file we created
                recordingAudio.done(function() {

                    console.log("Recording audio has finished");
                    console.log("Filename: " + SPOKE.currentRecording.src + " Duration: " + SPOKE.currentRecording.getDuration());

                    SPOKE.recordings.push(SPOKE.currentRecording.src);

                    // TODO - what will we do with this eventually?
                    // For now, just show the filename in a list
                    $("ul#recorded-speeches")
                        .append('<li>' + SPOKE.currentRecording.src + '</li>')
                        .listview('refresh');

                });

                // Failure - nothing specific to do, except tell the user
                recordingAudio.fail(function(error) {
                    console.log("Something went wrong recording the audio: " + error.message);
                });

                // Whatever - delete the global which kept track of the recording
                recordingAudio.always(function () {
                    // Clear the current recording
                    delete SPOKE.currentRecording;
                });
            }
        });

        $("#stop-button").on("tap", function(e) {
            e.preventDefault();

            console.log("Stop audio button clicked");

            // We can only stop if there's something to stop
            if(typeof SPOKE.currentRecording !== "undefined") {
                stopRecordingAudio();
            }
                        
        });
    }
    
    function startRecordingAudio () {
    	
    	console.log("Recording Audio");
        
        // Get a file to record to - iOS needs this, others don't care so much

        // creatingFile and recordingAudio are promises because the Phonegap filesystem apis are
        // asynchronous
    	var creatingFile = createFile(),
            recordingAudio = $.Deferred();

        creatingFile.done( function (file) {

            // We have a FileEntry to play with in file
            console.log("File created: " + file.fullPath);

            // Create a media object to actually do the recording
            // iOS wants the file path to be full, ie: start with file://
            // Android just wants it to be relative to the sdcard folder
            var src = (device.platform === "iPhone") ? file.fullPath : SPOKE.audioDirectory + "/" + file.name;
            var media = new Media(src, recordingAudio.resolve, recordingAudio.reject);
            // Start the recording
            media.startRecord();
            // Save the media object so that we can stop it later
            SPOKE.currentRecording = media;
            // Show a recording interface so people can start/stop the recording
            toggleRecordingControls();

        });

        creatingFile.fail(function(error) {

            // Something went wrong creating the file, and they only give us a code, great.
            console.log("Something went wrong creating a file, error code: " + error.code);

        });

        return recordingAudio;

    }

    function stopRecordingAudio() {

        console.log("Stopping recording");

        var media = SPOKE.currentRecording;

        media.stopRecord();
        
        toggleRecordingControls();

    }

    // Toggle the 'recording/stop recording' controls
    function toggleRecordingControls() {
        $("#record-button").toggle();
        $("#stop-button").toggle();
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
            	
            	console.log("Directory returned: " + directory.fullPath);

            	// Create a new file, the path is relative to the directory we just got
                // Use a timestamp to the nearest millisecond as a unique name
                var timestamp = new Date().getTime();
                path = "recording_" + timestamp + SPOKE.audioFilenameExtension;
                return getFile(directory, path, {create: true, exclusive: true});
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
    	
    	console.log("Getting a file with path: " + path + " in directory: " + directory.fullPath);
    	
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
            recordings: Array()
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