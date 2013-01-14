/**
 * Recording Controls View - shown during a recording
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        RecordingControlsView: Backbone.View.extend({

            template: _.template($("#recording-controls-template").html()),

            initialize: function (options) {
                console.log('Recording controls page initialising');
                this.listenTo(this.collection, "all", this.render);
                this.listenTo(SPOKE, "startRecording", this.toggleControls);
                this.listenTo(SPOKE, "stopRecording", this.toggleControls);
                _.bindAll(this);
            },

            render: function () {
            	var speakersView, timerView;

                console.log('Recording controls page rendering');
                
                this.$el.html(this.template());
                
                // Create a child speakers view that shows up in
                // the #speaker div of our template
                speakerView = new SPOKE.SpeakersView({
                    el: this.$el.find("#speakers"),
                    collection: this.collection
                });
                speakerView.render();
                
                // Bind once to a click on any speaker, so we can use that to
                // start recording
                this.$el.find("a.speaker").one("vclick", this.record);

                // Create a child timer view that shows in #timer
                timerView = new SPOKE.TimerView({
                	el: this.$el.find("#timer")
                })
                timerView.render();

                // Force jQuery Mobile to do it's stuff to the template html
                this.$el.trigger("pagecreate");
                
                return this;
            },

            events: {
                "vclick #stop-button": "stop"
            },

            record: function(e) {
                e.preventDefault();

                console.log("Record function");

            	// We only want to record if we're not already, this
		        // could happen with dodgy click/tap/vlick handling or
		        // slow phones and angry users
		        if(typeof this.currentRecording === 'undefined') {
		            // startRecording wraps the phonegap media creation api in
		            // a promise and returns it, it also creates a new recording
		            // model instance and saves a global reference to
		            // the current recording media object in this.currentRecording
		            var recordingAudio = this.startRecording();

                    recordingAudio.done(function() {
                        var message = 'Recording saved!';
                        console.log(message);
                        navigator.notification.alert(message);
                    });

		            // Failure - tell the user
		            recordingAudio.fail(function(error) {
		            	var message = 'Something went wrong recording the audio: ' + error.message;
		                console.log(message);
		                navigator.notification.alert(message);
		            });
		        }
            },

            stop: function(e) {
            	e.preventDefault();
            	this.stopRecording();
            },

            // Start recording to a new audio file in the SPOKE app's directory
            // using the Media API
            startRecording: function () {         	
                
                console.log('Recording Audio');
                
                // Get a file to record to - iOS needs this, others don't care so much

                // creatingFile and recordingAudio are promises because the Phonegap filesystem
                // apis are asynchronous
                var creatingFile = SPOKE.files.createFile(),
                    recordingAudio = $.Deferred(),
                    that = this; // Reference to view object

                creatingFile.done( function (file) {

                	var src, media, recording;

                    // We have a FileEntry to play with in file
                    console.log('File created: ' + file.fullPath);

                    // Create a media object to actually do the recording
                    // iOS wants the file path to be full, ie: start with file://
                    // Android just wants it to be relative
                    src = (device.platform.match(/(iPhone|iPod|iPad)/)) ? file.fullPath : SPOKE.config.filesDirectory + '/' + file.name;
                    media = new Media(src, recordingAudio.resolve, recordingAudio.reject);
                    
                    // Start the recording
                    media.startRecord();

                    // Create a new model instance to hold it
                    recording = SPOKE.recordings.create({
                    	"name": file.name,
                    	"path": file.fullPath
                    });

                    // Save a reference to this recording for easy access later
                    that.currentRecording = media;

                    // Trigger the global event to tell everything that recording is happening
                	SPOKE.trigger("startRecording", {});

                });

                creatingFile.fail(function(error) {
                    // Something went wrong creating the file, and they only give us a code, great.
                    var message = 'Something went wrong creating a file, error code: ' + error.code;
                    console.log(message);
                    navigator.notification.alert(message);
                });

                return recordingAudio;

            },

            // Stop the current recording
            stopRecording: function () {

                console.log('Stopping recording');

                console.log(JSON.stringify(this.currentRecording));

                if(typeof this.currentRecording !== 'undefined') {
                	this.currentRecording.stopRecord();
                	// Unset the currentRecording variable
		            delete this.currentRecording;
                	// Trigger the global event to tell everything that recording has stopped
                	SPOKE.trigger("stopRecording", {});
                }

            },

            // Toggle the 'start recording/stop recording' buttons, and timer controls
		    toggleControls: function () {
		        $('#start-button').toggle();
		        $('#stop-button').toggle();
		        $('#timer').toggle();
		    }

        })
    });
})(SPOKE, Backbone, _, $)