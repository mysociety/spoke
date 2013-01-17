/**
 * Recordings view - A list of recordings
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        RecordingsView: Backbone.View.extend({

            template: _.template($("#recordings-template").html()),

            recordings: [],

            initialize: function (options) {
                console.log('Recordings list initialising');
                this.recordings = options.recordings;
                this.listenTo(this.recordings, "all", this.render);
                _.bindAll(this);
            },

            render: function () {
                console.log('Recordings list rendering');
                console.log(this.recordings.toJSON());
                this.$el.html(this.template({recordings: this.recordings}));
                return this;
            },

            events: {
                "click #upload-button": "uploadButton"
            },

            uploadButton: function (e) {
                e.preventDefault();

                var uploadingPromises = [],
                    that = this;

                console.log('Upload button clicked');

                console.log('Trying to upload the recordings in: ' + this.recordings.toJSON());

                // Do the uploading
                this.recordings.clone().each(function(recording) {

                    console.log('Uploading file: ' + JSON.stringify(recording.toJSON()));

                    params = {};
                    if(!_.isUndefined(recording.get('speakers'))) {
                        params.speakers = recording.get('speakers');
                    }

                    // uploadingFiles is, you guessed it, a Promise
                    var uploadingFile = SPOKE.files.uploadFile(recording.get('path'), params);
                    uploadingPromises.push(uploadingFile);

                    uploadingFile.done(function (result) {

                        // result.response contains the server response if we want
                        // to do anything with it
                        console.log('File: ' + JSON.stringify(recording.toJSON()) + ' successfully uploaded.');

                        // Delete the file from local disk
                        // Another async process, so another Promise
                        deletingFile = SPOKE.files.deleteFile(recording.get('path'));

                        deletingFile.done(function () {
                            console.log('File removed successfully, destroying model');
                            var real_recording = that.recordings.get(recording);
                            real_recording.destroy();
                        });

                        deletingFile.fail(function (error) {
                            var message = 'An error occured deleting the file: ' + recording.toJSON() + ' error was: ' + error.code;
                            console.log(message);
                            navigator.notification.alert(message);
                        });

                    });

                    uploadingFile.fail(function (error) {
                        var message = 'Failed to upload the file: ' + recording + ' error code was: ' + error.code;
                        console.log(message);
                        navigator.notification.alert(message);
                    });

                });

                // When all the promises have completed in some way or another
                $.when.apply(null, uploadingPromises)
                    .done(function () {
                        navigator.notification.alert('All files uploaded');
                    });
            }
        })
    });
})(SPOKE, Backbone, _, $);