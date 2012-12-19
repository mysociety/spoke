/**
 * Recordings page functionality
 */
SPOKE.recordingPage = (function ($, SPOKE) {

    var my = {};

    my.recordPage = function () {

        console.log('Doing record page things');

        SPOKE.showLoading("Loading");
        
        // Populate the list of existing recordings (if there are any)
        // First add a default message to show no current recordings
        emptyRecordingsList();
        // Then get a promise for the real entries
        var gettingEntries = SPOKE.files.getDirectoryEntries(SPOKE.audioDirectory);

        gettingEntries.done(function (entries) {
            var i;
            for(i=0; i<entries.length; i++) {
                // We only care about files, not sub directories
                if(entries[i].isFile) {
                    addRecordingToList(entries[i].name);
                    SPOKE.recordings.push(entries[i].fullPath);
                }
            }
            // Show the upload button too if there are some recordings
            if(entries.length > 0) {
                $('#upload-button').show();
            }
        });

        // Hide the loading message when everything is finished
        $.when(gettingEntries).then(function() {
            SPOKE.hideLoading();
        });

        $('#record-button').on('tap', function(e) {

            e.preventDefault();

            console.log('Record Audio button clicked');            

            // We only want to record if we're not already, this
            // could happen with dodgy click/tap/vlick handling or
            // slow phones and angry users
            if(typeof SPOKE.currentRecording === 'undefined') {
                // startRecordingAudio wraps the phonegap media creation api in
                // a promise and returns it, it also saves a global reference to
                // the current recording in SPOKE.currentRecording
                var recordingAudio = startRecordingAudio();

                // Start a timer to show a rough idea of how much is being recorded
                SPOKE.timer = startTimer();

                // Show a recording interface so people can start/stop the recording
                toggleRecordingControls();

                // Success - save the filename of the file we created
                recordingAudio.done(function() {

                    console.log('Recording audio has finished');
                    console.log('Filename: ' + SPOKE.currentRecording.src + ' Duration: ' + SPOKE.currentRecording.getDuration());

                    // Save the path to the recording in our global list

                    // If we're on android we need to add some stuff to it
                    // because we don't get the full filepath from the media
                    // api, so this is asynchronous again
                    var gettingFilePath = SPOKE.files.getFullFilePath(SPOKE.currentRecording.src);

                    gettingFilePath.done(function (filePath) {
                        SPOKE.recordings.push(filePath);

                        // Add the filename to the list in the app
                        addRecordingToList(SPOKE.currentRecording.src.split('/').pop());

                        // Show the upload button
                        $('#upload-button').show();
                    });

                });

                // Failure - nothing specific to do, except tell the user
                recordingAudio.fail(function(error) {
                    console.log('Something went wrong recording the audio: ' + error.message);
                    navigator.notification.alert('Something went wrong recording the audio: ' + error.message);
                });

                // Whatever - delete the global which kept track of the recording
                // and put the interface back
                recordingAudio.always(function () {
                    
                    // Clear the current recording
                    delete SPOKE.currentRecording;
                    
                    // Stop any timer
                    stopTimer();

                    // Toggle the controls
                    toggleRecordingControls();

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

        $('#upload-button').on('tap', function(e) {
            var uploadingPromises = new Array();

            e.preventDefault();

            console.log('Upload button clicked');

            console.log('Trying to upload the recordings in: ' + SPOKE.recordings);

            SPOKE.showLoading("Uploading...");

            // Do the uploading, looping over each recording in our list
            // Clone the recordings list so that we can operate on the real
            // one whilst iterating over each recording
            var recordingsClone = SPOKE.recordings.slice();

            $.each(recordingsClone, function(index, recording) {

                console.log('Uploading file: ' + recording + " at index " + index);

                // uploadingFiles is, you guessed it, a Promise
                var uploadingFile = SPOKE.files.uploadFile(recording);

                uploadingPromises.push(uploadingFile);

                uploadingFile.done(function (result) {

                    // result.response contains the server response if we want
                    // to do anything with it
                    
                    console.log('File: ' + recording + ' successfully uploaded.');
                    
                    // Delete the file from local disk
                    // Another async process, so another Promise
                    deletingFile = SPOKE.files.deleteFile(recording);
                    
                    deletingFile.done(function () {

                        console.log('File removed successfully');

                        // Update the dom
                        removeRecordingFromList(recording.split("/").pop());

                        // and remove the one in memory
                        SPOKE.recordings.splice(index, 1);

                    });

                    deletingFile.fail(function (error) {
                        console.log('An error occured deleting the file: ' + error.code);
                        navigator.notification.alert('An error occured deleting the file: ' + error.code);
                    });

                });

                uploadingFile.fail(function (error) {
                    console.log('Failed to upload the file: ' + recording + ' error code was: ' + error.code);
                    navigator.notification.alert('Failed to upload the file: ' + recording + ' error code was: ' + error.code);
                });

            });    

            // When all the promises have completed in some way or another
            $.when.apply(null, uploadingPromises).then(function() {
                SPOKE.hideLoading();
            });
        });
    }
    
    // Start recording to a new audio file in the SPOKE app's directory
    // using the Media API
    function startRecordingAudio () {
        
        console.log('Recording Audio');
        
        // Get a file to record to - iOS needs this, others don't care so much

        // creatingFile and recordingAudio are promises because the Phonegap filesystem
        // apis are asynchronous
        var creatingFile = SPOKE.files.createFile(),
            recordingAudio = $.Deferred();

        creatingFile.done( function (file) {

            // We have a FileEntry to play with in file
            console.log('File created: ' + file.fullPath);

            // Create a media object to actually do the recording
            // iOS wants the file path to be full, ie: start with file://
            // Android just wants it to be relative
            var src = (device.platform.match(/(iPhone|iPod|iPad)/)) ? file.fullPath : SPOKE.audioDirectory + "/" + file.name;
            var media = new Media(src, recordingAudio.resolve, recordingAudio.reject);
            // Start the recording
            media.startRecord();
            // Save the media object so that we can stop it later
            SPOKE.currentRecording = media;

        });

        creatingFile.fail(function(error) {

            // Something went wrong creating the file, and they only give us a code, great.
            console.log('Something went wrong creating a file, error code: ' + error.code);
            navigator.notification.alert('Failed to upload the file: ' + recording + ' error code was: ' + error.code);

        });

        return recordingAudio;

    }

    // Stop the current recording - assumes that there is one, so check first!
    function stopRecordingAudio() {

        console.log('Stopping recording');

        var media = SPOKE.currentRecording;
        media.stopRecord();

    }

    // Toggle the 'recording/stop recording' and timer controls
    function toggleRecordingControls() {

        $('#record-button').toggle();
        $('#stop-button').toggle();
        $('#timer').toggle();

    }

    // Add a recording to the html list on the recordings page
    function addRecordingToList(text) {

        console.log('Adding recording: ' + text + ' to recordings list');

        var $list = $('ul#recorded-speeches');

        // Remove the empty message if we're adding the first non-empty
        // recording to the list
        if($list.hasClass('empty') && text !== SPOKE.EMPTY_MESSAGE) {
            $list.empty();
            $list.removeClass('empty');
        }

        $('ul#recorded-speeches')
            .append('<li>' + text + '</li>')
            .listview('refresh');

    }

    // Remove a specific recording from the list on the recordings page
    function removeRecordingFromList(text) {

        console.log("Removing recording: " + text + " from recordings list");
        // Remove the file from the list on the page
        $('ul#recorded-speeches li:contains(' + text + ')').remove();
        // If there's nothing left now, show the empty message
        if($('ul#recorded-speeches li').length == 0) {
            emptyRecordingsList();
        }

    }

    // Empty the recordings list and add a message that it's empty
    function emptyRecordingsList() {

        console.log('Emptying recordings');

        $('ul#recorded-speeches').empty().addClass('empty');
        addRecordingToList(SPOKE.EMPTY_MESSAGE);

        // Hide the upload button too
        $('#upload-button').hide();

    }

    // Start a HH:MM:SS timer which updates three <span> elements and
    // save a reference to it in the global SPOKE object
    function startTimer() {

        console.log('Starting recording timer');

        // Stop any old one, just in case
        stopTimer();

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

        if(typeof SPOKE.timer !== 'undefined') {
            clearInterval(SPOKE.timer);
        }

        $('#seconds').html('00');
        $('#minutes').html('00');
        $('#hours').html('00');

    }

    // Simple function to pad a number to two digits
    function pad ( val ) { 
        return val > 9 ? val : '0' + val; 
    }

    return my;

})($, SPOKE);
