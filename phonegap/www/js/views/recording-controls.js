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
                this.listenTo(SPOKE, "stopRecording", this.render);
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
                "vclick #stop-button": "stop",
                "vclick a.speaker": "record"
            },

            record: function(e) {
                var speaker, recordingAudio;

                e.preventDefault();

                console.log("Record function");

                // Unbind other vclick events, because jquery.one() will bind
                // events once for _each_ element it matched
                this.$el.find("a.speaker").unbind("vclick", this.record);

            	// We only want to record if we're not already, this
		        // could happen with dodgy click/tap/vlick handling or
		        // slow phones and angry users
		        if(typeof this.currentRecording === 'undefined') {
                    // Get the clicked speaker
                    speaker = $(e.target).attr("data-api-url")

		            // startRecording wraps the phonegap media creation api in
		            // a promise and returns it, it also creates a new recording
		            // model instance and saves a global reference to
		            // the current recording media object in this.currentRecording
		            recordingAudio = this.startRecording(speaker);

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
            startRecording: function (speaker) {         	
                
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
                    	name: file.name,
                    	path: file.fullPath,
                        speaker: speaker
                    });

                    // Save a reference to this recording for easy access later
                    that.currentRecording = media;

                    // Trigger the global event to tell everything that recording is happening
                	SPOKE.trigger("startRecording", recording);

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
                    // TODO - it would be nice to send the model object out again now
                    // but what's the nicest way to get a reference to it?
                	SPOKE.trigger("stopRecording", {});
                }

            },

            // Toggle the 'start recording/stop recording' buttons, and timer controls
		    toggleControls: function () {
                $("#intro-title").toggle();
		        $('#stop-button').toggle();
		        $('#timer').toggle();
		    }

        })
    });
})(SPOKE, Backbone, _, $)