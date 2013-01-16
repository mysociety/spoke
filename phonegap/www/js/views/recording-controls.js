/**
 * Recording Controls View - shown during a recording
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        RecordingControlsView: Backbone.View.extend({

            template: _.template($("#recording-controls-template").html()),

            speakers: [],

            recordings: [],

            speakerView: null,

            timerView: null,

            liveRecording: null,

            liveMedia: null,

            initialize: function (options) {
                console.log('Recording controls page initialising');
                this.speakers = options.speakers;
                this.recordings = options.recordings;

                // Create a child speakers view that shows up in
                // the #speaker div of our template
                this.speakerView = new SPOKE.SpeakersView({
                    speakers: this.speakers
                });

                // Create a child timer view that shows in #timer
                this.timerView = new SPOKE.TimerView();

                this.listenTo(SPOKE, "startRecording", this.toggleControls);
                this.listenTo(SPOKE, "stopRecording", this.render);

                _.bindAll(this);
            },

            render: function () {
                console.log('Recording controls page rendering');

                this.$el.html(this.template());

                this.speakerView.setElement(this.$("#speakers")).render();

                // Manually bind an event to speaker links.
                // We do this here rather than declaring it in this.events because we
                // want it bound with every new render, but Backbone will only
                // bind the events in this.events when the view is created.
                // We need it bound in every render because we have to bind to
                // *any* speaker link in order to start recording when one is clicked
                // but we only actually want the bound callback to fire once, so we unbind
                // it again in this.record
                this.$el.on("click", "a.speaker", this.record);

                this.timerView.setElement(this.$("#timer")).render();

                // Force jQuery Mobile to do it's stuff to the template html
                this.$el.trigger("pagecreate");

                return this;
            },

            events: {
                "click #stop-button": "stop"
            },

            destroy: function () {
                this.remove();
                this.speakerView.remove();
                this.timerView.remove();
            },

            record: function(e) {
                e.preventDefault();
                var speaker, recordingAudio;

                console.log("Record function");

                // Unbind any more vclick events, because we will have bounnd
                // them to every a.speaker but any that happen from now
                // until the recording stops mean "this speaker is now speaking"
                // not "a new recording is happening" so we don't want this to fire
                // again.
                this.$el.off("click", "a.speaker");

                // We only want to record if we're not already, this
                // could happen with dodgy click/tap/vlick handling or
                // slow phones and angry users
                if(_.isNull(this.liveRecording)) {
                    // Get the clicked speaker
                    speaker = $(e.target).attr("data-api-url");

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

                    var src, media;

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
                    that.liveRecording = new SPOKE.Recording({
                        name: file.name,
                        path: file.fullPath,
                        speaker: speaker
                    });

                    // Save a reference to this recording for easy access later
                    that.liveMedia = media;

                    // Trigger the global event to tell everything that recording is happening
                    SPOKE.trigger("startRecording", that.liveRecording);

                });

                creatingFile.fail(function(error) {
                    // Something went wrong creating the file, and they only give us a code, great.
                    var message = 'Something went wrong creating a file, error code: ' + error.code;
                    console.log(message);
                    navigator.notification.alert(message);
                });

                return recordingAudio;

            },

            // Stop the live recording
            stopRecording: function () {
                var newRecording;

                console.log('Stopping recording');

                console.log(JSON.stringify(this.liveRecording));

                if(!_.isNull(this.liveRecording) && !_.isNull(this.liveMedia)) {
                    this.liveMedia.stopRecord();
                    // Unset the currentMedia variable
                    this.liveMedia = null;
                    // Create a model in the recordings collection for the live recording
                    newRecording = this.recordings.create(this.liveRecording);
                    // Trigger the global event to tell everything that recording has stopped
                    SPOKE.trigger("stopRecording", newRecording);
                    // Now unset it too
                    this.liveRecording = null;
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
})(SPOKE, Backbone, _, $);