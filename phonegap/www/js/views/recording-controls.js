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
            },

            render: function () {
            	var speakersView;
                console.log('Recording controls page rendering');
                this.$el.html(this.template());
                // Create a child speakers view that shows up in
                // the #speaker div of our template
                speakerView = new SPOKE.SpeakersView({
                    el: this.$el.find("#speakers"),
                    collection: this.collection
                });
                speakerView.render();
                // Force jQuery Mobile to do it's stuff to the template html
                this.$el.trigger("pagecreate");
                return this;
            },

            events: {
            	"vclick #start-button": "startButton",
                "vclick #stop-button": "stopButton"
            },

            startButton: function (e) {
            	e.preventDefault();
            	console.log('Starting recording audio');
            },

            stopButton: function (e) {
                e.preventDefault();
                console.log('Stopping recording audio');
            },

            // Start recording to a new audio file in the SPOKE app's directory
            // using the Media API
            startRecordingAudio: function () {
                
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
                    var src = (device.platform.match(/(iPhone|iPod|iPad)/)) ? file.fullPath : SPOKE.audioDirectory + '/' + file.name;
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

            },

            // Stop the current recording - assumes that there is one, so check first!
            stopRecordingAudio: function () {

                console.log('Stopping recording');

                var media = SPOKE.currentRecording;
                media.stopRecord();

            }

        })
    });
})(SPOKE, Backbone, _, $)