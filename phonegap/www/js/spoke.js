/**
 * Spoke/SayIt javascript
 */
 ;( function ($, SPOKE) {

    // Use jQuery Deffered to track when both jquery mobile, phonegap, 
	// and the first page are ready
    var pgReady = $.Deferred(),
        jqmReady = $.Deferred(),
        firstPageReady = $.Deferred(),
        EMPTY_MESSAGE = 'There are no recordings yet';

    /**
     * Functions 
     */
    
    // Record page functionality
    function recordPage () {

    	console.log('Doing record page things');

        // Show loading message
        $.mobile.loading('show');
    	
        // Populate the list of existing recordings (if there are any)
        // First add a default message to show no current recordings
        emptyRecordingsList();
        // Then get a promise for the real entries
        var gettingEntries = getDirectoryEntries(SPOKE.audioDirectory);

        gettingEntries.done(function (entries) {
            var i;
            for(i=0; i<entries.length; i++) {
                // We only care about files, not sub directories
                if(entries[i].isFile) {
                    addRecordingToList(entries[i].name);
                    SPOKE.recordings.push(entries[i].fullPath);
                }
            }
        });

        gettingEntries.always(function () {
            // Remove the loading message
            $.mobile.loading('hide');
        });

        $('#record-button').on('tap', function(e) {

            e.preventDefault();

            console.log('Record Audio button clicked');

            // We only want to record if we're not already, this
            // could happen with dodgy click/tap/vlick handling or
            // slow phones and angry users
            if(typeof SPOKE.currentRecording === 'undefined') {
                // startRecordingAudio wraps the phonegap media creation api in
                // a promise and returns it
                var recordingAudio = startRecordingAudio();

                // Success - save the filename of the file we created
                recordingAudio.done(function() {

                    console.log('Recording audio has finished');
                    console.log('Filename: ' + SPOKE.currentRecording.src + ' Duration: ' + SPOKE.currentRecording.getDuration());

                    // Save the filename of the recording in our global list
                    SPOKE.recordings.push(SPOKE.currentRecording.src);

                    // TODO - what will we do with this eventually?
                    // For now, just show the filename in a list
                    addRecordingToList(SPOKE.currentRecording.src.replace(SPOKE.audioDirectory + '/', ''));

                });

                // Failure - nothing specific to do, except tell the user
                recordingAudio.fail(function(error) {
                    console.log('Something went wrong recording the audio: ' + error.message);
                });

                // Whatever - delete the global which kept track of the recording
                recordingAudio.always(function () {
                    // Clear the current recording
                    delete SPOKE.currentRecording;
                });
            }
        });

        $('#stop-button').on('tap', function(e) {
            e.preventDefault();

            console.log('Stop audio button clicked');

            // We can only stop if there's something to stop
            if(typeof SPOKE.currentRecording !== 'undefined') {
                stopRecordingAudio();
            }
                        
        });
    }
    
    // Start recording to a new audio file in the SPOKE app's directory
    // using the Media API
    function startRecordingAudio () {
    	
    	console.log('Recording Audio');

        // Show a loading spinner
        $.mobile.loading('show');
        
        // Get a file to record to - iOS needs this, others don't care so much

        // creatingFile and recordingAudio are promises because the Phonegap filesystem apis are
        // asynchronous
    	var creatingFile = createFile(),
            recordingAudio = $.Deferred();

        creatingFile.done( function (file) {

            // We have a FileEntry to play with in file
            console.log('File created: ' + file.fullPath);

            // Create a media object to actually do the recording
            // iOS wants the file path to be full, ie: start with file://
            // Android just wants it to be relative to the sdcard folder
            var src = (device.platform === 'iPhone') ? file.fullPath : SPOKE.audioDirectory + "/" + file.name;
            var media = new Media(src, recordingAudio.resolve, recordingAudio.reject);
            // Start the recording
            media.startRecord();
            // Start a timer to show a rough idea of how much is being recorded
            if(typeof SPOKE.timer !== 'undefined') {
                stopTimer();
            }
            SPOKE.timer = startTimer();
            // Save the media object so that we can stop it later
            SPOKE.currentRecording = media;
            // Show a recording interface so people can start/stop the recording
            toggleRecordingControls();

        });

        creatingFile.fail(function(error) {

            // Something went wrong creating the file, and they only give us a code, great.
            console.log('Something went wrong creating a file, error code: ' + error.code);

        });

        creatingFile.always(function (){
            // Hide the loading spinner
            $.mobile.loading('hide');
        });

        return recordingAudio;

    }

    // Stop the current recording - assumes that there is one, so check first!
    function stopRecordingAudio() {

        console.log('Stopping recording');

        // Show a loading spinner
        $.mobile.loading('show');

        var media = SPOKE.currentRecording;

        media.stopRecord();

        clearInterval(SPOKE.timer);

        toggleRecordingControls();

        // Hide the loading spinner
        $.mobile.loading('hide');

    }

    // Toggle the 'recording/stop recording' and timer controls
    function toggleRecordingControls() {
        $('#record-button').toggle();
        $('#stop-button').toggle();
        $('#timer').toggle();
    }
    
    // Create a new file to put our recording's into. This requires
    // calling several async api functions, so we use .pipe() to 
    // connect them all up, and return the resulting promise object
    function createFile () {
    	
    	console.log('Creating a file');
    	
        // Chain a bunch of promises together to return one thing
        // which encapsulates all the async calls
        return getFileSystem()
            .pipe( function (filesystem) {
            	
            	console.log('Filesystem returned: ' + filesystem);
            	
                return getDirectory(filesystem.root, SPOKE.audioDirectory, {create: true});
            })
            .pipe( function (directory) {
            	
            	console.log('Directory returned: ' + directory.fullPath);

            	// Create a new file, the path is relative to the directory we just got
                // Use a timestamp to the nearest millisecond as a unique name
                var timestamp = new Date().getTime();
                path = 'recording_' + timestamp + SPOKE.audioFilenameExtension;
                return getFile(directory, path, {create: true, exclusive: true});
            });
    }

    // Wrap the async Phonegap way of getting a filesystem in a promise
    function getFileSystem () {
    	
    	console.log('Getting the file system');
    	
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
    	
    	console.log('Getting a directory');
    	
        directory = $.Deferred();

        rootDirectory.getDirectory(path, options, directory.resolve, directory.reject);

        return directory.promise();
    }

    // Wrap the async Phonegap way of getting a file in a promise
    function getFile (directory, path, options) {
    	
    	console.log('Getting a file with path: ' + path + ' in directory: ' + directory.fullPath);
    	
        file = $.Deferred();

        directory.getFile(path, options, file.resolve, file.reject);

        return file.promise();
    }

    // Get a list of files in a directory and return a promise which
    // wraps the appropriate asynchronous phonegap api call
    function getDirectoryEntries(dirName) {

        console.log('Getting directory entries for directory: ' + dirName);

        // Get the list of recordings currently on the device, we
        // need to make several async calls to do this, so we use
        // .pipe() to connect them up and return the resulting promise
        return getFileSystem()
            .pipe(function (filesystem) {
                return getDirectory(filesystem.root, dirName);
            })
            .pipe(function (directory) {
                var directoryReader = directory.createReader();
                var gettingEntries = $.Deferred();

                directoryReader.readEntries(gettingEntries.resolve, gettingEntries.reject);
                
                return gettingEntries.promise();
            });
    }

    // Add a recording to the html list on the recordings page
    function addRecordingToList(text) {

        console.log('Adding recording: ' + text + ' to recordings list');

        var $list = $('ul#recorded-speeches');

        // Remove the empty message if we're adding the first non-empty
        // recording to the list
        if($list.hasClass('empty') && text !== EMPTY_MESSAGE) {
            $list.empty();
            $list.removeClass('empty');
        }

        $('ul#recorded-speeches')
            .append('<li>' + text + '</li>')
            .listview('refresh');
    }

    // Empty the recordings list and add a message that it's empty
    function emptyRecordingsList() {

        console.log('Emptying recordings');

        $('ul#recorded-speeches').empty().addClass('empty');
        addRecordingToList(EMPTY_MESSAGE);
    }

    // Start a HH:MM:SS timer which updates three <span> elements and
    // save a reference to it in the global SPOKE object
    function startTimer() {

        console.log('Starting recording timer');

        var sec = 0;
        return setInterval( function(){
            $('#seconds').html(pad(++sec % 60));
            $('#minutes').html(pad(parseInt(sec / 60, 10)));
            $('#hours').html(pad(parseInt(sec / (60 * 60), 10)));
        }, 1000);
    }

    // Stop the timer and blank the values it holds
    function stopTimer() {
        
        console.log('Stopping recording timer');

        clearInterval(SPOKE.timer);

        $('#seconds').html('00');
        $('#minutes').html('00');
        $('#hours').html('00');
    }

    // Simple function to pad a number to two digits
    function pad ( val ) { 
        return val > 9 ? val : '0' + val; 
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
    	if(event.target.id === 'record-page') {
    		firstPageReady.resolve();
    	}
    });

    $.when(jqmReady, pgReady, firstPageReady).then(function() {
        // Everything is ready now
    	console.log('Initialising the SayIt app');

        // Globals
        $.extend(SPOKE, {
            // Details for audio capture
            audioDirectory: 'spoke',
            audioFilenameExtension: (device.platform === 'iPhone') ? '.wav' : '.amr',
            recordings: Array()
        });
    	
    	// Fire up the record page manually, because a pageinit will have already
    	// happened for it, but before everything else was ready
    	recordPage();
    	
    	// Bind further page initialisation events to do the right stuff for those pages
    	$(document).on('pageinit', function(event) {
	    	switch(event.target.id) {
	            case 'record-page':
	                recordPage();
	                break;
	        }
        });
    });

})($, SPOKE);